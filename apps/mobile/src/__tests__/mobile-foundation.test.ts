import { describe, expect, it } from 'vitest';
import { getMobileRuntimeConfig } from '../config/mobile-env.js';

describe('OneXDeal Mobile Phase 0 Foundation', () => {
  it('provides approved Hosur pilot locality and radius defaults', () => {
    const config = getMobileRuntimeConfig();
    expect(config.appName).toBe('OneXDeal');
    expect(config.defaultLocalityName).toBe('Hosur Town');
    expect(config.defaultPincode).toBe('635109');
    expect(config.defaultSearchRadiusKm).toBe(10);
    expect(config.allowedRadiiKm).toEqual([2, 5, 10, 25, 50]);
  });
});
