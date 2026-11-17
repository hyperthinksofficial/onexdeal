import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import type { ApiErrorEnvelope } from '@onexdeal/types';
import { scrubSensitiveData } from '@onexdeal/utils';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: Record<string, unknown>;

  constructor(
    statusCode: number,
    code: string,
    message: string,
    details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

/**
 * Central Express error handler returning standard `{ error: { code, message, details?, requestId } }`
 * envelopes without leaking stack traces or unredacted PII.
 */
export function errorHandlerMiddleware(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const requestId = req.requestId ?? 'unknown';

  if (err instanceof ZodError) {
    const body: ApiErrorEnvelope = {
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Request validation failed.',
        details: {
          issues: err.issues.map((issue) => ({
            path: issue.path.join('.'),
            message: issue.message,
          })),
        },
        requestId,
      },
    };
    res.status(400).json(body);
    return;
  }

  if (err instanceof AppError) {
    const body: ApiErrorEnvelope = {
      error: {
        code: err.code,
        message: err.message,
        ...(err.details ? { details: scrubSensitiveData(err.details) } : {}),
        requestId,
      },
    };
    res.status(err.statusCode).json(body);
    return;
  }

  console.error(
    JSON.stringify(
      scrubSensitiveData({
        level: 'error',
        requestId,
        path: req.originalUrl,
        method: req.method,
        message: err instanceof Error ? err.message : 'Unexpected error',
      }),
    ),
  );

  const body: ApiErrorEnvelope = {
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected server error occurred.',
      requestId,
    },
  };
  res.status(500).json(body);
}
