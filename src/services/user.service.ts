import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UserInfoDto } from '../dto/user.dto';
import { Account } from '../entities/account.entity';
import { Commission } from '../entities/commission.entity';
import { Transaction } from '../entities/transaction.entity';
import { User } from '../entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Account)
    private accountRepository: Repository<Account>,
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    @InjectRepository(Commission)
    private commissionRepository: Repository<Commission>,
  ) {}

  async getUserInfo(targetUserId: number, currentUserId: number): Promise<UserInfoDto> {
    // Validar que no se consulte el propio usuario
    if (targetUserId === currentUserId) {
      throw new BadRequestException('No puedes consultar tu propia información');
    }

    // Validar que no se consulte el usuario del sistema (ID 1 según el seed)
    if (targetUserId === 1) {
      throw new BadRequestException('No puedes consultar la información del usuario del sistema');
    }

    // Obtener el usuario objetivo y sus cuentas
    const targetUser = await this.userRepository.findOne({
      where: { id: targetUserId },
      relations: ['accounts'],
    });

    if (!targetUser) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Obtener las cuentas del usuario actual
    const currentUserAccounts = await this.accountRepository.find({
      where: { user: { id: currentUserId } },
    });

    // Obtener las cuentas del usuario objetivo
    const targetUserAccounts = await this.accountRepository.find({
      where: { user: { id: targetUserId } },
    });

    // Verificar si alguna cuenta del usuario objetivo fue referida por alguna cuenta del usuario actual
    const isReferred = targetUserAccounts.some((targetAccount) =>
      currentUserAccounts.some((currentAccount) => targetAccount.referred_by === currentAccount.id),
    );

    // Verificar si alguna cuenta del usuario actual fue referida por alguna cuenta del usuario objetivo
    const isReferrer = currentUserAccounts.some((currentAccount) =>
      targetUserAccounts.some((targetAccount) => currentAccount.referred_by === targetAccount.id),
    );

    // Obtener total de transacciones realizadas al usuario objetivo
    const transactions = await this.transactionRepository
      .createQueryBuilder('transaction')
      .where('transaction.originAccount.id IN (:...currentAccountIds)', {
        currentAccountIds: currentUserAccounts.map((a) => a.id),
      })
      .andWhere('transaction.destinationAccount.id IN (:...targetAccountIds)', {
        targetAccountIds: targetUserAccounts.map((a) => a.id),
      })
      .getCount();

    // Calcular el total de comisiones generadas
    const commissions: { total: string | null } = await this.commissionRepository
      .createQueryBuilder('commission')
      .leftJoinAndSelect('commission.transaction', 'transaction')
      .where('commission.accountId IN (:...currentAccountIds)', {
        currentAccountIds: currentUserAccounts.map((a) => a.id),
      })
      .andWhere('transaction.originAccount.id IN (:...targetAccountIds)', {
        targetAccountIds: targetUserAccounts.map((a) => a.id),
      })
      .select('SUM(commission.amount)', 'total')
      .getRawOne();

    return {
      id: targetUser.id,
      name: targetUser.name,
      accountNumbers: targetUser.accounts.map((account) => account.accountNumber),
      isReferrer,
      isReferred,
      totalTransactionsToUser: transactions,
      totalCommissionsGenerated: Number(commissions?.total || 0),
    };
  }
}
