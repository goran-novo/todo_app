import { ReminderMapper } from "src/domain/mappers/reminder.mapper";
import { Reminder } from "src/domain/models/reminder.model";
import { DataSource, LessThan } from "typeorm";
import { ReminderEntity } from "../entities/reminder.entity";
import { GenericRepository } from "./generic.repository";

export class ReminderRepository extends GenericRepository<ReminderEntity> {
  constructor(dataSource: DataSource) {
    super(ReminderEntity, dataSource);
  }

  async findReminder(reminderUuid: string): Promise<Reminder | null> {
    const reminderEntity = await this.repository.findOne({
      where: { uuid: reminderUuid },
      relations: ["task"],
    });

    return reminderEntity ? ReminderMapper.toDomain(reminderEntity) : null;
  }

  async createReminder(reminder: Omit<Reminder, "id">): Promise<Reminder> {
    const reminderEntity = ReminderMapper.toEntity(
      Reminder.create(reminder.taskId, reminder.reminderTime),
    );
    const savedEntity = await this.repository.save(reminderEntity);
    return ReminderMapper.toDomain(savedEntity);
  }

  async getRemindersByTask(taskId: number): Promise<Reminder[]> {
    const reminderEntities = await this.repository.find({
      where: { task: { id: taskId } },
      relations: ["task"],
    });
    return reminderEntities.map(ReminderMapper.toDomain);
  }

  async getPendingReminders(limit: number): Promise<Reminder[]> {
    const reminderEntities = await this.repository.find({
      where: {
        reminderTime: LessThan(new Date()),
        sent: false,
      },
      take: limit,
      order: { reminderTime: "ASC" },
    });
    return reminderEntities.map(ReminderMapper.toDomain);
  }

  async markReminderAsSent(uuid: string): Promise<void> {
    await this.repository
      .createQueryBuilder()
      .update(ReminderEntity)
      .set({ sent: true })
      .where("uuid = :uuid", { uuid })
      .execute();
  }
}
