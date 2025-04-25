import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { DataSource, QueryRunner } from 'typeorm';

import { PaginatedTransactionHistoryDto, TransactionResponseDto } from '../dto/transaction.dto';
import { Account } from '../entities/account.entity';
import { Commission } from '../entities/commission.entity';
import { Transaction } from '../entities/transaction.entity';
import { AccountRepository } from '../repositories/account.repository';
import { TransactionRepository } from '../repositories/transaction.repository';

@Injectable()
export class TransactionService {
  constructor(
    private dataSource: DataSource,
    private accountRepository: AccountRepository,
    private transactionRepository: TransactionRepository,
  ) {}

  private async getSystemAccount(queryRunner: QueryRunner): Promise<Account> {
    const systemAccount = await queryRunner.manager.findOne(Account, {
      where: { accountNumber: '0000000001' },
      lock: { mode: 'pessimistic_write' },
    });

    if (!systemAccount) {
      throw new Error('Cuenta del sistema no encontrada');
    }

    return systemAccount;
  }

  async createTransaction(
    originId: number,
    destinationAccountNumber: string,
    amount: number,
    userId: number,
  ): Promise<TransactionResponseDto> {
    if (amount < 0.1) {
      throw new BadRequestException('El monto mínimo de transferencia es S/ 0.10');
    }

    // Verificar propiedad de la cuenta origen
    const originAccount = await this.accountRepository.findOne({
      where: { id: originId },
      relations: ['user'],
    });

    if (!originAccount || originAccount.user.id !== userId) {
      throw new UnauthorizedException(
        'No tienes permiso para realizar operaciones desde esta cuenta',
      );
    }

    // Verificar que la cuenta destino existe
    const destinationAccount = await this.accountRepository.findOne({
      where: { accountNumber: destinationAccountNumber },
    });

    if (!destinationAccount) {
      throw new NotFoundException('Cuenta de destino no encontrada');
    }

    // Verificar que no sea la misma cuenta
    if (originAccount.accountNumber === destinationAccountNumber) {
      throw new BadRequestException('No se puede transferir a la misma cuenta');
    }

    // Iniciamos una transacción usando QueryRunner
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Bloqueamos las cuentas involucradas
      await queryRunner.query('SELECT pg_advisory_xact_lock($1)', [originId]);
      await queryRunner.query('SELECT pg_advisory_xact_lock($1)', [destinationAccount.id]);

      // Primero obtenemos las cuentas con bloqueo
      const [originAccountLocked, destinationAccountLocked] = await Promise.all([
        queryRunner.manager
          .createQueryBuilder(Account, 'account')
          .setLock('pessimistic_write')
          .innerJoinAndSelect('account.user', 'user')
          .where('account.id = :id', { id: originId })
          .getOne(),
        queryRunner.manager
          .createQueryBuilder(Account, 'account')
          .setLock('pessimistic_write')
          .innerJoinAndSelect('account.user', 'user')
          .where('account.id = :id', { id: destinationAccount.id })
          .getOne(),
      ]);

      // Calculamos la comisión total (1% con mínimo de S/ 0.01)
      let totalCommission = Number((amount * 0.01).toFixed(2));
      totalCommission = Math.max(0.01, totalCommission);

      // Verificar saldo incluyendo la comisión
      if (originAccountLocked.balance < amount + totalCommission) {
        throw new BadRequestException('Saldo insuficiente (incluye comisión del 1%)');
      }

      // Aseguramos que todos los valores sean números
      const currentBalance = Number(originAccountLocked.balance);
      const destBalance = Number(destinationAccountLocked.balance);

      // Dividimos la comisión en dos partes iguales
      const halfCommission = Number((totalCommission / 2).toFixed(2));
      const remainingCommission = Number((totalCommission - halfCommission).toFixed(2));

      // Actualizamos el saldo de la cuenta origen (monto + comisión)
      originAccountLocked.balance = Number((currentBalance - amount - totalCommission).toFixed(2));
      await queryRunner.manager.save(originAccountLocked);

      // Actualizamos el saldo de la cuenta destino (recibe el monto completo)
      destinationAccountLocked.balance = Number((destBalance + amount).toFixed(2));
      await queryRunner.manager.save(destinationAccountLocked);

      // Obtenemos la cuenta del sistema
      const systemAccount = await this.getSystemAccount(queryRunner);
      const systemBalance = Number(systemAccount.balance);

      // Creamos la transacción principal (sin incluir las comisiones)
      const transaction = new Transaction();
      transaction.amount = amount;
      transaction.commission = totalCommission;
      transaction.date = new Date();
      transaction.originAccount = originAccountLocked;
      transaction.destinationAccount = destinationAccountLocked;
      await queryRunner.manager.save(transaction);

      // Preparar la respuesta que devolveremos
      const response: TransactionResponseDto = {
        amount: transaction.amount,
        commission: transaction.commission,
        date: transaction.date,
        destinationName: destinationAccountLocked.user.name,
        destinationAccountNumber: destinationAccountLocked.accountNumber,
      };

      // Si la cuenta origen tiene referido, distribuimos la comisión
      if (originAccountLocked.referred_by > 0) {
        const referrerAccount = await queryRunner.manager.findOne(Account, {
          where: { id: originAccountLocked.referred_by },
          lock: { mode: 'pessimistic_write' },
        });

        if (referrerAccount) {
          // Actualizar saldo del referidor
          const referrerBalance = Number(referrerAccount.balance);
          referrerAccount.balance = Number((referrerBalance + halfCommission).toFixed(2));
          await queryRunner.manager.save(referrerAccount);

          // Registrar comisión del referidor
          const referrerCommission = new Commission();
          referrerCommission.amount = halfCommission;
          referrerCommission.date = new Date();
          referrerCommission.account = referrerAccount;
          referrerCommission.transaction = transaction;
          await queryRunner.manager.save(referrerCommission);
        }

        // La otra mitad va al sistema
        systemAccount.balance = Number((systemBalance + remainingCommission).toFixed(2));
        await queryRunner.manager.save(systemAccount);

        // Registrar comisión del sistema
        const systemCommission = new Commission();
        systemCommission.amount = remainingCommission;
        systemCommission.date = new Date();
        systemCommission.account = systemAccount;
        systemCommission.transaction = transaction;
        await queryRunner.manager.save(systemCommission);
      } else {
        // Si no hay referido, toda la comisión va al sistema
        systemAccount.balance = Number((systemBalance + totalCommission).toFixed(2));
        await queryRunner.manager.save(systemAccount);

        // Registrar comisión completa para el sistema
        const systemCommission = new Commission();
        systemCommission.amount = totalCommission;
        systemCommission.date = new Date();
        systemCommission.account = systemAccount;
        systemCommission.transaction = transaction;
        await queryRunner.manager.save(systemCommission);
      }

      // Confirmar la transacción
      await queryRunner.commitTransaction();

      return response;
    } catch (error) {
      await queryRunner.rollbackTransaction();

      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException ||
        error instanceof UnauthorizedException
      ) {
        throw error;
      }

      console.error('Error en la transacción:', error);
      throw new BadRequestException('Error al procesar la transacción');
    } finally {
      await queryRunner.release();
    }
  }

  async getTransactionHistory(userId: number): Promise<Transaction[]> {
    const accounts = await this.accountRepository.findByUserId(userId);

    if (!accounts.length) {
      throw new NotFoundException('Usuario no tiene cuentas asociadas');
    }

    const accountIds = accounts.map((account) => account.id);
    return this.transactionRepository.findTransactionsByUserAccounts(accountIds);
  }

  async getTransactionHistoryPaginated(
    accountId: number,
    userId: number,
    page: number = 1,
  ): Promise<PaginatedTransactionHistoryDto> {
    // Verificar propiedad de la cuenta
    const account = await this.accountRepository.findOne({
      where: { id: accountId, user: { id: userId } },
    });

    if (!account) {
      throw new UnauthorizedException('No tienes permiso para acceder a esta cuenta');
    }

    const result = await this.transactionRepository.findPaginatedTransactionHistory(
      accountId,
      page,
    );

    // Transformar las transacciones al formato requerido, excluyendo transacciones con la cuenta del sistema
    const transformedTransactions = result.transactions
      .filter((transaction) => {
        const systemAccount =
          transaction.originAccount.accountNumber === '0000000001' ||
          transaction.destinationAccount.accountNumber === '0000000001';
        return !systemAccount;
      })
      .map((transaction) => {
        const isOutgoing = transaction.originAccount.id === accountId;
        const contact = isOutgoing
          ? transaction.destinationAccount.user
          : transaction.originAccount.user;

        return {
          amount: isOutgoing ? -transaction.amount : transaction.amount,
          commission: transaction.commission,
          date: transaction.date,
          contactName: contact.name,
        };
      });

    return {
      transactions: transformedTransactions,
      total: result.total,
      page: result.page,
      totalPages: result.totalPages,
    };
  }
}
