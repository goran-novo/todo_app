export class TaskCategory {
  constructor(
    public userId: number,
    public taskId: number,
    public id?: number,
  ) {}

  static create(taskId: number, categoryId: number): TaskCategory {
    return new TaskCategory(taskId, categoryId);
  }
}
