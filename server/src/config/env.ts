import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  SERVER_PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().url(),
  JWT_ACCESS_SECRET: z.string().min(16),
  JWT_REFRESH_SECRET: z.string().min(16),
  JWT_ACCESS_EXPIRES_IN: z.string().default('7d'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('30d'),
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
  SEED_ADMIN_EMAIL: z.string().email().default('admin@renewcred.com'),
  SEED_ADMIN_PASSWORD: z.string().min(6).default('Admin@123'),
  SEED_ADMIN_NAME: z.string().default('Admin User'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
