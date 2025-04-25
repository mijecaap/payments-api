import { Injectable, NotFoundException } from '@nestjs/common';

import { AccountResponseDto } from '../dto/account.dto';
import { Account } from '../entities/account.entity';
import { User } from '../entities/user.entity';
import { AccountRepository } from '../repositories/account.repository';

@Injectable()
export class AccountService {
  constructor(private accountRepository: AccountRepository) {}

  async getUserAccounts(userId: number): Promise<AccountResponseDto[]> {
    const accounts = await this.accountRepository.find({
      where: { user: { id: userId } },
      select: {
        id: true,
        accountNumber: true,
        balance: true,
        referred_by: true,
      },
    });

    // Si hay cuentas con referred_by, buscamos los nombres de los referidores
    const accountsWithReferrers = await Promise.all(
      accounts.map(async (account) => {
        const accountData = {
          id: account.id,
          accountNumber: account.accountNumber,
          balance: account.balance,
          referred_by: account.referred_by,
        };

        if (account.referred_by) {
          const referrer = await this.accountRepository.findOne({
            where: { id: account.referred_by },
            relations: ['user'],
            select: {
              user: {
                name: true,
              },
            },
          });

          return {
            ...accountData,
            referrerName: referrer?.user?.name || null,
          };
        }

        return {
          ...accountData,
          referrerName: null,
        };
      }),
    );

    return accountsWithReferrers;
  }

  private async generateUniqueAccountNumber(): Promise<string> {
    while (true) {
      // Generar número de 10 dígitos para el número de cuenta
      const accountNumber = Math.floor(Math.random() * 9000000000 + 1000000000).toString();

      // Verificar si ya existe
      const existingAccount = await this.accountRepository.findOne({
        where: { accountNumber },
      });

      if (!existingAccount) {
        return accountNumber;
      }
    }
  }

  async createAccount(userId: number, referredBy?: number): Promise<Account> {
    const account = new Account();
    account.balance = 0;
    account.accountNumber = await this.generateUniqueAccountNumber();
    account.referred_by = referredBy || 0;
    account.user = { id: userId } as User;

    return this.accountRepository.save(account);
  }

  async getAccountBalance(accountId: number): Promise<{ balance: number }> {
    const account = await this.accountRepository.findOne({
      where: { id: accountId },
    });

    if (!account) {
      throw new NotFoundException('Cuenta no encontrada');
    }

    return { balance: account.balance };
  }

  async verifyAccountOwnership(accountId: number, userId: number): Promise<boolean> {
    const account = await this.accountRepository.findOne({
      where: { id: accountId },
      relations: ['user'],
    });

    return account?.user?.id === userId;
  }
}
