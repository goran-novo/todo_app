import { DataAccessModule } from "src/infra/database/dal.module";
import { CategoryService } from "./category.service";
import { Module } from "@nestjs/common";
import { CategoryController } from "./category.controller";

@Module({
  imports: [DataAccessModule],
  controllers: [CategoryController],
  providers: [CategoryService],
  exports: [CategoryService],
})
export class CategoryModule {}
