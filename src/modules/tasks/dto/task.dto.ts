import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsDate,
  IsUUID,
} from "class-validator";
import { Type } from "class-transformer";

export class CreateTaskDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsUUID()
  categoryUuid: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  deadline?: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  reminderTime?: Date;
}

export class UpdateTaskStatusDto {
  @IsNotEmpty()
  @IsString()
  status: string;
}

export class SearchTaskDto {
  @IsNotEmpty()
  @IsString()
  query: string;
}

export class FilterTasksByDeadlineDto {
  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  startDate: Date;

  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  endDate: Date;
}
