import { z } from 'zod';

/**
 * Environment schema for OneXDeal API (`apps/api`).
 * Validates non-functional baseline settings at startup.
 */
const ApiEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'staging', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  CORS_ALLOWED_ORIGINS: z
    .string()
    .default('http://localhost:3000,http://localhost:8081')
    .transform((val) =>
      val
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean),
    ),
  SOCKET_IO_ADAPTER: z.enum(['memory', 'redis']).default('memory'),
  STORAGE_PROVIDER: z.enum(['r2', 's3']).default('r2'),
  EMAIL_PROVIDER: z.enum(['smtp', 'console']).default('smtp'),
  PUSH_PROVIDER: z.enum(['expo', 'noop']).default('expo'),
});

export type ApiEnv = z.infer<typeof ApiEnvSchema>;

export function loadApiEnv(rawEnv: NodeJS.ProcessEnv = process.env): ApiEnv {
  return ApiEnvSchema.parse(rawEnv);
}
