import { Injectable } from "@nestjs/common";
import { DataSource } from "typeorm";
import { UserRepository } from "./repositories/user.repository";
import { CategoryRepository } from "./repositories/category.repository";
import { ReminderRepository } from "./repositories/reminder.repository";
import { TaskRepository } from "./repositories/task.repository";

@Injectable()
export class DataAccessLayer {
  public readonly user: UserRepository;
  public readonly task: TaskRepository;
  public readonly category: CategoryRepository;
  public readonly reminder: ReminderRepository;

  constructor(private dataSource: DataSource) {
    this.user = new UserRepository(dataSource);
    this.task = new TaskRepository(dataSource);
    this.category = new CategoryRepository(dataSource);
    this.reminder = new ReminderRepository(dataSource);
  }
}
