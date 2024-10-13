import { Module } from "@nestjs/common";
import { TaskController } from "./task.controller";
import { TaskService } from "./task.service";
import { DataAccessModule } from "src/infra/database/dal.module";
import { ReminderModule } from "../reminders/reminder.module";
import { BullModule } from "@nestjs/bull";
import { CategoryModule } from "../categories/category.module";
import { TaskEventHandler } from "./task-event.handler";
import { QueueNames } from "src/domain/queues/queue-names";
import { TaskArchiveProcessor } from "./taskArchive.processor";

@Module({
  imports: [
    DataAccessModule,
    ReminderModule,
    CategoryModule,
    BullModule.registerQueue({
      name: QueueNames.TaskArchivingQueue,
    }),
  ],
  controllers: [TaskController],
  providers: [TaskService, TaskEventHandler, TaskArchiveProcessor],
  exports: [TaskService],
})
export class TaskModule {}
