import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { Task } from "src/domain/models/task.model";
import { DataAccessLayer } from "src/infra/database/data-access-layer";
import { TaskStatus } from "src/domain/models/enum/task.status.enum";
import { ReminderService } from "../reminders/reminder.service";
import { CategoryService } from "../categories/category.service";
import { CreateTaskDto } from "./dto/task.dto";
import { Category } from "src/domain/models/category.model";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { TaskCreatedEvent } from "src/domain/events/task-created.event";
import { TaskArchivedEvent } from "src/domain/events/task-archived.event";
import { TaskDeletedEvent } from "src/domain/events/task-deleted.event";
import { EventNames } from "src/domain/events/event-names";
import { QueueJobNames, QueueNames } from "src/domain/queues/queue-names";
import { InjectQueue } from "@nestjs/bull";
import { Queue } from "bull";

@Injectable()
export class TaskService {
  private readonly logger = new Logger(ReminderService.name);
  constructor(
    private readonly dal: DataAccessLayer,
    private readonly reminderService: ReminderService,
    private readonly categoryService: CategoryService,
    private readonly eventEmitter: EventEmitter2,
    @InjectQueue(QueueNames.TaskArchivingQueue) private taskArchiveQueue: Queue,
  ) { }

  async createTask(userId: number, taskData: CreateTaskDto): Promise<Task> {
    if (taskData.reminderTime && taskData.deadline) {
      if (taskData.reminderTime >= taskData.deadline) {
        throw new BadRequestException(
          "Reminder time must be before the deadline",
        );
      }
    }

    let categories: Category[] = [];
    if (taskData.categoryNames && taskData.categoryNames.length > 0) {
      categories = await this.categoryService.findOrCreateCategories(
        taskData.categoryNames,
      );
    }

    const task = Task.create(
      taskData.title,
      taskData.description || null,
      userId,
      taskData.deadline,
      taskData.reminderTime,
    );

    const createdTask = await this.dal.task.createTaskWithCategories(
      task,
      categories.map((c) => c.id),
    );

    this.eventEmitter.emit(
      EventNames.TaskCreated,
      new TaskCreatedEvent(createdTask),
    );

    return createdTask;
  }

  async updateTaskStatus(
    userId: number,
    taskUuid: string,
    status: string,
  ): Promise<Task | null> {
    const task = await this.dal.task.getTaskByUuidAndUser(taskUuid, userId);

    if (!task) {
      throw new NotFoundException("Task not found");
    }

    if (status === TaskStatus.ARCHIVED) {
      this.eventEmitter.emit(
        EventNames.TaskArchived,
        new TaskArchivedEvent(task),
      );
    }

    return this.dal.task.updateTaskStatus(taskUuid, status);
  }

  async addCategoriesToTask(
    userId: number,
    taskUuid: string,
    categoryNames: string[],
  ): Promise<Category[]> {
    const task = await this.dal.task.getTaskByUuidAndUser(taskUuid, userId);
    if (!task) {
      throw new NotFoundException("Task not found");
    }

    const categories =
      await this.categoryService.findOrCreateCategories(categoryNames);
    await this.dal.task.addCategoriesToTask(
      task.id,
      categories.map((c) => c.id),
    );
    return categories;
  }

  async removeCategoriesFromTask(
    userId: number,
    taskUuid: string,
    categoryUuids: string[],
  ): Promise<void> {
    const task = await this.dal.task.getTaskByUuidAndUser(taskUuid, userId);
    if (!task) {
      throw new NotFoundException("Task not found");
    }

    const categories =
      await this.categoryService.findCategoriesByUuids(categoryUuids);
    await this.dal.task.removeCategoriesFromTask(
      task.id,
      categories.map((c) => c.id),
    );
  }

  async searchTasks(userId: number, query: string): Promise<Task[]> {
    return await this.dal.task.searchTasks(query, userId);
  }

  async filterTasksByDeadline(
    userId: number,
    startDate: Date,
    endDate: Date,
  ): Promise<Task[]> {
    return await this.dal.task.getTasksByDeadlineRange(
      userId,
      startDate,
      endDate,
    );
  }

  async deleteTask(userId: number, taskUuid: string): Promise<void> {
    const task = await this.dal.task.getTaskByUuidAndUser(taskUuid, userId);
    if (!task) {
      throw new NotFoundException("Task not found");
    }

    this.eventEmitter.emit(EventNames.TaskDeleted, new TaskDeletedEvent(task));
    await this.dal.task.delete(task.id);
  }

  async scheduleArchiveJob(task: Task): Promise<void> {
    if (!task.deadline) {
      this.logger.log(
        `Task ${task.id} has no deadline, skipping archive job scheduling`,
      );
      return;
    }

    const now = new Date();
    const archiveDelay = this.calculateArchiveDelay(task.deadline, now);

    if (archiveDelay <= 0) {
      this.logger.warn(
        `Task ${task.id} deadline is in the past, skipping archive job scheduling`,
      );
      return;
    }

    try {
      const job = await this.taskArchiveQueue.add(
        QueueJobNames.ArchiveTaskJob,
        { task },
        { delay: archiveDelay },
      );
      this.logger.log(
        `Archive job scheduled for task ${task.id} with job ID ${job.id}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to schedule archive job for task ${task.id}`,
        error,
      );
    }
  }

  calculateArchiveDelay(deadline: Date, now: Date): number {
    const THREE_DAYS_IN_MS = 3 * 24 * 60 * 60 * 1000;
    return deadline.getTime() - now.getTime() + THREE_DAYS_IN_MS;
  }

  async createReminderForTask(task: Task): Promise<void> {
    if (!task.reminderTime) {
      this.logger.log(
        `Task ${task.id} has no reminder time, skipping reminder creation`,
      );
      return;
    }

    try {
      await this.reminderService.createReminder(task.id, task.reminderTime);
      this.logger.log(`Reminder created successfully for task ${task.id}`);
    } catch (error) {
      this.logger.error(`Failed to create reminder for task ${task.id}`, error);
    }
  }

  async removeReminderForTask(task: Task) {
    try {
      await this.taskArchiveQueue.removeJobs(task.uuid);
      await this.reminderService.removeReminderJob(task.id);
    } catch (error) {
      console.error(`Failed to remove jobs for task ${task.uuid}:`, error);
    }
  }
}
