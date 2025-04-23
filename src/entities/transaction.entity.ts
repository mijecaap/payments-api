// src/entities/transaction.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';

import { Account } from './account.entity';

@Entity()
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  amount: number;

  @Column()
  commission: number;

  @Column()
  date: Date;

  @ManyToOne(() => Account, (account) => account.transactions)
  originAccount: Account;

  @ManyToOne(() => Account, (account) => account.transactions)
  destinationAccount: Account;
}
