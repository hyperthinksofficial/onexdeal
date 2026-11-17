import cors from 'cors';
import express, { type Express } from 'express';
import helmet from 'helmet';
import { loadApiEnv } from './config/env.js';
import { AppError, errorHandlerMiddleware } from './middleware/error-handler.js';
import { requestIdMiddleware } from './middleware/request-id.js';
import { createHealthRouter } from './modules/health/health.routes.js';

/**
 * Creates the Express application for OneXDeal modular monolith (`apps/api`).
 * Phase 0 includes only non-functional middleware and `/api/v1/health`.
 */
export function createApp(): Express {
  const env = loadApiEnv();
  const app = express();

  app.disable('x-powered-by');
  app.use(requestIdMiddleware);
  app.use(helmet());
  app.use(
    cors({
      origin: env.CORS_ALLOWED_ORIGINS,
      credentials: true,
    }),
  );
  app.use(express.json({ limit: '1mb' }));

  app.use('/api/v1/health', createHealthRouter());

  app.use((_req, _res, next) => {
    next(new AppError(404, 'RESOURCE_NOT_FOUND', 'The requested API endpoint does not exist.'));
  });

  app.use(errorHandlerMiddleware);

  return app;
}
