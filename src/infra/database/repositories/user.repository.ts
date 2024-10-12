import { DataSource, In } from "typeorm";
import { UserEntity } from "../entities/user.entity";
import { GenericRepository } from "./generic.repository";
import { UserMapper } from "src/domain/mappers/user.mapper";
import { User } from "src/domain/models/user.model";

export class UserRepository extends GenericRepository<UserEntity> {
  constructor(dataSource: DataSource) {
    super(UserEntity, dataSource);
  }

  async findByEmail(email: string): Promise<User | null> {
    const userEntity = await this.repository.findOne({ where: { email } });
    return userEntity ? UserMapper.toDomain(userEntity) : null;
  }

  async createUser(userData: Omit<User, "id">): Promise<User> {
    const userEntity = UserMapper.toEntity(userData as User);
    const savedEntity = await this.create(userEntity);
    return UserMapper.toDomain(savedEntity);
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | null> {
    const existingUser = await this.findById(id);
    if (!existingUser) return null;

    const updatedUserEntity = {
      ...existingUser,
      ...UserMapper.toEntity(userData as User),
    };
    const savedEntity = await this.update(id, updatedUserEntity);
    return savedEntity ? UserMapper.toDomain(savedEntity) : null;
  }

  async getUserById(id: number): Promise<User | null> {
    const userEntity = await this.findById(id);
    return userEntity ? UserMapper.toDomain(userEntity) : null;
  }

  async getUsersByIds(ids: number[]): Promise<User[]> {
    const userEntities = await this.repository.find({
      where: { id: In(ids) },
    });
    return userEntities.map(UserMapper.toDomain);
  }
}
