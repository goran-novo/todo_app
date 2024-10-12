import { ReminderEntity } from "src/infra/database/entities/reminder.entity";
import { Reminder } from "../models/reminder.model";

export class ReminderMapper {
  static toDomain(entity: ReminderEntity): Reminder {
    return new Reminder(
      entity.uuid,
      entity.task.id,
      entity.reminderTime,
      entity.sent,
      entity.id,
    );
  }

  static toEntity(
    reminder: Reminder,
  ): Omit<ReminderEntity, "id" | "task"> & { id?: number; taskId: number } {
    return {
      uuid: reminder.uuid,
      taskId: reminder.taskId,
      reminderTime: reminder.reminderTime,
      sent: reminder.sent,
      id: reminder.id || undefined,
    };
  }
}
