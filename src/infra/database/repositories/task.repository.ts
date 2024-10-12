import { TaskMapper } from "src/domain/mappers/task.mapper";
import { Task } from "src/domain/models/task.model";
import { DataSource, Between, LessThan, In } from "typeorm";
import { TaskEntity } from "../entities/task.entity";
import { GenericRepository } from "./generic.repository";
import { TaskStatus } from "src/domain/models/enum/task.status.enum";

export class TaskRepository extends GenericRepository<TaskEntity> {
  constructor(dataSource: DataSource) {
    super(TaskEntity, dataSource);
  }

  async createTask(task: Omit<Task, "id">): Promise<Task> {
    const taskEntity = TaskMapper.toEntity(
      Task.create(
        task.title,
        task.description,
        task.userId,
        task.categoryId,
        task.deadline,
        task.reminderTime,
      ),
    );
    const savedEntity = await this.create(taskEntity);
    return TaskMapper.toDomain(savedEntity);
  }

  async getTasksByUser(userId: number): Promise<Task[]> {
    const taskEntities = await this.repository.find({
      where: { user: { id: userId } },
      relations: ["category"],
    });
    return taskEntities.map(TaskMapper.toDomain);
  }

  async getTasksByIds(ids: number[]): Promise<Task[]> {
    const taskEntities = await this.repository.find({
      where: { id: In(ids) },
      relations: ["user", "category"],
    });
    return taskEntities.map(TaskMapper.toDomain);
  }

  async getTasksByStatus(status: TaskStatus): Promise<Task[]> {
    const taskEntities = await this.repository.find({
      where: { status },
      relations: ["user", "category"],
    });
    return taskEntities.map(TaskMapper.toDomain);
  }

  async getTasksByDeadlineRange(start: Date, end: Date): Promise<Task[]> {
    const taskEntities = await this.repository.find({
      where: { deadline: Between(start, end) },
      relations: ["user", "category"],
    });
    return taskEntities.map(TaskMapper.toDomain);
  }

  async searchTasksByTitle(query: string): Promise<Task[]> {
    const taskEntities = await this.repository
      .createQueryBuilder("task")
      .where("to_tsvector(task.title) @@ plainto_tsquery(:query)", { query })
      .leftJoinAndSelect("task.user", "user")
      .leftJoinAndSelect("task.category", "category")
      .getMany();
    return taskEntities.map(TaskMapper.toDomain);
  }

  async getOverdueTasks(): Promise<Task[]> {
    const taskEntities = await this.repository.find({
      where: {
        deadline: LessThan(new Date()),
        status: TaskStatus.PENDING,
      },
      relations: ["user", "category"],
    });
    return taskEntities.map(TaskMapper.toDomain);
  }

  async updateTaskStatus(
    taskUuid: string,
    status: string,
  ): Promise<Task | null> {
    const task = await this.findByUuid(taskUuid);
    if (!task) return null;

    task.status = status as any;
    const updatedEntity = await this.update(task.id, task);
    return updatedEntity ? TaskMapper.toDomain(updatedEntity) : null;
  }

  async archivePastDueTasks(): Promise<void> {
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    await this.repository.update(
      {
        status: TaskStatus.PENDING,
        deadline: LessThan(threeDaysAgo),
      },
      { status: TaskStatus.ARCHIVED },
    );
  }
}
