import type { ListingStatus } from '@onexdeal/types';
import { colors } from './tokens.js';

export interface ListingStatusBadgeMeta {
  label: string;
  tone: 'success' | 'warning' | 'danger' | 'neutral';
  colorHex: string;
}

const LISTING_STATUS_BADGE_MAP: Record<ListingStatus, ListingStatusBadgeMeta> = {
  draft: {
    label: 'Draft',
    tone: 'neutral',
    colorHex: colors.text.secondary,
  },
  pending_review: {
    label: 'Pending Review',
    tone: 'warning',
    colorHex: colors.status.warning,
  },
  active: {
    label: 'Active',
    tone: 'success',
    colorHex: colors.status.success,
  },
  rejected: {
    label: 'Rejected',
    tone: 'danger',
    colorHex: colors.status.danger,
  },
  sold: {
    label: 'Sold',
    tone: 'neutral',
    colorHex: colors.text.primary,
  },
  archived: {
    label: 'Archived',
    tone: 'neutral',
    colorHex: colors.text.secondary,
  },
  expired: {
    label: 'Expired',
    tone: 'warning',
    colorHex: colors.status.warning,
  },
  removed: {
    label: 'Removed',
    tone: 'danger',
    colorHex: colors.status.danger,
  },
};

/**
 * Returns accessible label and semantic color metadata for a listing status badge.
 */
export function getListingStatusBadgeMeta(status: ListingStatus): ListingStatusBadgeMeta {
  return LISTING_STATUS_BADGE_MAP[status];
}
