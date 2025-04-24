// src/entities/commission.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';

import { Account } from './account.entity';
import { Transaction } from './transaction.entity';

@Entity()
export class Commission {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column()
  date: Date;

  @ManyToOne(() => Account, (account) => account.commissions)
  account: Account;

  @ManyToOne(() => Transaction, (transaction) => transaction.commission)
  transaction: Transaction;
}
