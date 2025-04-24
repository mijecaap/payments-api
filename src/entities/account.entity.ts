// src/entities/account.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';

import { Commission } from './commission.entity';
import { Transaction } from './transaction.entity';
import { User } from './user.entity';

@Entity()
export class Account {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 10 })
  accountNumber: string;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  balance: number;

  @Column()
  referred_by: number; // ID del referido

  @ManyToOne(() => User, (user) => user.accounts)
  user: User;

  @OneToMany(() => Transaction, (transaction) => transaction.originAccount)
  transactions: Transaction[];

  @OneToMany(() => Commission, (commission) => commission.account)
  commissions: Commission;
}
