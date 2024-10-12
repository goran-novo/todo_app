import { Process, Processor } from "@nestjs/bull";
import { Injectable } from "@nestjs/common";
import { Job } from "bull";
import { TaskStatus } from "src/domain/models/enum/task.status.enum";
import { DataAccessLayer } from "src/infra/database/data-access-layer";

@Injectable()
@Processor("taskArchive")
export class TaskArchiveProcessor {
  constructor(private readonly dal: DataAccessLayer) {}

  @Process("archiveTask")
  async handleArchiveTask(job: Job<{ taskUuid: string }>) {
    const { taskUuid } = job.data;
    await this.dal.task.updateTaskStatus(taskUuid, TaskStatus.ARCHIVED);
  }
}
