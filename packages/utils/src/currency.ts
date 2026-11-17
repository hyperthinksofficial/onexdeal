/**
 * Approved pricing rules for OneXDeal (Hosur MVP):
 * - Store prices in integer paise (never floating-point).
 * - Minimum price is ₹0 (0 paise). Negative prices are disallowed.
 * - ₹0 (0 paise) displays as "Free".
 * - Free listings (0 paise) must not be marked negotiable.
 */

const inrWholeFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const inrDecimalFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/**
 * Formats an integer paise value for user display.
 * Returns `"Free"` when `pricePaise` is `0` or `0n`.
 */
export function formatPricePaise(pricePaise: number | bigint): string {
  if (typeof pricePaise === 'number') {
    if (!Number.isSafeInteger(pricePaise)) {
      throw new TypeError('pricePaise must be a safe integer number or bigint');
    }
    if (pricePaise < 0) {
      throw new RangeError('pricePaise cannot be negative');
    }
    if (pricePaise === 0) {
      return 'Free';
    }
    const rupees = pricePaise / 100;
    return pricePaise % 100 === 0
      ? inrWholeFormatter.format(rupees)
      : inrDecimalFormatter.format(rupees);
  }

  if (pricePaise < 0n) {
    throw new RangeError('pricePaise cannot be negative');
  }
  if (pricePaise === 0n) {
    return 'Free';
  }

  const wholeRupees = Number(pricePaise / 100n);
  const remainderPaise = Number(pricePaise % 100n);
  if (remainderPaise === 0) {
    return inrWholeFormatter.format(wholeRupees);
  }
  return inrDecimalFormatter.format(wholeRupees + remainderPaise / 100);
}

export interface ListingPricingValidationResult {
  valid: boolean;
  reason?: string;
}

/**
 * Validates price in paise and negotiability according to approved MVP rules.
 */
export function validateListingPricing(
  pricePaise: number | bigint,
  isNegotiable: boolean,
): ListingPricingValidationResult {
  if (typeof pricePaise === 'number' && !Number.isSafeInteger(pricePaise)) {
    return {
      valid: false,
      reason: 'Price must be stored as an integer number of paise.',
    };
  }

  const isNegative = typeof pricePaise === 'bigint' ? pricePaise < 0n : pricePaise < 0;
  if (isNegative) {
    return {
      valid: false,
      reason: 'Negative prices are not allowed.',
    };
  }

  const isZero = typeof pricePaise === 'bigint' ? pricePaise === 0n : pricePaise === 0;
  if (isZero && isNegotiable) {
    return {
      valid: false,
      reason: 'Free (₹0) listings cannot be marked as negotiable.',
    };
  }

  return { valid: true };
}
