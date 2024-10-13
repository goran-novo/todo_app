import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Column,
} from "typeorm";
import { TaskEntity } from "./task.entity";
import { CategoryEntity } from "./category.entity";

@Entity("task_categories")
export class TaskCategoryEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => TaskEntity, (task) => task.taskCategories)
  @JoinColumn({ name: "taskId" })
  task: TaskEntity;

  @Column()
  taskId: number;

  @ManyToOne(() => CategoryEntity, (category) => category.taskCategories)
  @JoinColumn({ name: "categoryId" })
  category: CategoryEntity;

  @Column()
  categoryId: number;

  @CreateDateColumn()
  createdAt: Date;
}
