import { ConfigService } from "@nestjs/config";
import { OnModuleInit, Logger, Injectable } from "@nestjs/common";
import * as nodemailer from "nodemailer";
import { promises as fs } from "fs";
import * as path from "path";

@Injectable()
export class EmailService implements OnModuleInit {
  private transporter: nodemailer.Transporter;
  private templates: { [key: string]: string } = {};
  private readonly logger = new Logger(EmailService.name);

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get("MAILTRAP_HOST"),
      port: this.configService.get("MAILTRAP_PORT"),
      auth: {
        user: this.configService.get("MAILTRAP_USER"),
        pass: this.configService.get("MAILTRAP_PASS"),
      },
    });
  }

  async onModuleInit() {
    await this.loadTemplates();
  }

  private async loadTemplates() {
    const projectRoot = process.cwd();
    const templatesDir = path.join(
      projectRoot,
      "src",
      "modules",
      "email",
      "templates",
    );
    try {
      const files = await fs.readdir(templatesDir);
      for (const file of files) {
        const templateName = path.parse(file).name;
        const content = await fs.readFile(
          path.join(templatesDir, file),
          "utf-8",
        );
        this.templates[templateName] = content;
        this.logger.log(`Loaded template: ${templateName}`);
      }
      this.logger.log("All email templates loaded successfully");
    } catch (error) {
      this.logger.error("Failed to load email templates", error.stack);
    }
  }

  private replaceTemplateVariables(
    template: string,
    variables: { [key: string]: string },
  ): string {
    return template.replace(/\{\{(\w+)\}\}/g, (_, key) => variables[key] || "");
  }

  async sendReminderEmail(email: string, taskTitle: string) {
    if (!this.templates["task-reminder"]) {
      throw new Error("Task reminder template not found");
    }

    const template = this.templates["task-reminder"];
    const html = this.replaceTemplateVariables(template, { taskTitle });

    try {
      await this.transporter.sendMail({
        from: this.configService.get("EMAIL_FROM"),
        to: email,
        subject: "Task Reminder",
        html: html,
      });
      this.logger.log(`Reminder email sent to ${email}`);
    } catch (error) {
      this.logger.error(
        `Failed to send reminder email to ${email}`,
        error.stack,
      );
      throw error;
    }
  }
}
