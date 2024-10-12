import { Injectable } from "@nestjs/common";
import { InjectQueue } from "@nestjs/bull";
import { Queue } from "bull";

@Injectable()
export class EmailService {
  constructor(@InjectQueue("email") private emailQueue: Queue) {}

  async sendReminderEmail(email: string, taskTitle: string) {
    await this.emailQueue.add("send-reminder", {
      email,
      taskTitle,
    });
  }
}
