import { describe, expect, it } from 'vitest';
import { colors, getListingStatusBadgeMeta, spacing, touchTargets } from '../index.js';

describe('@onexdeal/ui design tokens and primitives', () => {
  it('exposes approved brand colors and accessibility touch target minimum (44pt)', () => {
    expect(colors.brand.primary).toBe('#155EEF');
    expect(touchTargets.minSizePt).toBeGreaterThanOrEqual(44);
    expect(spacing[4]).toBe(16);
  });

  it('maps listing moderation and expiry states to accessible badge labels', () => {
    expect(getListingStatusBadgeMeta('pending_review').label).toBe('Pending Review');
    expect(getListingStatusBadgeMeta('expired').label).toBe('Expired');
    expect(getListingStatusBadgeMeta('rejected').tone).toBe('danger');
  });
});
