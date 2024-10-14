import { MigrationInterface, QueryRunner } from "typeorm";

export class TaskAndReminderIndexUpdate1728926384456
  implements MigrationInterface
{
  name = "TaskAndReminderIndexUpdate1728926384456";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE INDEX "idx_tasks_title_description" ON "tasks" ("title", "description") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "idx_reminder_uuid" ON "reminders" ("uuid") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."idx_reminder_uuid"`);
    await queryRunner.query(
      `DROP INDEX "public"."idx_tasks_title_description"`,
    );
  }
}
