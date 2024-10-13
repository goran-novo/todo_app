import { CategoryMapper } from "src/domain/mappers/category.mapper";
import { Category } from "src/domain/models/category.model";
import { DataSource, In } from "typeorm";
import { CategoryEntity } from "../entities/category.entity";
import { GenericRepository, IEntity } from "./generic.repository";

export class CategoryRepository extends GenericRepository<CategoryEntity> {
  constructor(dataSource: DataSource) {
    super(CategoryEntity, dataSource);
  }

  async createCategory(
    category: Omit<Category, "id" | "uuid">,
  ): Promise<Category> {
    const categoryEntity = CategoryMapper.toEntity(
      Category.create(category.name),
    );
    const savedEntity = await this.create(categoryEntity);
    return CategoryMapper.toDomain(savedEntity);
  }

  async findCategoriesByUuids(uuids: string[]): Promise<Category[]> {
    const categoryEntities = await this.repository.find({
      where: { uuid: In(uuids) },
    });
    return categoryEntities.map(CategoryMapper.toDomain);
  }

  async findCategoryByName(name: string): Promise<Category | null> {
    const categoryEntity = await this.repository.findOne({ where: { name } });
    return categoryEntity ? CategoryMapper.toDomain(categoryEntity) : null;
  }

  async findCategoriesByNames(names: string[]): Promise<Category[]> {
    const categoryEntities = await this.repository.find({
      where: { name: In(names) },
    });
    return categoryEntities.map(CategoryMapper.toDomain);
  }
  async createCategories(names: string[]): Promise<Category[]> {
    const categories = names.map((name) => Category.create(name));
    const categoryEntities = categories.map(CategoryMapper.toEntity);
    const savedEntities = await this.repository.save(categoryEntities);
    return savedEntities.map(CategoryMapper.toDomain);
  }

  async updateCategory(
    uuid: string,
    categoryData: Partial<Category>,
  ): Promise<Category | null> {
    const existingCategory = await this.findByUuid(uuid);
    if (!existingCategory) return null;
    const updatedCategoryEntity = {
      ...existingCategory,
      ...CategoryMapper.toEntity(categoryData as Category),
    };
    const savedEntity = await this.update(
      existingCategory.id,
      updatedCategoryEntity,
    );
    return savedEntity ? CategoryMapper.toDomain(savedEntity) : null;
  }

  async findCategoryById(id: number): Promise<Category | null> {
    const categoryEntity = await this.findById(id);
    return categoryEntity ? CategoryMapper.toDomain(categoryEntity) : null;
  }

  async findCategoryByUuid(uuid: string): Promise<Category | null> {
    const categoryEntity = await this.findByUuid(uuid);
    return categoryEntity ? CategoryMapper.toDomain(categoryEntity) : null;
  }
}
