import { existsSync } from 'node:fs';
import { DataSource } from 'typeorm';

// .env es opcional: en CI/producción las variables vienen del entorno.
if (existsSync('.env')) {
  process.loadEnvFile();
}

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export default new DataSource({
  type: 'postgres',
  host: process.env.POSTGRES_HOST ?? 'localhost',
  port: Number(required('POSTGRES_PORT')),
  username: required('POSTGRES_USER'),
  password: required('POSTGRES_PASSWORD'),
  database: required('POSTGRES_DB'),
  entities: ['src/**/*.entity.ts'],
  migrations: ['src/db/migrations/*.ts'],
  synchronize: false,
});
