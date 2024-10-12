import { Module, Global, DynamicModule } from "@nestjs/common";
import { AppDataSource } from "./datasource";
import { DataSource } from "typeorm";
import { DataAccessLayer } from "./data-access-layer";

@Global()
@Module({})
export class DatabaseModule {
  static forRoot(): DynamicModule {
    return {
      module: DatabaseModule,
      providers: [
        {
          provide: DataSource,
          useFactory: async () => {
            if (!AppDataSource.isInitialized) {
              await AppDataSource.initialize();
            }
            console.log("Data Source has been initialized!");
            return AppDataSource;
          },
        },
        DataAccessLayer,
      ],
      exports: [DataSource, DataAccessLayer],
    };
  }
}