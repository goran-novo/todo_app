import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  NotFoundException,
  Delete,
} from "@nestjs/common";
import { TaskService } from "./task.service";
import {
  CreateTaskDto,
  UpdateTaskStatusDto,
  SearchTaskDto,
  FilterTasksByDeadlineDto,
  RemoveCategoriesFromTaskDto,
  AddCategoriesToTaskDto,
} from "./dto/task.dto";

import { JwtAuthGuard } from "src/jwt/jwt.guard";
import { CurrentUser } from "src/jwt/decorators/current-user.decorator";
import {
  AddCategoriesResponseDto,
  TaskResponseDto,
} from "./dto/task-response.dto";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { TaskMapper } from "src/domain/mappers/task.mapper";

@ApiTags("task")
@ApiBearerAuth("JWT-auth")
@Controller("tasks")
@UseGuards(JwtAuthGuard)
export class TaskController {
  constructor(private readonly taskService: TaskService) { }

  @Post()
  @ApiOperation({ summary: "Create a new task" })
  @ApiResponse({
    status: 201,
    description: "The task has been successfully created.",
    type: TaskResponseDto,
  })
  async createTask(
    @CurrentUser("id") userId: number,
    @Body() createTaskDto: CreateTaskDto,
  ): Promise<TaskResponseDto> {
    const task = await this.taskService.createTask(userId, createTaskDto);
    return TaskMapper.toDto(task);
  }

  @Put(":uuid/status")
  async updateTaskStatus(
    @CurrentUser("id") userId: number,
    @Param("uuid") taskUuid: string,
    @Body() updateTaskStatusDto: UpdateTaskStatusDto,
  ): Promise<TaskResponseDto> {

    const task = await this.taskService.updateTaskStatus(
      userId,
      taskUuid,
      updateTaskStatusDto.status,
    );

    if (!task) {
      throw new NotFoundException("Task not found");
    }
    return TaskMapper.toDto(task);
  }

  @Put(":uuid/categories")
  @ApiOperation({ summary: "Add categories to an existing task" })
  @ApiResponse({
    status: 200,
    description: "The categories have been successfully added to the task.",
    type: TaskResponseDto,
  })
  @ApiResponse({ status: 404, description: "Task not found" })
  async addCategoriesToTask(
    @CurrentUser("id") userId: number,
    @Param("uuid") taskUuid: string,
    @Body() addCategoriesToTaskDto: AddCategoriesToTaskDto,
  ): Promise<AddCategoriesResponseDto[]> {
    return await this.taskService.addCategoriesToTask(
      userId,
      taskUuid,
      addCategoriesToTaskDto.categoryNames,
    );
  }

  @Delete(":uuid/categories")
  @ApiOperation({ summary: "Remove categories from an existing task" })
  @ApiResponse({
    status: 200,
    description: "The categories have been successfully removed from the task.",
    type: TaskResponseDto,
  })
  @ApiResponse({ status: 404, description: "Task not found" })
  async removeCategoriesFromTask(
    @CurrentUser("id") userId: number,
    @Param("uuid") taskUuid: string,
    @Body() removeCategoriesFromTaskDto: RemoveCategoriesFromTaskDto,
  ): Promise<void> {
    return await this.taskService.removeCategoriesFromTask(
      userId,
      taskUuid,
      removeCategoriesFromTaskDto.categoryUuids,
    );
  }

  @Get("search")
  @ApiOperation({
    summary: "Search tasks",
    description: "Search for tasks based on a query string",
  })
  @ApiResponse({
    status: 200,
    description: "Returns an array of tasks matching the search query",
    type: [TaskResponseDto],
  })
  @ApiQuery({
    name: "query",
    type: String,
    required: true,
    description: "The search query to find tasks",
  })
  async searchTasks(
    @CurrentUser("id") userId: number,
    @Query() searchTaskDto: SearchTaskDto,
  ): Promise<TaskResponseDto[]> {
    return await this.taskService.searchTasks(userId, searchTaskDto.query);
  }

  @Get("filter")
  @ApiOperation({
    summary: "Filter tasks by deadline",
    description: "Get tasks within a specified date range",
  })
  @ApiResponse({
    status: 200,
    description: "Returns an array of tasks within the specified date range",
    type: [TaskResponseDto],
  })
  @ApiQuery({
    name: "startDate",
    type: Date,
    required: true,
    description: "The start date for filtering tasks (ISO 8601 format)",
  })
  @ApiQuery({
    name: "endDate",
    type: Date,
    required: true,
    description: "The end date for filtering tasks (ISO 8601 format)",
  })
  async filterTasksByDeadline(
    @CurrentUser("id") userId: number,
    @Query() filterTasksDto: FilterTasksByDeadlineDto,
  ): Promise<TaskResponseDto[]> {
    return await this.taskService.filterTasksByDeadline(
      userId,
      new Date(filterTasksDto.startDate),
      new Date(filterTasksDto.endDate),
    );
  }
}
