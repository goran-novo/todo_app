import { Injectable, Logger } from "@nestjs/common";
import { ReminderService } from "../reminders/reminder.service";
import { Queue } from "bull";
import { InjectQueue } from "@nestjs/bull";
import { TaskCreatedEvent } from "src/domain/events/task-created.event";
import { TaskArchivedEvent } from "src/domain/events/task-archived.event";
import { TaskDeletedEvent } from "src/domain/events/task-deleted.event";
import { EventNames } from "src/domain/events/event-names";
import { QueueJobNames, QueueNames } from "src/domain/queues/queue-names";
import { OnEvent } from "@nestjs/event-emitter";
import { TaskService } from "./task.service";

@Injectable()
export class TaskEventHandler {
  private readonly logger = new Logger(TaskEventHandler.name);

  constructor(private readonly taskService: TaskService) {}

  @OnEvent(EventNames.TaskCreated)
  async handleTaskCreatedEvent(event: TaskCreatedEvent) {
    const { task } = event;
    this.logger.log(`Processing TaskCreatedEvent for task ${task.id}`);

    await this.taskService.scheduleArchiveJob(task);
    await this.taskService.createReminderForTask(task);

    this.logger.log(`TaskCreatedEvent handling completed for task ${task.id}`);
  }

  @OnEvent([EventNames.TaskArchived, EventNames.TaskDeleted])
  async handleTaskArchivedEvent(event: TaskArchivedEvent | TaskDeletedEvent) {
    const { task } = event;
    await this.taskService.removeReminderForTask(task);
  }
}
