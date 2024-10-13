import { Process, Processor } from "@nestjs/bull";
import { Injectable } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { Job } from "bull";
import { EventNames } from "src/domain/events/event-names";
import { TaskArchivedEvent } from "src/domain/events/task-archived.event";
import { TaskStatus } from "src/domain/models/enum/task.status.enum";
import { Task } from "src/domain/models/task.model";
import { QueueJobNames, QueueNames } from "src/domain/queues/queue-names";
import { DataAccessLayer } from "src/infra/database/data-access-layer";

@Injectable()
@Processor(QueueNames.TaskArchivingQueue)
export class TaskArchiveProcessor {
  constructor(
    private readonly dal: DataAccessLayer,
    private readonly eventEmitter: EventEmitter2,
  ) { }

  @Process(QueueJobNames.ArchiveTaskJob)
  async handleArchiveTask(job: Job<{ task: Task }>) {
    const { task } = job.data;

    await this.dal.task.updateTaskStatus(task.uuid, TaskStatus.ARCHIVED);

    this.eventEmitter.emit(
      EventNames.TaskArchived,
      new TaskArchivedEvent(task),
    );
  }
}
