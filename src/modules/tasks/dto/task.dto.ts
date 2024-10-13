import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsDate,
  IsUUID,
  IsNumber,
  IsArray,
  ArrayNotEmpty,
} from "class-validator";
import { Type } from "class-transformer";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { TaskStatus } from "src/domain/models/enum/task.status.enum";

export class CreateTaskDto {
  @ApiProperty({
    example: "Complete project",
    description: "The title of the task",
  })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiPropertyOptional({
    example: "Finish the documentation and submit for review",
    description: "Optional description of the task",
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    example: ["Work", "Project A"],
    description: "Array of category names for the task",
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  categoryNames?: string[];

  @ApiPropertyOptional({
    example: "2023-12-31T23:59:59Z",
    description: "The deadline for the task",
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  deadline?: Date;

  @ApiPropertyOptional({
    example: "2023-12-30T09:00:00Z",
    description: "The time to set a reminder for the task",
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  reminderTime?: Date;
}

export class UpdateTaskStatusDto {
  @ApiProperty({
    example: TaskStatus.COMPLETED,
    description: "The new status of the task",
  })
  @IsNotEmpty()
  @IsString()
  status: string;
}

export class AddCategoriesToTaskDto {
  @ApiProperty({
    example: ["Work", "Project A"],
    description: "Array of category names to add to the task",
  })
  @IsArray()
  @IsString({ each: true })
  @ArrayNotEmpty()
  categoryNames: string[];
}

export class RemoveCategoriesFromTaskDto {
  @ApiProperty({
    example: [
      "123e4567-e89b-12d3-a456-426614174000",
      "123e4567-e89b-12d3-a456-426614174001",
    ],
    description: "Array of category UUIDs to remove from the task",
  })
  @IsArray()
  @IsUUID("4", { each: true })
  @ArrayNotEmpty()
  categoryUuids: string[];
}

export class SearchTaskDto {
  @ApiProperty({
    example: "project",
    description: "The search query to find tasks",
  })
  @IsNotEmpty()
  @IsString()
  query: string;
}

export class FilterTasksByDeadlineDto {
  @ApiProperty({
    example: "2023-01-01T00:00:00Z",
    description: "The start date for filtering tasks",
  })
  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  startDate: Date;

  @ApiProperty({
    example: "2023-12-31T23:59:59Z",
    description: "The end date for filtering tasks",
  })
  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  endDate: Date;
}
