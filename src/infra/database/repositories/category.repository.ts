import { CategoryMapper } from "src/domain/mappers/category.mapper";
import { Category } from "src/domain/models/category.model";
import { DataSource } from "typeorm";
import { CategoryEntity } from "../entities/category.entity";
import { GenericRepository, IEntity } from "./generic.repository";
import { UserCategoryEntity } from "../entities/userCategory.entity";
import { UserCategory } from "src/domain/models/userCategory.model";

export class CategoryRepository extends GenericRepository<CategoryEntity> {
  private userCategoryRepository: GenericRepository<UserCategoryEntity>;

  constructor(dataSource: DataSource) {
    super(CategoryEntity, dataSource);
    this.userCategoryRepository = new GenericRepository<UserCategoryEntity>(
      UserCategoryEntity,
      dataSource,
    );
  }

  async createCategory(
    category: Omit<Category, "id" | "uuid">,
    userId: number,
  ): Promise<Category> {
    const categoryEntity = CategoryMapper.toEntity(
      Category.create(category.name),
    );
    const savedEntity = await this.create(categoryEntity);
    await this.userCategoryRepository.create({
      userId,
      categoryId: savedEntity.id,
    });
    return CategoryMapper.toDomain(savedEntity);
  }

  async getCategoriesByUser(userId: number): Promise<Category[]> {
    const categories = await this.repository
      .createQueryBuilder("category")
      .innerJoin(UserCategoryEntity, "uc", "uc.categoryId = category.id")
      .where("uc.userId = :userId", { userId })
      .getMany();

    return categories.map(CategoryMapper.toDomain);
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

  async deleteCategory(uuid: string): Promise<void> {
    await this.dataSource.transaction(async (transactionalEntityManager) => {
      const category = await transactionalEntityManager.findOne(
        CategoryEntity,
        { where: { uuid } },
      );

      if (category) {
        await transactionalEntityManager
          .createQueryBuilder()
          .delete()
          .from(UserCategoryEntity)
          .where("categoryId = :categoryId", { categoryId: category.id })
          .execute();
        await transactionalEntityManager.remove(category);
      }
    });
  }

  async addCategoryToUser(categoryId: number, userId: number): Promise<void> {
    const userCategory = UserCategory.create(userId, categoryId);
    await this.userCategoryRepository.create(userCategory);
  }

  async removeCategoryFromUser(
    categoryId: number,
    userId: number,
  ): Promise<void> {
    const userCategory = await this.userCategoryRepository.findOne({
      userId,
      categoryId,
    });
    if (userCategory) {
      await this.userCategoryRepository.delete(userCategory.id);
    }
  }

  async getUsersForCategory(categoryId: number): Promise<number[]> {
    const userCategories = await this.userCategoryRepository.findAll({
      categoryId,
    });
    return userCategories.map((uc) => uc.userId);
  }
}
