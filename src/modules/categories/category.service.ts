import { Injectable } from "@nestjs/common";
import { Category } from "src/domain/models/category.model";
import { DataAccessLayer } from "src/infra/database/data-access-layer";

@Injectable()
export class CategoryService {
  constructor(private readonly dal: DataAccessLayer) {}

  async createCategory(userId: number, name: string): Promise<Category> {
    const category = Category.create(name);
    return this.dal.category.createCategory(category, userId);
  }

  async getCategoriesByUser(userId: number): Promise<Category[]> {
    return this.dal.category.getCategoriesByUser(userId);
  }

  async updateCategory(
    uuid: string,
    categoryData: Partial<Category>,
  ): Promise<Category | null> {
    return this.dal.category.updateCategory(uuid, categoryData);
  }

  async findCategoryByUuid(uuid: string): Promise<Category | null> {
    return this.dal.category.findCategoryByUuid(uuid);
  }

  async deleteCategory(uuid: string): Promise<void> {
    await this.dal.category.deleteByUuid(uuid);
  }
}
