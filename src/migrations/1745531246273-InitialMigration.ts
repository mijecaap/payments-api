import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialMigration1745531246273 implements MigrationInterface {
  name = 'InitialMigration1745531246273';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "transaction" ("id" SERIAL NOT NULL, "amount" numeric(10,2) NOT NULL, "commission" numeric(10,2) NOT NULL, "date" TIMESTAMP NOT NULL, "originAccountId" integer, "destinationAccountId" integer, CONSTRAINT "PK_89eadb93a89810556e1cbcd6ab9" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "commission" ("id" SERIAL NOT NULL, "amount" numeric(10,2) NOT NULL, "date" TIMESTAMP NOT NULL, "accountId" integer, "transactionId" integer, CONSTRAINT "PK_d108d70411783e2a3a84e386601" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "user" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "account" ("id" SERIAL NOT NULL, "accountNumber" character varying(10) NOT NULL, "balance" numeric(10,2) NOT NULL DEFAULT '0', "referred_by" integer NOT NULL, "userId" integer, CONSTRAINT "UQ_ee66d482ebdf84a768a7da36b08" UNIQUE ("accountNumber"), CONSTRAINT "PK_54115ee388cdb6d86bb4bf5b2ea" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "transaction" ADD CONSTRAINT "FK_bbf515dcb582b9c1dfa70462846" FOREIGN KEY ("originAccountId") REFERENCES "account"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "transaction" ADD CONSTRAINT "FK_6e328d7823e68db7cb5ac7abc67" FOREIGN KEY ("destinationAccountId") REFERENCES "account"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "commission" ADD CONSTRAINT "FK_bdbace630d383295872979b50a0" FOREIGN KEY ("accountId") REFERENCES "account"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "commission" ADD CONSTRAINT "FK_5b3bbed894415943a48e0513f29" FOREIGN KEY ("transactionId") REFERENCES "transaction"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "account" ADD CONSTRAINT "FK_60328bf27019ff5498c4b977421" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "account" DROP CONSTRAINT "FK_60328bf27019ff5498c4b977421"`,
    );
    await queryRunner.query(
      `ALTER TABLE "commission" DROP CONSTRAINT "FK_5b3bbed894415943a48e0513f29"`,
    );
    await queryRunner.query(
      `ALTER TABLE "commission" DROP CONSTRAINT "FK_bdbace630d383295872979b50a0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "transaction" DROP CONSTRAINT "FK_6e328d7823e68db7cb5ac7abc67"`,
    );
    await queryRunner.query(
      `ALTER TABLE "transaction" DROP CONSTRAINT "FK_bbf515dcb582b9c1dfa70462846"`,
    );
    await queryRunner.query(`DROP TABLE "account"`);
    await queryRunner.query(`DROP TABLE "user"`);
    await queryRunner.query(`DROP TABLE "commission"`);
    await queryRunner.query(`DROP TABLE "transaction"`);
  }
}
