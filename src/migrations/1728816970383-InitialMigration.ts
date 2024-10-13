import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1728816970383 implements MigrationInterface {
  name = "InitialMigration1728816970383";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "categories" ("id" SERIAL NOT NULL, "uuid" uuid NOT NULL, "name" character varying NOT NULL, CONSTRAINT "UQ_a4b5917e7297f757879582e1458" UNIQUE ("uuid"), CONSTRAINT "PK_24dbc6126a28ff948da33e97d3b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "task_categories" ("id" SERIAL NOT NULL, "taskId" integer NOT NULL, "categoryId" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_40776b70c03a33e93c8c0165f87" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "tasks" ("id" SERIAL NOT NULL, "uuid" uuid NOT NULL, "title" character varying NOT NULL, "description" text, "status" "public"."tasks_status_enum" NOT NULL DEFAULT 'pending', "deadline" TIMESTAMP, "reminderTime" TIMESTAMP, "userId" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_90915808c3fe8ee2e2d67d8b787" UNIQUE ("uuid"), CONSTRAINT "PK_8d12ff38fcc62aaba2cab748772" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_tasks_deadline" ON "tasks" ("deadline") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_tasks_status" ON "tasks" ("status") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "idx_tasks_uuid" ON "tasks" ("uuid") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_tasks_user_id" ON "tasks" ("userId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "users" ("id" SERIAL NOT NULL, "uuid" uuid NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_951b8f1dfc94ac1d0301a14b7e1" UNIQUE ("uuid"), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "reminders" ("id" SERIAL NOT NULL, "uuid" uuid NOT NULL, "taskId" integer NOT NULL, "reminderTime" TIMESTAMP NOT NULL, "sent" boolean NOT NULL DEFAULT false, CONSTRAINT "UQ_701bbf9ecb7a0e97719dcbf2380" UNIQUE ("uuid"), CONSTRAINT "PK_38715fec7f634b72c6cf7ea4893" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_categories" ADD CONSTRAINT "FK_f287cf7b0ddde1373dd6cf26593" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_categories" ADD CONSTRAINT "FK_4e445f6e0b93ac121e44d8b0071" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "tasks" ADD CONSTRAINT "FK_166bd96559cb38595d392f75a35" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "reminders" ADD CONSTRAINT "FK_fd166880b624ea8560667d43101" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "reminders" DROP CONSTRAINT "FK_fd166880b624ea8560667d43101"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tasks" DROP CONSTRAINT "FK_166bd96559cb38595d392f75a35"`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_categories" DROP CONSTRAINT "FK_4e445f6e0b93ac121e44d8b0071"`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_categories" DROP CONSTRAINT "FK_f287cf7b0ddde1373dd6cf26593"`,
    );
    await queryRunner.query(`DROP TABLE "reminders"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP INDEX "public"."idx_tasks_user_id"`);
    await queryRunner.query(`DROP INDEX "public"."idx_tasks_uuid"`);
    await queryRunner.query(`DROP INDEX "public"."idx_tasks_status"`);
    await queryRunner.query(`DROP INDEX "public"."idx_tasks_deadline"`);
    await queryRunner.query(`DROP TABLE "tasks"`);
    await queryRunner.query(`DROP TABLE "task_categories"`);
    await queryRunner.query(`DROP TABLE "categories"`);
  }
}
