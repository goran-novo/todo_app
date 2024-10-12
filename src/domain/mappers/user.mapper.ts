import { UserEntity } from "src/infra/database/entities/user.entity";
import { User } from "../models/user.model";

export class UserMapper {
  static toDomain(entity: UserEntity): User {
    return new User(entity.uuid, entity.email, entity.password, entity.id);
  }

  static toEntity(
    user: User,
  ): Omit<
    UserEntity,
    "id" | "tasks" | "createdAt" | "updatedAt" | "userCategories"
  > & { id?: number } {
    return {
      uuid: user.uuid,
      email: user.email,
      password: user.getPasswordHash(),
      id: user.id || undefined,
    };
  }
}
