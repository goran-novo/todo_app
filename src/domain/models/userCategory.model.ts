export class UserCategory {
  constructor(
    public userId: number,
    public categoryId: number,
    public id?: number,
  ) {}

  static create(userId: number, categoryId: number): UserCategory {
    return new UserCategory(userId, categoryId);
  }
}
