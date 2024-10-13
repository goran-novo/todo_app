import { Injectable } from "@nestjs/common";
import { Category } from "src/domain/models/category.model";
import { DataAccessLayer } from "src/infra/database/data-access-layer";

@Injectable()
export class CategoryService {
  constructor(private readonly dal: DataAccessLayer) {}

  async createCategory(name: string): Promise<Category> {
    const newCategory = Category.create(name);
    return await this.dal.category.createCategory(newCategory);
  }

  async findOrCreateCategory(categoryName: string): Promise<Category> {
    let category = await this.dal.category.findCategoryByName(categoryName);
    if (!category) {
      category = await this.dal.category.createCategory({ name: categoryName });
    }
    return category;
  }

  async findOrCreateCategories(categoryNames: string[]): Promise<Category[]> {
    const existingCategories =
      await this.dal.category.findCategoriesByNames(categoryNames);
    const existingCategoryNames = existingCategories.map((c) => c.name);
    const newCategoryNames = categoryNames.filter(
      (name) => !existingCategoryNames.includes(name),
    );

    let newCategories: Category[] = [];
    if (newCategoryNames.length > 0) {
      newCategories =
        await this.dal.category.createCategories(newCategoryNames);
    }

    return [...existingCategories, ...newCategories];
  }

  async findCategoryByName(categoryName: string): Promise<Category | null> {
    return await this.dal.category.findCategoryByName(categoryName);
  }

  async findCategoriesByUuids(categoryUuids: string[]): Promise<Category[]> {
    return this.dal.category.findCategoriesByUuids(categoryUuids);
  }
}
