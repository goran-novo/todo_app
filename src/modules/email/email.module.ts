import { BullModule } from "@nestjs/bull";
import { Module } from "@nestjs/common";

import { ConfigModule } from "@nestjs/config";
import { EmailProcessor } from "./email.processor";
import { EmailService } from "./email.service";

@Module({
  imports: [
    ConfigModule,
    BullModule.registerQueue({
      name: "email",
      redis: {
        host: "localhost",
        port: 6379,
      },
    }),
  ],
  providers: [EmailService, EmailProcessor],
  exports: [EmailService],
})
export class EmailModule {}
