import { describe, expect, it } from 'vitest';
import {
  formatPricePaise,
  HOSUR_DEFAULT_LOCALITY,
  isValidWgs84Coordinate,
  radiusKmToMeters,
  scrubSensitiveData,
  validateListingPricing,
} from '../index.js';

describe('@onexdeal/utils currency & pricing rules', () => {
  it('formats 0 paise as "Free"', () => {
    expect(formatPricePaise(0)).toBe('Free');
    expect(formatPricePaise(0n)).toBe('Free');
  });

  it('formats positive integer paise in Indian Rupees (INR)', () => {
    expect(formatPricePaise(150000)).toBe('₹1,500');
    expect(formatPricePaise(12500000n)).toBe('₹1,25,000');
    expect(formatPricePaise(9950)).toBe('₹99.50');
  });

  it('rejects negative or floating-point paise values', () => {
    expect(() => formatPricePaise(-100)).toThrow(RangeError);
    expect(() => formatPricePaise(-1n)).toThrow(RangeError);
    expect(() => formatPricePaise(19.99)).toThrow(TypeError);
  });

  it('disallows negotiable = true on Free (0 paise) listings', () => {
    expect(validateListingPricing(0, false)).toEqual({ valid: true });
    expect(validateListingPricing(0, true)).toEqual({
      valid: false,
      reason: 'Free (₹0) listings cannot be marked as negotiable.',
    });
    expect(validateListingPricing(50000, true)).toEqual({ valid: true });
    expect(validateListingPricing(-1, false).valid).toBe(false);
  });
});

describe('@onexdeal/utils geo & PII scrubbing helpers', () => {
  it('converts approved search radius km to meters for PostGIS ST_DWithin', () => {
    expect(radiusKmToMeters(10)).toBe(10000);
    expect(radiusKmToMeters(2)).toBe(2000);
    expect(radiusKmToMeters(50)).toBe(50000);
  });

  it('validates Hosur default coordinates as valid WGS84', () => {
    expect(
      isValidWgs84Coordinate(HOSUR_DEFAULT_LOCALITY.latitude, HOSUR_DEFAULT_LOCALITY.longitude),
    ).toBe(true);
    expect(isValidWgs84Coordinate(95, 77.82)).toBe(false);
  });

  it('scrubs passwords, verification tokens and private message bodies', () => {
    const rawPayload = {
      email: 'buyer@example.com',
      password: 'PlaintextPassword123!',
      passwordHash: '$argon2id$v=19$m=65536...',
      emailVerificationToken: 'raw-token-value',
      nested: {
        refreshToken: 'refresh-secret',
        messageBody: 'Private chat text',
        safeField: 'Hosur',
      },
    };

    const scrubbed = scrubSensitiveData(rawPayload);
    expect(scrubbed.email).toBe('buyer@example.com');
    expect(scrubbed.password).toBe('[REDACTED]');
    expect(scrubbed.passwordHash).toBe('[REDACTED]');
    expect(scrubbed.emailVerificationToken).toBe('[REDACTED]');
    expect(scrubbed.nested.refreshToken).toBe('[REDACTED]');
    expect(scrubbed.nested.messageBody).toBe('[REDACTED]');
    expect(scrubbed.nested.safeField).toBe('Hosur');
  });
});
