// src/entities/account.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';

import { Commission } from './commission.entity';
import { Transaction } from './transaction.entity';
import { User } from './user.entity';

@Entity()
export class Account {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
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
