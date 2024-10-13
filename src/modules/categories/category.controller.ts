import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from "@nestjs/common";
import { CategoryService } from "./category.service";
import { JwtAuthGuard } from "src/jwt/jwt.guard";

import { CreateCategoryDto, UpdateCategoryDto } from "./dto/category.dto";
import { CurrentUser } from "src/jwt/decorators/current-user.decorator";

@Controller("categories")
@UseGuards(JwtAuthGuard)
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}
}
