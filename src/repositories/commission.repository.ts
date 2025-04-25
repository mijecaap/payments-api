import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';

import { Commission } from '../entities/commission.entity';

/**
 * Repositorio para manejar las operaciones de base de datos relacionadas con comisiones
 */
@Injectable()
export class CommissionRepository extends Repository<Commission> {
  constructor(private dataSource: DataSource) {
    super(Commission, dataSource.createEntityManager());
  }

  /**
   * Encuentra todas las comisiones paginadas para una cuenta específica
   * @param accountId - ID de la cuenta
   * @param page - Número de página
   * @param limit - Límite de registros por página
   * @returns Lista paginada de comisiones con sus relaciones
   * @throws {Error} Si hay un error en la consulta a la base de datos
   */
  async findPaginatedCommissions(
    accountId: number,
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    commissions: Commission[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    try {
      const skip = (page - 1) * limit;

      const [commissions, total] = await this.createQueryBuilder('commission')
        .leftJoinAndSelect('commission.account', 'account')
        .leftJoinAndSelect('commission.transaction', 'transaction')
        .leftJoinAndSelect('transaction.originAccount', 'originAccount')
        .leftJoinAndSelect('originAccount.user', 'originUser')
        .where('commission.accountId = :accountId', { accountId })
        .orderBy('commission.date', 'DESC')
        .skip(skip)
        .take(limit)
        .getManyAndCount();

      return {
        commissions,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      throw new InternalServerErrorException(
        `Error al buscar comisiones paginadas para la cuenta ${accountId}: ${message}`,
      );
    }
  }

  /**
   * Calcula el total de comisiones para una cuenta específica
   */
  async getTotalCommissionsByAccount(accountId: number): Promise<number> {
    try {
      const result = await this.createQueryBuilder('commission')
        .where('commission.accountId = :accountId', { accountId })
        .select('COALESCE(SUM(commission.amount), 0)', 'total')
        .getRawOne<{ total: number }>();

      return result.total;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      throw new InternalServerErrorException(
        `Error al calcular comisiones para la cuenta ${accountId}: ${message}`,
      );
    }
  }
}
