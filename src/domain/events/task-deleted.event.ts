import { Task } from "../models/task.model";

export class TaskDeletedEvent {
  constructor(public readonly task: Task) {}
}
