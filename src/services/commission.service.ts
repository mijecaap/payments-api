import { Injectable, UnauthorizedException } from '@nestjs/common';

import { PaginatedCommissionsResponseDto } from '../dto/commission.dto';
import { AccountRepository } from '../repositories/account.repository';
import { CommissionRepository } from '../repositories/commission.repository';

@Injectable()
export class CommissionService {
  constructor(
    private commissionRepository: CommissionRepository,
    private accountRepository: AccountRepository,
  ) {}

  async getCommissionsByAccount(
    accountId: number,
    userId: number,
    page: number = 1,
  ): Promise<PaginatedCommissionsResponseDto> {
    // Verificar propiedad de la cuenta
    const account = await this.accountRepository.findOne({
      where: { id: accountId, user: { id: userId } },
    });

    if (!account) {
      throw new UnauthorizedException('No tienes permiso para acceder a esta cuenta');
    }

    const result = await this.commissionRepository.findPaginatedCommissions(accountId, page);
    const totalCommissionsAmount =
      await this.commissionRepository.getTotalCommissionsByAccount(accountId);

    const commissionsList = result.commissions.map((commission) => ({
      id: commission.id,
      amount: commission.amount,
      date: commission.date,
      originUserName: commission.transaction.originAccount.user.name,
      originAccountNumber: commission.transaction.originAccount.accountNumber,
      transactionAmount: commission.transaction.amount,
    }));

    const total =
      typeof totalCommissionsAmount === 'string'
        ? Number(totalCommissionsAmount)
        : Number(totalCommissionsAmount || 0);

    return {
      commissions: commissionsList,
      totalCommissions: Number(total.toFixed(2)),
      total: result.total,
      page: result.page,
      totalPages: result.totalPages,
    };
  }
}
