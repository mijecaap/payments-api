import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Account } from './entities/account.entity';
import { Commission } from './entities/commission.entity';
import { Transaction } from './entities/transaction.entity';
import { TransactionService } from './services/transaction.service';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT, 10),
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [Account, Transaction, Commission],
      synchronize: false,
    }),
    TypeOrmModule.forFeature([Account, Transaction, Commission]),
  ],
  controllers: [AppController],
  providers: [AppService, TransactionService],
})
export class AppModule {}
