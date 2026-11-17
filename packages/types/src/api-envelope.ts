import { z } from 'zod';

/**
 * Standard pagination metadata for cursor and page-based API responses.
 */
export const PaginationMetaSchema = z.object({
  nextCursor: z.string().nullable().optional(),
  hasMore: z.boolean().optional(),
  totalCount: z.number().int().nonnegative().optional(),
  limit: z.number().int().positive().optional(),
});
export type PaginationMeta = z.infer<typeof PaginationMetaSchema>;

/**
 * Standard machine-readable error payload returned by `/api/v1` endpoints.
 */
export const ApiErrorDetailSchema = z.object({
  code: z.string(),
  message: z.string(),
  details: z.record(z.string(), z.unknown()).optional(),
  requestId: z.string(),
});
export type ApiErrorDetail = z.infer<typeof ApiErrorDetailSchema>;

export const ApiErrorEnvelopeSchema = z.object({
  error: ApiErrorDetailSchema,
});
export type ApiErrorEnvelope = z.infer<typeof ApiErrorEnvelopeSchema>;

/**
 * Helper to construct a typed success response envelope `{ data, meta? }`.
 */
export function createSuccessEnvelopeSchema<T extends z.ZodTypeAny>(dataSchema: T) {
  return z.object({
    data: dataSchema,
    meta: PaginationMetaSchema.optional(),
  });
}

export interface ApiSuccessEnvelope<TData> {
  data: TData;
  meta?: PaginationMeta;
}

/**
 * Health check response contract (`GET /api/v1/health`).
 */
export const HealthCheckDataSchema = z.object({
  status: z.enum(['ok', 'degraded']),
  service: z.string(),
  version: z.string(),
  environment: z.string(),
  timestamp: z.string().datetime(),
});
export type HealthCheckData = z.infer<typeof HealthCheckDataSchema>;
