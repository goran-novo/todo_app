import { Module } from "@nestjs/common";
import { BullModule } from "@nestjs/bull";
import { ReminderService } from "./reminder.service";
import { ReminderProcessor } from "./reminder.processor";
import { EmailModule } from "../email/email.module"; // Adjust this import path as necessary
import { DataAccessLayer } from "src/infra/database/data-access-layer";

@Module({
  imports: [
    BullModule.registerQueue({
      name: "taskReminder",
    }),
    DataAccessLayer,
    EmailModule,
  ],
  providers: [ReminderService, ReminderProcessor],
  exports: [ReminderService],
})
export class ReminderModule {}
