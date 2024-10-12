import { TaskStatus } from "./enum/task.status.enum";
import { v4 as uuidv4 } from "uuid";

export class Task {
  private _id: number | null;

  constructor(
    public readonly uuid: string,
    public title: string,
    public description: string | null,
    public status: TaskStatus,
    public deadline: Date | null,
    public reminderTime: Date | null,
    public userId: number,
    public categoryId: number,
    id?: number,
  ) {
    this._id = id || null;
  }

  static create(
    title: string,
    description: string | null,
    userId: number,
    categoryId: number,
    deadline: Date | null = null,
    reminderTime: Date | null = null,
  ): Task {
    return new Task(
      uuidv4(),
      title,
      description,
      TaskStatus.PENDING,
      deadline,
      reminderTime,
      userId,
      categoryId,
    );
  }

  updateStatus(newStatus: TaskStatus): void {
    this.status = newStatus;
  }

  get id(): number | null {
    return this._id;
  }
}
