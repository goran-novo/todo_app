import { ApiProperty } from "@nestjs/swagger";
import { TaskStatus } from "src/domain/models/enum/task.status.enum";

export class TaskResponseDto {
  @ApiProperty({
    example: "123e4567-e89b-12d3-a456-426614174000",
    description: "The UUID of the task",
  })
  uuid: string;

  @ApiProperty({
    example: "Complete project",
    description: "The title of the task",
  })
  title: string;

  @ApiProperty({
    example: "Finish the project documentation",
    description: "The description of the task",
    required: false,
    nullable: true,
  })
  description: string | null;

  @ApiProperty({
    enum: TaskStatus,
    example: TaskStatus.PENDING,
    description: "The status of the task",
  })
  status: TaskStatus;

  @ApiProperty({
    example: "2023-12-31T23:59:59Z",
    description: "The deadline of the task",
    required: false,
    nullable: true,
  })
  deadline: Date | null;

  @ApiProperty({
    example: "2023-12-30T09:00:00Z",
    description: "The reminder time for the task",
    required: false,
    nullable: true,
  })
  reminderTime: Date | null;

  @ApiProperty({
    example: 1,
    description: "The ID of the user who owns the task",
  })
  userId: number;
}

export class AddCategoriesResponseDto {
  @ApiProperty({
    example: "123e4567-e89b-12d3-a456-426614174000",
    description: "The UUID of the task",
  })
  uuid: string;

  @ApiProperty({ example: "Work", description: "Category name" })
  name: string;
}
