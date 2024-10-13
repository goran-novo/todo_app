import { Module } from "@nestjs/common";
import { BullModule } from "@nestjs/bull";
import { ReminderService } from "./reminder.service";
import { ReminderProcessor } from "./reminder.processor";
import { EmailModule } from "../email/email.module";
import { QueueNames } from "src/domain/queues/queue-names";

@Module({
  imports: [
    BullModule.registerQueue({
      name: QueueNames.TaskReminderQueue,
    }),
    EmailModule,
  ],
  providers: [ReminderService, ReminderProcessor],
  exports: [ReminderService],
})
export class ReminderModule {}
