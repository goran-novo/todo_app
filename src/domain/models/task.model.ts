import { TaskStatus } from "./enum/task.status.enum";
import { v4 as uuidv4 } from "uuid";

export class Task {
  private _id: number;

  constructor(
    public readonly uuid: string,
    public title: string,
    public description: string | null,
    public status: TaskStatus,
    public deadline: Date | null,
    public reminderTime: Date | null,
    public userId: number,
    id?: number,
  ) {
    this._id = id || -1;
    this.deadline = Task.ensureDate(deadline);
    this.reminderTime = Task.ensureDate(reminderTime);
  }

  static create(
    title: string,
    description: string | null,
    userId: number,
    deadline: Date | string | null = null,
    reminderTime: Date | string | null = null,
  ): Task {
    return new Task(
      uuidv4(),
      title,
      description,
      TaskStatus.PENDING,
      this.ensureDate(deadline),
      this.ensureDate(reminderTime),
      userId,
    );
  }

  updateStatus(newStatus: TaskStatus): void {
    this.status = newStatus;
  }

  get id(): number {
    return this._id;
  }

  private static ensureDate(value: Date | string | null): Date | null {
    if (value instanceof Date) {
      return value;
    }
    if (typeof value === "string") {
      const date = new Date(value);
      return isNaN(date.getTime()) ? null : date;
    }
    return null;
  }
}
