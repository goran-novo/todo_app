import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  JoinColumn,
} from "typeorm";
import { CategoryEntity } from "./category.entity";
import { UserEntity } from "./user.entity";
import { TaskStatus } from "src/domain/models/enum/task.status.enum";
@Entity("tasks")
@Index("idx_tasks_user_id", ["user"])
@Index("idx_tasks_uuid", ["uuid"], { unique: true })
@Index("idx_tasks_category_id", ["category"])
@Index("idx_tasks_status", ["status"])
@Index("idx_tasks_deadline", ["deadline"])
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

  @ManyToOne(() => CategoryEntity)
  @JoinColumn({ name: "categoryId" })
  category: CategoryEntity;

  @Column()
  categoryId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
