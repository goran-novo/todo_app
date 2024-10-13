import { Entity, Column, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { TaskCategoryEntity } from "./taskCategory.entity";

@Entity("categories")
export class CategoryEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "uuid", unique: true })
  uuid: string;

  @Column()
  name: string;
  @OneToMany(() => TaskCategoryEntity, (taskCategory) => taskCategory.category)
  taskCategories: TaskCategoryEntity[];
}
