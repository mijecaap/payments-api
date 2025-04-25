import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from './auth/auth.module';
import { AccountController } from './controllers/account.controller';
import { CommissionController } from './controllers/commission.controller';
import { ContactController } from './controllers/contact.controller';
import { TransactionController } from './controllers/transaction.controller';
import { UserController } from './controllers/user.controller';
import { Account } from './entities/account.entity';
import { Commission } from './entities/commission.entity';
import { Transaction } from './entities/transaction.entity';
import { User } from './entities/user.entity';
import { AccountRepository } from './repositories/account.repository';
import { CommissionRepository } from './repositories/commission.repository';
import { TransactionRepository } from './repositories/transaction.repository';
import { AccountService } from './services/account.service';
import { CommissionService } from './services/commission.service';
import { ContactService } from './services/contact.service';
import { TransactionService } from './services/transaction.service';
import { UserService } from './services/user.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT, 10),
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [Account, Transaction, Commission, User],
      synchronize: false,
    }),
    TypeOrmModule.forFeature([Account, Transaction, Commission, User]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    AuthModule,
  ],
  controllers: [
    TransactionController,
    ContactController,
    AccountController,
    CommissionController,
    UserController,
  ],
  providers: [
    TransactionService,
    ContactService,
    AccountService,
    CommissionService,
    UserService,
    AccountRepository,
    TransactionRepository,
    CommissionRepository,
  ],
})
export class AppModule {}
