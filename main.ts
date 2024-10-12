import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import * as path from 'path';

async function bootstrap() {
  const envPath = path.join(process.cwd(), '.env');
  console.log('Loading .env file from:', envPath);
  dotenv.config({ path: envPath });

  const appEnv = process.env.APP_ENV || 'local';
  console.log(`Current APP_ENV: ${appEnv}`);

  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}
bootstrap();