import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { DataSource, QueryRunner } from 'typeorm';

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
    destId: number,
    amount: number,
    userId: number,
  ): Promise<Transaction> {
    if (amount < 0.1) {
      throw new BadRequestException('El monto mínimo de transferencia es S/ 0.10');
    }
    if (originId === destId) {
      throw new BadRequestException('No se puede transferir a la misma cuenta');
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

    // Iniciamos una transacción usando QueryRunner
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Bloqueamos las cuentas involucradas usando pg_advisory_xact_lock
      await queryRunner.query('SELECT pg_advisory_xact_lock($1)', [originId]);
      await queryRunner.query('SELECT pg_advisory_xact_lock($1)', [destId]);

      // Obtenemos las cuentas con FOR UPDATE para bloqueo a nivel de fila
      const originAccountLocked = await queryRunner.manager.findOne(Account, {
        where: { id: originId },
        lock: { mode: 'pessimistic_write' },
      });
      const destinationAccount = await queryRunner.manager.findOne(Account, {
        where: { id: destId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!destinationAccount) {
        throw new NotFoundException('Cuenta de destino no encontrada');
      }

      if (originAccountLocked.balance < amount) {
        throw new BadRequestException('Saldo insuficiente');
      }

      // Aseguramos que todos los valores sean números
      const currentBalance = Number(originAccountLocked.balance);
      const destBalance = Number(destinationAccount.balance);
      amount = Number(amount);

      // Calculamos la comisión total (1% con mínimo de S/ 0.01)
      let totalCommission = Number((amount * 0.01).toFixed(2));
      totalCommission = Math.max(0.01, totalCommission); // Establecemos el mínimo en S/ 0.01
      const transferAmount = Number((amount - totalCommission).toFixed(2));

      // Dividimos la comisión en dos partes iguales
      const halfCommission = Number((totalCommission / 2).toFixed(2));
      const remainingCommission = Number((totalCommission - halfCommission).toFixed(2)); // Por si hay un centavo extra por redondeo

      // Actualizamos el saldo de la cuenta origen
      originAccountLocked.balance = Number((currentBalance - amount).toFixed(2));
      await queryRunner.manager.save(originAccountLocked);

      // Actualizamos el saldo de la cuenta destino
      destinationAccount.balance = Number((destBalance + transferAmount).toFixed(2));
      await queryRunner.manager.save(destinationAccount);

      // Obtenemos la cuenta del sistema
      const systemAccount = await this.getSystemAccount(queryRunner);
      const systemBalance = Number(systemAccount.balance);
      systemAccount.balance = Number((systemBalance + remainingCommission).toFixed(2));
      await queryRunner.manager.save(systemAccount);

      // Si la cuenta origen tiene referido, le damos su parte de la comisión
      if (originAccountLocked.referred_by > 0) {
        const referrerAccount = await queryRunner.manager.findOne(Account, {
          where: { id: originAccountLocked.referred_by },
          lock: { mode: 'pessimistic_write' },
        });

        if (referrerAccount) {
          const referrerBalance = Number(referrerAccount.balance);
          referrerAccount.balance = Number((referrerBalance + halfCommission).toFixed(2));
          await queryRunner.manager.save(referrerAccount);
        }
      } else {
        // Si no hay referido, todo va a la cuenta del sistema
        systemAccount.balance = Number((systemBalance + halfCommission).toFixed(2));
        await queryRunner.manager.save(systemAccount);
      }

      // Creamos la transacción
      const transaction = new Transaction();
      transaction.amount = amount;
      transaction.commission = totalCommission;
      transaction.date = new Date();
      transaction.originAccount = originAccountLocked;
      transaction.destinationAccount = destinationAccount;
      await queryRunner.manager.save(transaction);

      // Creamos el registro de comisión para el sistema
      const systemCommission = new Commission();
      systemCommission.amount =
        originAccountLocked.referred_by === 0
          ? Number(totalCommission.toFixed(2))
          : Number(remainingCommission.toFixed(2));
      systemCommission.date = new Date();
      systemCommission.account = systemAccount;
      systemCommission.transaction = transaction;
      await queryRunner.manager.save(systemCommission);

      // Si hay cuenta referidora, creamos su registro de comisión
      if (originAccountLocked.referred_by > 0) {
        const referrerAccount = await queryRunner.manager.findOne(Account, {
          where: { id: originAccountLocked.referred_by },
        });

        if (referrerAccount) {
          const referrerCommission = new Commission();
          referrerCommission.amount = halfCommission;
          referrerCommission.date = new Date();
          referrerCommission.account = referrerAccount;
          referrerCommission.transaction = transaction;
          await queryRunner.manager.save(referrerCommission);
        }
      }

      // Confirmamos la transacción
      await queryRunner.commitTransaction();

      return transaction;
    } catch (error) {
      // Revertimos la transacción en caso de error
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
      // Liberamos el queryRunner
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
}
