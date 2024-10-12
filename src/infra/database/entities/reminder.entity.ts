import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  JoinColumn,
} from "typeorm";
import { TaskEntity } from "./task.entity";

@Entity("reminders")
export class ReminderEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "uuid", unique: true })
  uuid: string;

  @Column()
  taskId: number;

  @ManyToOne(() => TaskEntity)
  @JoinColumn({ name: "taskId" })
  task: TaskEntity;

  @Column({ type: "timestamp" })
  reminderTime: Date;

  @Column({ default: false })
  sent: boolean;
}
