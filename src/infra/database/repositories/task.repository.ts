import { TaskMapper } from "src/domain/mappers/task.mapper";
import { Task } from "src/domain/models/task.model";
import { DataSource, Between, LessThan, In } from "typeorm";
import { TaskEntity } from "../entities/task.entity";
import { GenericRepository } from "./generic.repository";
import { TaskStatus } from "src/domain/models/enum/task.status.enum";
import { TaskCategoryEntity } from "../entities/taskCategory.entity";

export class TaskRepository extends GenericRepository<TaskEntity> {
  constructor(dataSource: DataSource) {
    super(TaskEntity, dataSource);
  }

  async createTaskWithCategories(
    task: Omit<Task, "id">,
    categoryIds: number[],
  ): Promise<Task> {
    const taskEntity = TaskMapper.toEntity(
      Task.create(
        task.title,
        task.description,
        task.userId,
        task.deadline,
        task.reminderTime,
      ),
    );

    const savedTask = await this.dataSource.transaction(
      async (transactionalEntityManager) => {
        const savedTaskEntity = await transactionalEntityManager.save(
          TaskEntity,
          taskEntity,
        );

        const taskCategories = categoryIds.map((categoryId) => ({
          taskId: savedTaskEntity.id,
          categoryId: categoryId,
        }));

        await transactionalEntityManager.insert(
          TaskCategoryEntity,
          taskCategories,
        );

        return savedTaskEntity;
      },
    );

    return TaskMapper.toDomain(savedTask);
  }

  async getTaskByUuidAndUser(
    uuid: string,
    userId: number,
  ): Promise<Task | null> {
    const taskEntity = await this.repository.findOne({
      where: {
        uuid: uuid,
        userId: userId,
      },
    });
    return taskEntity ? TaskMapper.toDomain(taskEntity) : null;
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

  async addCategoriesToTask(
    taskId: number,
    categoryIds: number[],
  ): Promise<void> {
    const taskCategories = categoryIds.map((categoryId) => ({
      taskId,
      categoryId,
    }));

    await this.dataSource
      .createQueryBuilder()
      .insert()
      .into(TaskCategoryEntity)
      .values(taskCategories)
      .orIgnore()
      .execute();
  }

  async removeCategoriesFromTask(
    taskId: number,
    categoryIds: number[],
  ): Promise<void> {
    await this.dataSource
      .createQueryBuilder()
      .delete()
      .from(TaskCategoryEntity)
      .where("taskId = :taskId AND categoryId IN (:...categoryIds)", {
        taskId,
        categoryIds,
      })
      .execute();
  }

  async getTaskCategories(taskId: number): Promise<number[]> {
    const taskCategories = await this.dataSource
      .getRepository(TaskCategoryEntity)
      .find({
        where: { taskId },
      });
    return taskCategories.map((tc) => tc.categoryId);
  }

  async getTasksByDeadlineRange(
    userId: number,
    start: Date,
    end: Date,
  ): Promise<Task[]> {
    const taskEntities = await this.repository.find({
      where: {
        userId: userId,
        deadline: Between(start, end),
      },
      relations: ["user"],
    });

    return taskEntities.map(TaskMapper.toDomain);
  }

  async searchTasks(query: string, userId: number): Promise<Task[]> {
    const taskEntities = await this.repository
      .createQueryBuilder("task")
      .where("task.userId = :userId", { userId })
      .andWhere(
        "to_tsvector(task.title || ' ' || task.description) @@ plainto_tsquery(:query)",
        { query },
      )
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
