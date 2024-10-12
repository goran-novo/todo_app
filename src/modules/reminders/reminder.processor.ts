import { Processor, Process } from "@nestjs/bull";
import { Injectable } from "@nestjs/common";
import { Job } from "bull";
import { ReminderService } from "./reminder.service";

@Injectable()
@Processor("taskReminder")
export class ReminderProcessor {
  constructor(private readonly reminderService: ReminderService) {}

  @Process("sendReminder")
  async handleSendReminder(job: Job<{ taskId: number; reminderId: string }>) {
    const { taskId, reminderId } = job.data;
    await this.reminderService.processReminder(taskId, reminderId);
  }
}
