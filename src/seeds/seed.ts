import { config } from 'dotenv';
import { DataSource } from 'typeorm';

import { Account } from '../entities/account.entity';
import { Commission } from '../entities/commission.entity';
import { Transaction } from '../entities/transaction.entity';
import { User } from '../entities/user.entity';

config();

async function seed() {
  const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities: [User, Account, Transaction, Commission],
  });

  await AppDataSource.initialize();

  try {
    const userRepository = AppDataSource.getRepository(User);
    const accountRepository = AppDataSource.getRepository(Account);
    const transactionRepository = AppDataSource.getRepository(Transaction);
    const commissionRepository = AppDataSource.getRepository(Commission);

    // Crear usuarios
    const user1 = new User();
    user1.name = 'Juan Pérez';
    user1.email = 'juan@ejemplo.com';
    await userRepository.save(user1);

    const user2 = new User();
    user2.name = 'María García';
    user2.email = 'maria@ejemplo.com';
    await userRepository.save(user2);

    const user3 = new User();
    user3.name = 'Carlos López';
    user3.email = 'carlos@ejemplo.com';
    await userRepository.save(user3);

    // Crear cuentas
    const account1 = new Account();
    account1.balance = 1000;
    account1.referred_by = 0; // Cuenta inicial sin referido
    account1.user = user1;
    await accountRepository.save(account1);

    const account2 = new Account();
    account2.balance = 500;
    account2.referred_by = account1.id; // Referido por la cuenta 1
    account2.user = user2;
    await accountRepository.save(account2);

    const account3 = new Account();
    account3.balance = 750;
    account3.referred_by = account1.id; // También referido por la cuenta 1
    account3.user = user3;
    await accountRepository.save(account3);

    // Crear algunas transacciones de ejemplo
    const transaction1 = new Transaction();
    transaction1.amount = 100;
    transaction1.commission = 1; // 1% de comisión
    transaction1.date = new Date();
    transaction1.originAccount = account1;
    transaction1.destinationAccount = account2;
    await transactionRepository.save(transaction1);

    // Registrar la comisión de la transacción
    const commission1 = new Commission();
    commission1.amount = transaction1.commission;
    commission1.date = transaction1.date;
    commission1.account = account2;
    commission1.transaction = transaction1;
    await commissionRepository.save(commission1);

    console.log('✅ Datos de prueba insertados exitosamente');
  } catch (error) {
    console.error('❌ Error al insertar datos de prueba:', error);
  } finally {
    await AppDataSource.destroy();
  }
}

void seed();
