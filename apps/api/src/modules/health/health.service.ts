import type { HealthCheckData } from '@onexdeal/types';
import { loadApiEnv } from '../../config/env.js';

/**
 * Service layer for system health status.
 * Follows `route -> controller -> service` architecture.
 */
export class HealthService {
  public getHealthStatus(): HealthCheckData {
    const env = loadApiEnv();
    return {
      status: 'ok',
      service: 'onexdeal-api',
      version: '0.1.0',
      environment: env.NODE_ENV,
      timestamp: new Date().toISOString(),
    };
  }
}
