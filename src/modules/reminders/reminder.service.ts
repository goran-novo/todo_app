import { Injectable, Logger } from "@nestjs/common";
import { InjectQueue } from "@nestjs/bull";
import { Queue } from "bull";
import { Reminder } from "src/domain/models/reminder.model";
import { DataAccessLayer } from "src/infra/database/data-access-layer";
import { EmailService } from "../email/email.service";
import { QueueJobNames, QueueNames } from "src/domain/queues/queue-names";
import { format, parseISO } from "date-fns";
import { fromZonedTime } from "date-fns-tz";

@Injectable()
export class ReminderService {
  private readonly logger = new Logger(ReminderService.name);

  constructor(
    private readonly dal: DataAccessLayer,
    private readonly emailService: EmailService,
    @InjectQueue(QueueNames.TaskReminderQueue) private taskReminderQueue: Queue,
  ) {}

  async createReminder(
    taskId: number,
    reminderTime: string | Date,
    timezone: string = "Europe/Berlin",
  ) {
    const localReminderTime: Date =
      typeof reminderTime === "string" ? parseISO(reminderTime) : reminderTime;

    const utcReminderTime: Date = fromZonedTime(localReminderTime, timezone);
    const currentTimeUTC: Date = new Date();

    const delay = utcReminderTime.getTime() - currentTimeUTC.getTime();

    if (delay < 0) {
      this.logger.warn("Reminder time is in the past, not adding to queue");
      return;
    }

    const reminder = Reminder.create(taskId, utcReminderTime);
    if (!reminder) {
      throw new Error("Failed to create reminder");
    }

    const createdReminder = await this.dal.reminder.createReminder(reminder);

    await this.taskReminderQueue.add(
      QueueJobNames.SendTaskReminderJob,
      {
        taskId: createdReminder.taskId,
        reminderId: createdReminder.uuid,
      },
      { delay },
    );
    this.logger.debug(`Reminder added to queue with delay ${delay} ms`);
    this.logger.debug(
      `Reminder will be sent at (UTC): ${format(utcReminderTime, "yyyy-MM-dd HH:mm:ssXXX")}`,
    );
  }

  async processReminder(taskId: number, reminderId: string): Promise<void> {
    this.logger.log(`Processing reminder: ${reminderId}`);
    try {
      const reminder = await this.dal.reminder.findReminder(reminderId);
      if (!reminder || reminder.sent) {
        this.logger.warn(`Reminder not found or already sent: ${reminderId}`);
        return;
      }

      if (reminder.sent) {
        this.logger.warn(
          `Reminder email already sent at: ${reminder.reminderTime}`,
        );
        return;
      }

      const task = await this.dal.task.findById(taskId);
      if (!task) {
        this.logger.warn(`Task not found for reminder: ${reminderId}`);
        return;
      }

      const user = await this.dal.user.findById(task.userId);
      if (!user) {
        this.logger.warn(
          `User not found for task: ${taskId}, reminder: ${reminderId}`,
        );
        return;
      }

      await this.emailService.sendReminderEmail(user.email, task.title);
      this.logger.log(
        `Sent reminder email for task: ${taskId} to user: ${user.id}`,
      );

      await this.dal.reminder.markReminderAsSent(reminderId);
      this.logger.log(`Marked reminder as sent: ${reminderId}`);
    } catch (error) {
      this.logger.error(
        `Error processing reminder: ${reminderId}`,
        error.stack,
      );
      throw error;
    }
  }

  async removeReminderJob(taskId: number): Promise<void> {
    const reminder = await this.dal.reminder.findById(taskId);
    if (reminder) {
      await this.taskReminderQueue.removeJobs(reminder.uuid);
      await this.dal.reminder.delete(reminder.id);
    }
  }
}
