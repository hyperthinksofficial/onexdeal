import type { Request, Response } from 'express';
import type { ApiSuccessEnvelope, HealthCheckData } from '@onexdeal/types';
import { HealthService } from './health.service.js';

/**
 * Controller for `/api/v1/health`.
 */
export class HealthController {
  private readonly healthService: HealthService;

  constructor(healthService: HealthService = new HealthService()) {
    this.healthService = healthService;
  }

  public getHealth = (_req: Request, res: Response<ApiSuccessEnvelope<HealthCheckData>>): void => {
    const data = this.healthService.getHealthStatus();
    res.status(200).json({ data });
  };
}
