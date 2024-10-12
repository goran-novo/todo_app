import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  JoinColumn,
} from "typeorm";
import { TaskEntity } from "./task.entity";
import { UserEntity } from "./user.entity";
import { UserCategoryEntity } from "./userCategory.entity";

@Entity("categories")
export class CategoryEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "uuid", unique: true })
  uuid: string;

  @Column()
  name: string;

  @OneToMany(() => UserCategoryEntity, (userCategory) => userCategory.category)
  userCategories: UserCategoryEntity[];

  @OneToMany(() => TaskEntity, (task) => task.category)
  tasks: TaskEntity[];
}
