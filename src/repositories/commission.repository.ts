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
   * Encuentra todas las comisiones con sus relaciones
   * @returns Lista de comisiones con información de cuenta y transacción
   * @throws {Error} Si hay un error en la consulta a la base de datos
   */
  async findAllWithRelations(): Promise<Commission[]> {
    try {
      return await this.find({
        relations: ['account', 'transaction'],
        order: { date: 'DESC' },
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      throw new InternalServerErrorException(`Error al buscar comisiones: ${message}`);
    }
  }

  /**
   * Calcula el total de comisiones para una cuenta específica
   * @param accountId - ID de la cuenta
   * @returns Total de comisiones generadas por la cuenta
   * @throws {Error} Si hay un error en la consulta a la base de datos
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
