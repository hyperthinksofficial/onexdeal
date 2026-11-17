import { z } from 'zod';

/**
 * Approved user roles for OneXDeal RBAC.
 * Normal registered accounts ('user') act as both buyers and sellers.
 */
export const USER_ROLES = ['user', 'moderator', 'admin'] as const;
export const UserRoleSchema = z.enum(USER_ROLES);
export type UserRole = z.infer<typeof UserRoleSchema>;

/**
 * Approved MVP authentication providers.
 * Note: SMS OTP and WhatsApp OTP are deferred to a future phase.
 */
export const AUTH_PROVIDERS = ['google', 'email'] as const;
export const AuthProviderSchema = z.enum(AUTH_PROVIDERS);
export type AuthProvider = z.infer<typeof AuthProviderSchema>;

/**
 * Approved listing lifecycle states.
 */
export const LISTING_STATUSES = [
  'draft',
  'pending_review',
  'active',
  'rejected',
  'sold',
  'archived',
  'expired',
  'removed',
] as const;
export const ListingStatusSchema = z.enum(LISTING_STATUSES);
export type ListingStatus = z.infer<typeof ListingStatusSchema>;

/**
 * Approved item condition values when required by category.
 */
export const LISTING_CONDITIONS = ['new', 'like_new', 'good', 'fair'] as const;
export const ListingConditionSchema = z.enum(LISTING_CONDITIONS);
export type ListingCondition = z.infer<typeof ListingConditionSchema>;

/**
 * Mandatory structured reason codes when a moderator rejects a listing.
 */
export const MODERATION_REJECTION_REASONS = [
  'prohibited_item',
  'blurry_or_missing_photos',
  'misleading_price_or_title',
  'duplicate_listing',
  'wrong_category',
  'suspected_scam_or_spam',
  'policy_violation',
] as const;
export const ModerationRejectionReasonSchema = z.enum(MODERATION_REJECTION_REASONS);
export type ModerationRejectionReason = z.infer<typeof ModerationRejectionReasonSchema>;

/**
 * Approved search radius options in kilometers for Hosur & India expansion.
 */
export const SEARCH_RADIUS_KM_OPTIONS = [2, 5, 10, 25, 50] as const;
export type SearchRadiusKm = (typeof SEARCH_RADIUS_KM_OPTIONS)[number];
export const DEFAULT_SEARCH_RADIUS_KM: SearchRadiusKm = 10;

export const SearchRadiusKmSchema = z
  .number()
  .int()
  .refine(
    (val): val is SearchRadiusKm => (SEARCH_RADIUS_KM_OPTIONS as readonly number[]).includes(val),
    {
      message: `Search radius must be one of: ${SEARCH_RADIUS_KM_OPTIONS.join(', ')} km`,
    },
  );

/**
 * Approved listing rules & limits for the Hosur MVP.
 */
export const DEFAULT_LISTING_EXPIRY_DAYS = 30;
export const MIN_LISTING_IMAGES = 1;
export const MAX_LISTING_IMAGES = 8;
export const MIN_LISTING_PRICE_PAISE = 0;
export const DEFAULT_CURRENCY = 'INR' as const;
