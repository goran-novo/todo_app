import { Task } from "../models/task.model";

export class TaskArchivedEvent {
  constructor(public readonly task: Task) {}
}
