import { DataSource } from "typeorm";
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config();

export default new DataSource({
    type: "postgres",
    host: process.env.DB_HOST,
    port: 54320,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities: [path.join(__dirname, 'src', '**', '*.entity.{ts,js}')],
    migrations: [path.join(__dirname, 'src', 'migrations', '*{.ts,.js}')],
    synchronize: false,
    logging: true,
});