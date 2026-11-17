import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createSuccessEnvelopeSchema, HealthCheckDataSchema } from '@onexdeal/types';
import { createApp } from '../app.js';

describe('OneXDeal API Phase 0 Foundation (/api/v1/health)', () => {
  const app = createApp();

  it('returns 200 OK with valid HealthCheckData envelope and x-request-id header', async () => {
    const response = await request(app).get('/api/v1/health');

    expect(response.status).toBe(200);
    expect(response.headers['x-request-id']).toBeDefined();

    const EnvelopeSchema = createSuccessEnvelopeSchema(HealthCheckDataSchema);
    const parsed = EnvelopeSchema.safeParse(response.body);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.data.status).toBe('ok');
      expect(parsed.data.data.service).toBe('onexdeal-api');
    }
  });

  it('returns 404 standard error envelope for unknown routes', async () => {
    const response = await request(app).get('/api/v1/non-existent-route');

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      error: {
        code: 'RESOURCE_NOT_FOUND',
        message: 'The requested API endpoint does not exist.',
        requestId: expect.any(String),
      },
    });
  });
});
