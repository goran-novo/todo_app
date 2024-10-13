import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  JoinColumn,
} from "typeorm";
import { UserEntity } from "./user.entity";
import { TaskStatus } from "../../../domain/models/enum/task.status.enum";
import { TaskCategoryEntity } from "./taskCategory.entity";

@Entity("tasks")
@Index("idx_tasks_user_id", ["user"])
@Index("idx_tasks_uuid", ["uuid"], { unique: true })
@Index("idx_tasks_status", ["status"])
@Index("idx_tasks_deadline", ["deadline"])
@Index("idx_tasks_title_description", ["title", "description"])
export class TaskEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "uuid", unique: true })
  uuid: string;

  @Column()
  title: string;

  @Column({ nullable: true, type: "text" })
  description: string | null;

  @Column({
    type: "enum",
    enum: TaskStatus,
    default: TaskStatus.PENDING,
  })
  status: TaskStatus;

  @Column({ nullable: true, type: "timestamp" })
  deadline: Date | null;

  @Column({ nullable: true, type: "timestamp" })
  reminderTime: Date | null;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: "userId" })
  user: UserEntity;

  @Column()
  userId: number;

  @OneToMany(() => TaskCategoryEntity, (taskCategory) => taskCategory.task)
  taskCategories: TaskCategoryEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
