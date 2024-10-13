import { v4 as uuidv4 } from "uuid";

export class Reminder {
  private _id: number;

  constructor(
    public readonly uuid: string,
    public taskId: number,
    public reminderTime: Date,
    public sent: boolean,
    id?: number,
  ) {
    this._id = id || -1;
  }

  static create(taskId: number, reminderTime: Date): Reminder {
    return new Reminder(uuidv4(), taskId, reminderTime, false);
  }

  markAsSent(): void {
    this.sent = true;
  }

  get id(): number {
    return this._id;
  }
}
