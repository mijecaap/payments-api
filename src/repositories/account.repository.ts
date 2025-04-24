import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { DataSource, Repository, In } from 'typeorm';

import { Account } from '../entities/account.entity';

/**
 * Repositorio para manejar las operaciones de base de datos relacionadas con cuentas
 */
@Injectable()
export class AccountRepository extends Repository<Account> {
  constructor(private dataSource: DataSource) {
    super(Account, dataSource.createEntityManager());
  }

  /**
   * Encuentra todas las cuentas asociadas a un usuario
   * @param userId - ID del usuario
   * @returns Lista de cuentas del usuario con su información
   * @throws {Error} Si hay un error en la consulta a la base de datos
   */
  async findByUserId(userId: number): Promise<Account[]> {
    try {
      return await this.find({
        where: { user: { id: userId } },
        relations: ['user'],
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      throw new InternalServerErrorException(
        `Error al buscar cuentas para el usuario ${userId}: ${message}`,
      );
    }
  }

  /**
   * Encuentra todas las cuentas que han sido referidas por las cuentas especificadas
   * @param referrerIds - Array de IDs de cuentas referidoras
   * @returns Lista de cuentas que han sido referidas
   * @throws {Error} Si hay un error en la consulta a la base de datos
   */
  async findReferredAccounts(referrerIds: number[]): Promise<Account[]> {
    try {
      return await this.find({
        where: { referred_by: In(referrerIds) },
        relations: ['user'],
      });
    } catch (error: unknown) {
      const idsString = referrerIds.join(', ');
      const message = error instanceof Error ? error.message : 'Error desconocido';
      throw new InternalServerErrorException(
        `Error al buscar cuentas referidas por [${idsString}]: ${message}`,
      );
    }
  }

  /**
   * Encuentra las cuentas que refirieron a otras cuentas
   * @param referredByIds - Array de IDs de cuentas que fueron referidas
   * @returns Lista de cuentas referidoras
   * @throws {Error} Si hay un error en la consulta a la base de datos
   */
  async findReferrerAccounts(referredByIds: number[]): Promise<Account[]> {
    try {
      return await this.find({
        where: { id: In(referredByIds) },
        relations: ['user'],
      });
    } catch (error: unknown) {
      const idsString = referredByIds.join(', ');
      const message = error instanceof Error ? error.message : 'Error desconocido';
      throw new InternalServerErrorException(
        `Error al buscar cuentas referidoras [${idsString}]: ${message}`,
      );
    }
  }
}
