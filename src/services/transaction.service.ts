import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Account } from '../entities/account.entity';
import { Transaction } from '../entities/transaction.entity';
import { Commission } from '../entities/commission.entity';

@Injectable()
export class TransactionService {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(Account)
    private accountRepository: Repository<Account>,
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    @InjectRepository(Commission)
    private commissionRepository: Repository<Commission>,
  ) {}

  async createTransaction(originId: number, destId: number, amount: number): Promise<Transaction> {
    // Validaciones iniciales
    if (amount <= 0) {
      throw new BadRequestException('El monto debe ser mayor a 0');
    }
    if (originId === destId) {
      throw new BadRequestException('No se puede transferir a la misma cuenta');
    }

    // Iniciamos una transacción usando QueryRunner
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Bloqueamos las cuentas involucradas usando pg_advisory_xact_lock
      // Usamos los IDs de las cuentas como keys para el bloqueo
      await queryRunner.query('SELECT pg_advisory_xact_lock($1)', [originId]);
      await queryRunner.query('SELECT pg_advisory_xact_lock($1)', [destId]);

      // Obtenemos las cuentas con FOR UPDATE para bloqueo a nivel de fila
      const originAccount = await queryRunner.manager.findOne(Account, {
        where: { id: originId },
        lock: { mode: 'pessimistic_write' },
      });
      const destinationAccount = await queryRunner.manager.findOne(Account, {
        where: { id: destId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!originAccount || !destinationAccount) {
        throw new NotFoundException('Una o ambas cuentas no existen');
      }

      if (originAccount.balance < amount) {
        throw new BadRequestException('Saldo insuficiente');
      }

      // Calculamos la comisión (1%)
      const commissionAmount = Math.floor(amount * 0.01);
      const transferAmount = amount - commissionAmount;

      // Actualizamos los saldos
      originAccount.balance -= amount;
      destinationAccount.balance += transferAmount;

      // Guardamos las cuentas actualizadas
      await queryRunner.manager.save(originAccount);
      await queryRunner.manager.save(destinationAccount);

      // Creamos la transacción
      const transaction = new Transaction();
      transaction.amount = amount;
      transaction.commission = commissionAmount;
      transaction.date = new Date();
      transaction.originAccount = originAccount;
      transaction.destinationAccount = destinationAccount;

      await queryRunner.manager.save(transaction);

      // Creamos el registro de comisión
      const commission = new Commission();
      commission.amount = commissionAmount;
      commission.date = new Date();
      commission.account = destinationAccount;
      commission.transaction = transaction;

      await queryRunner.manager.save(commission);

      // Confirmamos la transacción
      await queryRunner.commitTransaction();
      
      return transaction;

    } catch (error) {
      // Revertimos la transacción en caso de error
      await queryRunner.rollbackTransaction();
      
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      
      throw new BadRequestException('Error al procesar la transacción');

    } finally {
      // Liberamos el queryRunner
      await queryRunner.release();
    }
  }
}