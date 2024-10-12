import { Module } from "@nestjs/common";
import { DataSource } from "typeorm";
import { DataAccessLayer } from "./data-access-layer";

@Module({
  providers: [
    {
      provide: DataAccessLayer,
      useFactory: (dataSource: DataSource) => new DataAccessLayer(dataSource),
      inject: [DataSource],
    },
  ],
  exports: [DataAccessLayer],
})
export class DataAccessModule {}
