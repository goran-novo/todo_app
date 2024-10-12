import { BullModule } from "@nestjs/bull";
import { ConfigModule } from "@nestjs/config";
import { DatabaseModule } from "./src/infra/database/database.module";
import { AuthModule } from "./src/modules/auth/auth.module";
import { Module } from "@nestjs/common";
import { UserModule } from "./src/modules/users/user.module";
import * as path from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: path.join(process.cwd(), '.env'),
      isGlobal: true,
    }),
    DatabaseModule.forRoot(),
    BullModule.forRoot({
      redis: {
        host: "localhost",
        port: 6379,
      },
    }),
    AuthModule,
    UserModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
