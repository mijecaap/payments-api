import { Injectable } from '@nestjs/common';

import { Commission } from '../entities/commission.entity';
import { CommissionRepository } from '../repositories/commission.repository';

@Injectable()
export class CommissionService {
  constructor(private commissionRepository: CommissionRepository) {}

  async getCommissions(): Promise<Commission[]> {
    return this.commissionRepository.findAllWithRelations();
  }
}
