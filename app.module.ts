import { BullModule } from "@nestjs/bull";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { DatabaseModule } from "./src/infra/database/database.module";
import { AuthModule } from "./src/modules/auth/auth.module";
import { Module } from "@nestjs/common";
import { UserModule } from "./src/modules/users/user.module";
import * as path from 'path';
import { TaskModule } from "src/modules/tasks/task.module";
import { ReminderModule } from "src/modules/reminders/reminder.module";
import { EventEmitterModule } from "@nestjs/event-emitter";


@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: path.join(process.cwd(), '.env'),
      isGlobal: true,
    }),
    EventEmitterModule.forRoot(),
    DatabaseModule.forRoot(),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        redis: {
          host: configService.get('REDIS_HOST'),
          port: configService.get('REDIS_PORT', 6379),
        },
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UserModule,
    TaskModule,
    ReminderModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
