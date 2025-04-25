import * as bcrypt from 'bcrypt';
import { config } from 'dotenv';
import { DataSource } from 'typeorm';

import { Account } from '../entities/account.entity';
import { Commission } from '../entities/commission.entity';
import { Transaction } from '../entities/transaction.entity';
import { User } from '../entities/user.entity';

config();

const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10);

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, saltRounds);
}

function generateAccountNumber(): string {
  return Math.floor(Math.random() * 9000000000 + 1000000000).toString();
}

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

    // Crear usuario del sistema
    const user1 = new User();
    user1.name = 'SYSTEM';
    user1.email = 'system@banex.com';
    user1.password = await hashPassword('systempassword123');
    await userRepository.save(user1);

    const systemAccount = new Account();
    systemAccount.accountNumber = '0000000001';
    systemAccount.balance = 0;
    systemAccount.referred_by = 0;
    systemAccount.user = user1;
    await accountRepository.save(systemAccount);

    // Crear usuarios regulares
    const user2 = new User();
    user2.name = 'Juan Pérez';
    user2.email = 'juan@ejemplo.com';
    user2.password = await hashPassword('password123');
    await userRepository.save(user2);

    const user3 = new User();
    user3.name = 'María García';
    user3.email = 'maria@ejemplo.com';
    user3.password = await hashPassword('password123');
    await userRepository.save(user3);

    const user4 = new User();
    user4.name = 'Carlos López';
    user4.email = 'carlos@ejemplo.com';
    user4.password = await hashPassword('password123');
    await userRepository.save(user4);

    // Crear cuentas
    const account1 = new Account();
    account1.accountNumber = generateAccountNumber();
    account1.balance = 1000;
    account1.referred_by = 0; // Cuenta inicial sin referido
    account1.user = user2;
    await accountRepository.save(account1);

    const account2 = new Account();
    account2.accountNumber = generateAccountNumber();
    account2.balance = 500;
    account2.referred_by = account1.id; // Referido por la cuenta 1
    account2.user = user3;
    await accountRepository.save(account2);

    const account3 = new Account();
    account3.accountNumber = generateAccountNumber();
    account3.balance = 750;
    account3.referred_by = account1.id; // También referido por la cuenta 1
    account3.user = user4;
    await accountRepository.save(account3);

    // Crear transacciones y comisiones de ejemplo

    // 1. Transacción sin referido (toda la comisión va al sistema)
    const transaction1 = new Transaction();
    transaction1.amount = 100;
    transaction1.commission = 1; // 1% de comisión
    transaction1.date = new Date();
    transaction1.originAccount = account3;
    transaction1.destinationAccount = account2;
    await transactionRepository.save(transaction1);

    // Registrar comisión para el sistema
    const systemCommission1 = new Commission();
    systemCommission1.amount = transaction1.commission;
    systemCommission1.date = transaction1.date;
    systemCommission1.account = systemAccount;
    systemCommission1.transaction = transaction1;
    await commissionRepository.save(systemCommission1);

    // 2. Transacción con referido (comisión dividida)
    const transaction2 = new Transaction();
    transaction2.amount = 200;
    transaction2.commission = 2; // 1% de comisión
    transaction2.date = new Date();
    transaction2.originAccount = account2;
    transaction2.destinationAccount = account3;
    await transactionRepository.save(transaction2);

    // Mitad de la comisión para el referidor
    const referrerCommission = new Commission();
    referrerCommission.amount = 1; // 50% de la comisión
    referrerCommission.date = transaction2.date;
    referrerCommission.account = account1; // Va a la cuenta que refirió
    referrerCommission.transaction = transaction2;
    await commissionRepository.save(referrerCommission);

    // Mitad de la comisión para el sistema
    const systemCommission2 = new Commission();
    systemCommission2.amount = 1; // 50% de la comisión
    systemCommission2.date = transaction2.date;
    systemCommission2.account = systemAccount;
    systemCommission2.transaction = transaction2;
    await commissionRepository.save(systemCommission2);

    // Actualizar saldos finales considerando transacciones y comisiones
    account1.balance += 1; // Recibió comisión por referido
    account2.balance = 500 - 202 + 100; // -202 (monto+comisión), +100 (recibido)
    account3.balance = 750 - 101 + 200; // -101 (monto+comisión), +200 (recibido)
    systemAccount.balance = 2; // Recibió 1 de comisión completa y 1 de comisión compartida

    await accountRepository.save([account1, account2, account3, systemAccount]);

    console.log('✅ Datos de prueba insertados exitosamente');
  } catch (error) {
    console.error('❌ Error al insertar datos de prueba:', error);
  } finally {
    await AppDataSource.destroy();
  }
}

void seed();
