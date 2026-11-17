import { describe, expect, it } from 'vitest';
import {
  AUTH_PROVIDERS,
  createSuccessEnvelopeSchema,
  DEFAULT_LISTING_EXPIRY_DAYS,
  DEFAULT_SEARCH_RADIUS_KM,
  HealthCheckDataSchema,
  LISTING_STATUSES,
  MODERATION_REJECTION_REASONS,
  SEARCH_RADIUS_KM_OPTIONS,
  SearchRadiusKmSchema,
  USER_ROLES,
  UserRoleSchema,
} from '../index.js';

describe('@onexdeal/types domain contracts', () => {
  it('validates approved user roles and rejects invalid roles', () => {
    expect(USER_ROLES).toEqual(['user', 'moderator', 'admin']);
    expect(UserRoleSchema.safeParse('user').success).toBe(true);
    expect(UserRoleSchema.safeParse('superadmin').success).toBe(false);
  });

  it('includes only google and email as MVP authentication providers', () => {
    expect(AUTH_PROVIDERS).toEqual(['google', 'email']);
  });

  it('validates approved search radius options (2, 5, 10, 25, 50 km) with 10 km default', () => {
    expect(DEFAULT_SEARCH_RADIUS_KM).toBe(10);
    expect(SEARCH_RADIUS_KM_OPTIONS).toEqual([2, 5, 10, 25, 50]);

    for (const radius of SEARCH_RADIUS_KM_OPTIONS) {
      expect(SearchRadiusKmSchema.safeParse(radius).success).toBe(true);
    }

    expect(SearchRadiusKmSchema.safeParse(15).success).toBe(false);
    expect(SearchRadiusKmSchema.safeParse(0).success).toBe(false);
  });

  it('defines 30-day default listing expiry and complete moderation states', () => {
    expect(DEFAULT_LISTING_EXPIRY_DAYS).toBe(30);
    expect(LISTING_STATUSES).toContain('pending_review');
    expect(LISTING_STATUSES).toContain('expired');
    expect(MODERATION_REJECTION_REASONS.length).toBeGreaterThanOrEqual(5);
  });

  it('validates standard API success envelope with HealthCheckDataSchema', () => {
    const EnvelopeSchema = createSuccessEnvelopeSchema(HealthCheckDataSchema);
    const parsed = EnvelopeSchema.safeParse({
      data: {
        status: 'ok',
        service: 'onexdeal-api',
        version: '0.1.0',
        environment: 'test',
        timestamp: new Date().toISOString(),
      },
    });
    expect(parsed.success).toBe(true);
  });
});
