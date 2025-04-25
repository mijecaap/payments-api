import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';

import { Transaction } from '../entities/transaction.entity';

/**
 * Repositorio para manejar las operaciones de base de datos relacionadas con transacciones
 */
@Injectable()
export class TransactionRepository extends Repository<Transaction> {
  constructor(private dataSource: DataSource) {
    super(Transaction, dataSource.createEntityManager());
  }

  /**
   * Encuentra todas las transacciones asociadas a un conjunto de cuentas
   * @param accountIds - Array de IDs de cuentas
   * @returns Lista de transacciones donde las cuentas especificadas son origen o destino
   * @throws {Error} Si hay un error en la consulta a la base de datos
   */
  async findTransactionsByUserAccounts(accountIds: number[]): Promise<Transaction[]> {
    try {
      return await this.createQueryBuilder('transaction')
        .leftJoinAndSelect('transaction.originAccount', 'originAccount')
        .leftJoinAndSelect('transaction.destinationAccount', 'destinationAccount')
        .select([
          'transaction.id',
          'transaction.amount',
          'transaction.commission',
          'transaction.date',
          'originAccount.id',
          'destinationAccount.id',
        ])
        .where('originAccount.id IN (:...accountIds)', { accountIds })
        .orWhere('destinationAccount.id IN (:...accountIds)', { accountIds })
        .orderBy('transaction.date', 'DESC')
        .getMany();
    } catch (error: unknown) {
      const idsString = accountIds.join(', ');
      const message = error instanceof Error ? error.message : 'Error desconocido';
      throw new InternalServerErrorException(
        `Error al buscar transacciones para las cuentas [${idsString}]: ${message}`,
      );
    }
  }

  /**
   * Encuentra todas las transacciones con información detallada de usuarios
   * @param accountIds - Array de IDs de cuentas
   * @returns Lista de transacciones con información completa de usuarios origen y destino
   * @throws {Error} Si hay un error en la consulta a la base de datos
   */
  async findTransactionsWithUsers(accountIds: number[]): Promise<Transaction[]> {
    try {
      return await this.createQueryBuilder('transaction')
        .leftJoinAndSelect('transaction.originAccount', 'originAccount')
        .leftJoinAndSelect('transaction.destinationAccount', 'destinationAccount')
        .leftJoinAndSelect('originAccount.user', 'originUser')
        .leftJoinAndSelect('destinationAccount.user', 'destinationUser')
        .where('originAccount.id IN (:...accountIds)', { accountIds }) // Solo busca transacciones donde las cuentas son origen
        .orderBy('transaction.date', 'DESC')
        .getMany();
    } catch (error: unknown) {
      const idsString = accountIds.join(', ');
      const message = error instanceof Error ? error.message : 'Error desconocido';
      throw new InternalServerErrorException(
        `Error al buscar transacciones con usuarios para las cuentas [${idsString}]: ${message}`,
      );
    }
  }

  async findPaginatedTransactionHistory(
    accountId: number,
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    transactions: Transaction[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    try {
      const skip = (page - 1) * limit;

      const [transactions, total] = await this.createQueryBuilder('transaction')
        .leftJoinAndSelect('transaction.originAccount', 'originAccount')
        .leftJoinAndSelect('transaction.destinationAccount', 'destinationAccount')
        .leftJoinAndSelect('originAccount.user', 'originUser')
        .leftJoinAndSelect('destinationAccount.user', 'destinationUser')
        .where('originAccount.id = :accountId OR destinationAccount.id = :accountId', { accountId })
        .orderBy('transaction.date', 'DESC')
        .skip(skip)
        .take(limit)
        .getManyAndCount();

      return {
        transactions,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      throw new InternalServerErrorException(
        `Error al buscar el historial de transacciones para la cuenta ${accountId}: ${message}`,
      );
    }
  }
}
