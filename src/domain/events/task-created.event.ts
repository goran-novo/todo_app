import { Task } from "../models/task.model";

export class TaskCreatedEvent {
  constructor(public readonly task: Task) {}
}
