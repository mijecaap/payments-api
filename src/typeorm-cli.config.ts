import { config } from 'dotenv';
import { DataSource } from 'typeorm';

import { Account } from './entities/account.entity';
import { Commission } from './entities/commission.entity';
import { Transaction } from './entities/transaction.entity';
import { User } from './entities/user.entity';

config();

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [User, Account, Transaction, Commission],
  migrations: ['src/migrations/*.ts'],
});

export default dataSource;
