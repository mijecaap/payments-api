import { Injectable } from '@nestjs/common';

import { FrequentContactDto } from '../dto/frequent-contact.dto';
import { ReferredContactDto } from '../dto/referred-contact.dto';
import { Account } from '../entities/account.entity';
import { AccountRepository } from '../repositories/account.repository';
import { TransactionRepository } from '../repositories/transaction.repository';

interface ContactFrequency {
  contact: {
    id: number;
    name: string;
    email: string;
    accountId: number;
  };
  count: number;
}

@Injectable()
export class ContactService {
  constructor(
    private accountRepository: AccountRepository,
    private transactionRepository: TransactionRepository,
  ) {}

  async getFrequentContacts(userId: number): Promise<FrequentContactDto[]> {
    const accounts = await this.accountRepository.findByUserId(userId);

    if (!accounts.length) {
      return [];
    }

    const transactions = await this.transactionRepository.findTransactionsWithUsers(
      accounts.map((a) => a.id),
    );
    const contactFrequency = new Map<number, ContactFrequency>();

    for (const transaction of transactions) {
      // Solo procesamos transacciones donde las cuentas del usuario son el origen
      const isOrigin = accounts.some((a) => a.id === transaction.originAccount.id);
      if (!isOrigin) continue;

      const contactAccount = transaction.destinationAccount;
      const contactUser = contactAccount.user;

      if (contactUser.id === userId || contactAccount.accountNumber === '0000000001') continue;

      if (!contactFrequency.has(contactUser.id)) {
        contactFrequency.set(contactUser.id, {
          contact: {
            id: contactUser.id,
            name: contactUser.name,
            email: contactUser.email,
            accountId: contactAccount.id,
          },
          count: 0,
        });
      }

      const current = contactFrequency.get(contactUser.id);
      current.count++;
    }

    return Array.from(contactFrequency.values())
      .sort((a, b) => b.count - a.count)
      .map(({ contact, count }) => ({
        ...contact,
        transactionCount: count,
      }));
  }

  async getReferredContacts(userId: number): Promise<ReferredContactDto[]> {
    const accounts = await this.accountRepository.findByUserId(userId);

    if (!accounts.length) {
      return [];
    }

    const referredAccounts = await this.accountRepository.findReferredAccounts(
      accounts.map((a) => a.id),
    );

    const referrerAccounts = await this.accountRepository.findReferrerAccounts(
      accounts.map((a) => a.referred_by).filter((id): id is number => id !== 0),
    );

    const mapAccountToContact = (account: Account, isReferrer: boolean): ReferredContactDto => ({
      id: account.user.id,
      name: account.user.name,
      email: account.user.email,
      accountId: account.id,
      isReferrer,
      isReferred: !isReferrer,
    });

    return [
      ...referredAccounts.map((account) => mapAccountToContact(account, false)),
      ...referrerAccounts.map((account) => mapAccountToContact(account, true)),
    ];
  }
}
