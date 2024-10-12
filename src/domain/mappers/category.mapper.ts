import { CategoryEntity } from "src/infra/database/entities/category.entity";
import { Category } from "../models/category.model";

export class CategoryMapper {
  static toDomain(entity: CategoryEntity): Category {
    return new Category(entity.uuid, entity.name, entity.id);
  }

  static toEntity(
    category: Category,
  ): Omit<CategoryEntity, "id" | "tasks" | "userCategories"> & { id?: number } {
    return {
      uuid: category.uuid,
      name: category.name,
      id: category.id || undefined,
    };
  }
}
