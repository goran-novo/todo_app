import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Column,
} from "typeorm";
import { CategoryEntity } from "./category.entity";
import { UserEntity } from "./user.entity";

@Entity("user_categories")
export class UserCategoryEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => UserEntity, (user) => user.userCategories)
  @JoinColumn({ name: "userId" })
  user: UserEntity;

  @Column()
  userId: number;

  @ManyToOne(() => CategoryEntity, (category) => category.userCategories)
  @JoinColumn({ name: "categoryId" })
  category: CategoryEntity;

  @Column()
  categoryId: number;

  @CreateDateColumn()
  createdAt: Date;
}
