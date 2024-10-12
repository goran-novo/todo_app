import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectQueue } from "@nestjs/bull";
import { Queue } from "bull";
import { Task } from "src/domain/models/task.model";
import { DataAccessLayer } from "src/infra/database/data-access-layer";
import { TaskStatus } from "src/domain/models/enum/task.status.enum";
import { ReminderService } from "../reminders/reminder.service";

@Injectable()
export class TaskService {
  constructor(
    private readonly dal: DataAccessLayer,
    private readonly reminderService: ReminderService,
    @InjectQueue("taskArchive") private taskArchiveQueue: Queue,
  ) {}

  async createTask(
    userId: number,
    categoryUuid: string,
    taskData: {
      title: string;
      description?: string;
      deadline?: Date;
      reminderTime?: Date;
    },
  ): Promise<Task> {
    const category = await this.dal.category.findCategoryByUuid(categoryUuid);
    if (!category || !category.id) {
      throw new NotFoundException("Category not found");
    }

    if (taskData.reminderTime && taskData.deadline) {
      if (taskData.reminderTime >= taskData.deadline) {
        throw new BadRequestException(
          "Reminder time must be before the deadline",
        );
      }
    }

    const task = Task.create(
      taskData.title,
      taskData.description || null,
      userId,
      category.id,
      taskData.deadline,
      taskData.reminderTime,
    );

    const createdTask = await this.dal.task.createTask(task);

    if (createdTask.deadline) {
      const archiveDelay =
        createdTask.deadline.getTime() - Date.now() + 3 * 24 * 60 * 60 * 1000;
      await this.taskArchiveQueue.add(
        "archiveTask",
        { taskUuid: createdTask.uuid },
        { delay: archiveDelay },
      );
    }

    if (createdTask.reminderTime) {
      await this.reminderService.createReminder(
        createdTask.id as number,
        createdTask.reminderTime,
      );
    }

    return createdTask;
  }

  async updateTaskStatus(
    userId: number,
    taskUuid: string,
    status: string,
  ): Promise<Task | null> {
    const task = await this.dal.task.findByUuid(taskUuid);
    if (!task || task.userId !== userId) {
      throw new NotFoundException("Task not found");
    }

    if (status === TaskStatus.ARCHIVED) {
      try {
        await this.taskArchiveQueue.removeJobs(taskUuid);
        await this.reminderService.removeReminderJob(task.id);
      } catch (error) {
        console.error(`Failed to remove jobs for task ${taskUuid}:`, error);
      }
    }

    return this.dal.task.updateTaskStatus(taskUuid, status);
  }

  async searchTasks(userId: number, query: string): Promise<Task[]> {
    const tasks = await this.dal.task.searchTasksByTitle(query);
    return tasks.filter((task) => task.userId === userId);
  }

  async filterTasksByDeadline(
    userId: number,
    startDate: Date,
    endDate: Date,
  ): Promise<Task[]> {
    const tasks = await this.dal.task.getTasksByDeadlineRange(
      startDate,
      endDate,
    );
    return tasks.filter((task) => task.userId === userId);
  }

  async deleteTask(userId: number, taskUuid: string): Promise<void> {
    const task = await this.dal.task.findByUuid(taskUuid);
    if (!task || task.userId !== userId) {
      throw new NotFoundException("Task not found");
    }

    try {
      await this.taskArchiveQueue.removeJobs(taskUuid);
      await this.reminderService.removeReminderJob(task.id);
    } catch (error) {
      console.error(`Failed to remove jobs for task ${taskUuid}:`, error);
    }

    await this.dal.task.delete(task.id);
  }
}
