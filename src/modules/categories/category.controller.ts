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

  @Post()
  async createCategory(
    @CurrentUser("id") userId: number,
    @Body() createCategoryDto: CreateCategoryDto,
  ) {
    return this.categoryService.createCategory(userId, createCategoryDto.name);
  }

  @Get()
  async getCategoriesByUser(@CurrentUser("id") userId: number) {
    return this.categoryService.getCategoriesByUser(userId);
  }

  @Put(":uuid")
  async updateCategory(
    @Param("uuid") uuid: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoryService.updateCategory(uuid, updateCategoryDto);
  }

  @Get(":uuid")
  async getCategoryByUuid(@Param("uuid") uuid: string) {
    return this.categoryService.findCategoryByUuid(uuid);
  }

  @Delete(":uuid")
  async deleteCategory(@Param("uuid") uuid: string) {
    await this.categoryService.deleteCategory(uuid);
    return { message: "Category deleted successfully" };
  }
}
