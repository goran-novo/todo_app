import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
} from "@nestjs/common";
import { TaskService } from "./task.service";
import {
  CreateTaskDto,
  UpdateTaskStatusDto,
  SearchTaskDto,
  FilterTasksByDeadlineDto,
} from "./dto/task.dto";

import { JwtAuthGuard } from "src/jwt/jwt.guard";
import { CurrentUser } from "src/jwt/decorators/current-user.decorator";

@Controller("tasks")
@UseGuards(JwtAuthGuard)
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Post()
  async createTask(
    @CurrentUser("id") userId: number,
    @Body() createTaskDto: CreateTaskDto,
  ) {
    return this.taskService.createTask(
      userId,
      createTaskDto.categoryUuid,
      createTaskDto,
    );
  }

  @Put(":uuid/status")
  async updateTaskStatus(
    @CurrentUser("id") userId: number,
    @Param("uuid") taskUuid: string,
    @Body() updateTaskStatusDto: UpdateTaskStatusDto,
  ) {
    return this.taskService.updateTaskStatus(
      userId,
      taskUuid,
      updateTaskStatusDto.status,
    );
  }

  @Get("search")
  async searchTasks(
    @CurrentUser("id") userId: number,
    @Query() searchTaskDto: SearchTaskDto,
  ) {
    return this.taskService.searchTasks(userId, searchTaskDto.query);
  }

  @Get("filter")
  async filterTasksByDeadline(
    @CurrentUser("id") userId: number,
    @Query() filterTasksDto: FilterTasksByDeadlineDto,
  ) {
    return this.taskService.filterTasksByDeadline(
      userId,
      new Date(filterTasksDto.startDate),
      new Date(filterTasksDto.endDate),
    );
  }
}
