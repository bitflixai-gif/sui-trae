import dotenv from 'dotenv';

dotenv.config();

export const config = {
  databaseUrl: process.env.DATABASE_URL ?? 'postgres://postgres:postgres@localhost:5432/sui24',
  port: Number(process.env.PORT ?? 3000),
  cronSecret: process.env.CRON_SECRET ?? '',
  jwtSecret: process.env.JWT_SECRET ?? 'super-secret-jwt-key',
  enableInProcessCron: process.env.ENABLE_INPROCESS_CRON === '1',
};
