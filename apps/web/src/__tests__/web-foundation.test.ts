import { describe, expect, it } from 'vitest';
import { DEFAULT_SEARCH_RADIUS_KM } from '@onexdeal/types';
import { colors } from '@onexdeal/ui';
import { formatPricePaise, HOSUR_DEFAULT_LOCALITY } from '@onexdeal/utils';

describe('OneXDeal Web Phase 0 Workspace Integration', () => {
  it('consumes shared design tokens, types and utils cleanly', () => {
    expect(colors.brand.primary).toBe('#155EEF');
    expect(DEFAULT_SEARCH_RADIUS_KM).toBe(10);
    expect(HOSUR_DEFAULT_LOCALITY.pincode).toBe('635109');
    expect(formatPricePaise(0)).toBe('Free');
  });
});
