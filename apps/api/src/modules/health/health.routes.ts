import { Router } from 'express';
import { HealthController } from './health.controller.js';

export function createHealthRouter(controller: HealthController = new HealthController()): Router {
  const router = Router();
  router.get('/', controller.getHealth);
  return router;
}
