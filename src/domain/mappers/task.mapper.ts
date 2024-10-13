import { TaskEntity } from "src/infra/database/entities/task.entity";
import { Task } from "../models/task.model";
import { TaskResponseDto } from "src/modules/tasks/dto/task-response.dto";

export class TaskMapper {
  static toDomain(entity: TaskEntity): Task {
    return new Task(
      entity.uuid,
      entity.title,
      entity.description,
      entity.status,
      entity.deadline,
      entity.reminderTime,
      entity.userId,
      entity.id,
    );
  }

  static toEntity(
    task: Task,
  ): Omit<
    TaskEntity,
    "id" | "createdAt" | "updatedAt" | "user" | "taskCategories"
  > & { id?: number } {
    return {
      uuid: task.uuid,
      title: task.title,
      description: task.description,
      status: task.status,
      deadline: task.deadline,
      reminderTime: task.reminderTime,
      userId: task.userId,
      id: task.id || undefined,
    };
  }

  static toDto(task: Task): TaskResponseDto {
    return {
      uuid: task.uuid,
      title: task.title,
      description: task.description,
      status: task.status,
      deadline: task.deadline,
      reminderTime: task.reminderTime,
      userId: task.userId,
    };
  }
}
