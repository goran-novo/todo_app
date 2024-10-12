import { DataSource } from "typeorm";
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

const projectRoot = process.cwd();
const envPath = path.join(projectRoot, '.env');

console.log('Attempting to load .env file from:', envPath);

if (fs.existsSync(envPath)) {
    console.log('.env file found');
    dotenv.config({ path: envPath });
} else {
    console.log('.env file not found');
    throw new Error('.env file is missing');
}

const appEnv = process.env.APP_ENV || 'local';
console.log(`Current APP_ENV: ${appEnv}`);

console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_PORT:', process.env.DB_PORT);
console.log('DB_USERNAME:', process.env.DB_USERNAME);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '[SET]' : '[NOT SET]');
console.log('DB_NAME:', process.env.DB_NAME);

export const AppDataSource = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || "5432"),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities: [path.join(__dirname, '..', '**', '*.entity.{ts,js}')],
    migrations: [path.join(__dirname, '..', 'migrations', '*.{ts,js}')],
    migrationsTableName: "migrations",
    synchronize: false,
    cache: false,
    logging: ["query", "error"],
    logger: "advanced-console",
});