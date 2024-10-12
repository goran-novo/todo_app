import {
  Repository,
  EntityTarget,
  DataSource,
  FindOptionsWhere,
  DeepPartial,
  ObjectLiteral,
} from "typeorm";

export interface IEntity {
  id: number;
  uuid?: string;
}

export class GenericRepository<T extends ObjectLiteral & IEntity> {
  protected repository: Repository<T>;

  constructor(
    protected entity: EntityTarget<T>,
    protected dataSource: DataSource,
  ) {
    this.repository = this.dataSource.getRepository(this.entity);
  }

  async findById(id: number): Promise<T | null> {
    return this.repository.findOne({ where: { id } as FindOptionsWhere<T> });
  }

  async findByUuid(uuid: string): Promise<T | null> {
    return this.repository.findOne({ where: { uuid } as FindOptionsWhere<T> });
  }

  async findAll(criteria: FindOptionsWhere<T>): Promise<T[]> {
    return this.repository.find({ where: criteria });
  }

  async findOne(criteria: FindOptionsWhere<T>): Promise<T | null> {
    return this.repository.findOne({ where: criteria });
  }

  async getAll(): Promise<T[]> {
    return this.repository.find();
  }

  async create(item: DeepPartial<T>): Promise<T> {
    const newItem = this.repository.create(item);
    return this.repository.save(newItem);
  }

  async update(id: number, item: DeepPartial<T>): Promise<T | null> {
    await this.repository.update(id, item);
    return this.findById(id);
  }

  async delete(id: number): Promise<void> {
    await this.repository.delete(id);
  }

  async deleteByUuid(uuid: string): Promise<void> {
    await this.repository.delete({ uuid } as FindOptionsWhere<T>);
  }
}
