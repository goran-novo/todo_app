import { Processor, Process } from "@nestjs/bull";
import { Injectable, Logger } from "@nestjs/common";
import { Job } from "bull";
import { ReminderService } from "./reminder.service";
import { QueueJobNames, QueueNames } from "src/domain/queues/queue-names";

@Injectable()
@Processor(QueueNames.TaskReminderQueue)
export class ReminderProcessor {
  private readonly logger = new Logger(ReminderProcessor.name);
  constructor(private readonly reminderService: ReminderService) {}

  @Process(QueueJobNames.SendTaskReminderJob)
  async handleSendReminder(job: Job<{ taskId: number; reminderId: string }>) {
    const { taskId, reminderId } = job.data;
    this.logger.log(
      `Processing reminder job: taskId=${taskId}, reminderId=${reminderId}`,
    );

    try {
      await this.reminderService.processReminder(taskId, reminderId);
      this.logger.log(
        `Reminder processed successfully: taskId=${taskId}, reminderId=${reminderId}`,
      );
    } catch (error) {
      this.logger.error(
        `Error processing reminder: taskId=${taskId}, reminderId=${reminderId}`,
        error.stack,
      );
      throw error;
    }
  }
}
