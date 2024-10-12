import { Injectable } from "@nestjs/common";
import { User } from "src/domain/models/user.model";
import { DataAccessLayer } from "src/infra/database/data-access-layer";

@Injectable()
export class UserService {
  constructor(private readonly dal: DataAccessLayer) {}

  async createUser(email: string, password: string): Promise<User> {
    const user = await User.create(email, password);
    return this.dal.user.createUser(user);
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.dal.user.findByEmail(email);
    if (user && (await user.validatePassword(password))) {
      return user;
    }
    return null;
  }

  async findUserByEmail(email: string): Promise<User | null> {
    return this.dal.user.findByEmail(email);
  }

  async updateUser(
    userId: number,
    userData: Partial<User>,
  ): Promise<User | null> {
    return this.dal.user.updateUser(userId, userData);
  }

  async deleteUser(userId: number): Promise<void> {
    await this.dal.user.delete(userId);
  }

  async findUserById(userId: number): Promise<User | null> {
    return this.dal.user.getUserById(userId);
  }
}
