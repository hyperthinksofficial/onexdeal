# OneXDeal Database Design

**Approved PostgreSQL 18 + PostGIS 3.7.x data model**

- Date: 17 November 2026
- Version: v1.1 - Owner-Approved Engineering Baseline
- Status: Approved for implementation (schema migrations to be built in Phase 1+)

> Purpose: Defines the approved MVP relational model, authentication schema, spatial indexing, privacy boundaries, and Drizzle ORM conventions.

> Decision labels: **Approved** = confirmed by project owner; **Deferred** = intentionally outside MVP.

## 1. Approved database stack

- **Database Engine:** PostgreSQL 18 (latest supported minor release).
- **Spatial Extension:** PostGIS 3.7.x (`CREATE EXTENSION IF NOT EXISTS postgis;`).
- **Text Similarity Extension:** `pg_trgm` (`CREATE EXTENSION IF NOT EXISTS pg_trgm;`).
- **ORM & Migrations:** **Drizzle ORM** with version-controlled SQL migrations (`drizzle-kit`).
- **Docker Image Baseline:** `postgis/postgis:18-3.7` (or official PostgreSQL 18 with PostGIS 3.7.x).

All PostgreSQL extensions (`postgis`, `pg_trgm`, `pgcrypto`/`uuid-ossp` if needed) must be enabled through version-controlled SQL migration files. Keep PostGIS-specific queries encapsulated in dedicated repository/query modules.

## 2. Core data rules

- Use UUID (`UUID` / `gen_random_uuid()`) primary keys for externally visible entities.
- Store timestamps as `TIMESTAMPTZ` in UTC; convert to `Asia/Kolkata` for display.
- Store monetary values as integer paise (`BIGINT`) and currency as ISO code (`INR`); never use floating-point numbers. Minimum price is `0` (`₹0` = Free).
- Use `snake_case` database identifiers; API JSON uses `camelCase`.
- Add `created_at` and `updated_at` to mutable business entities; soft-delete/archive where audit/history matters.
- Enforce constrained enums or `CHECK` constraints for roles and lifecycle states.
- Use `geography(Point, 4326)` for location-based discovery and distance calculations in meters (`ST_DWithin`, `ST_Distance`).

## 3. Core entities (Approved MVP Model)

| Table                     | Important fields                                                                                                                                                                                                                                                                                  | Notes                                                                                                                                                                                                                             |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `users`                   | `id`, `email`, `email_verified_at`, `password_hash` (nullable), `role` (`'user' \| 'moderator' \| 'admin'`), `phone_e164` (nullable/optional), `status`, `created_at`, `updated_at`, `deleted_at`                                                                                                 | `email` is unique (normalized lowercase). `password_hash` is Argon2id (nullable for Google-only accounts). `role` defaults to `'user'` (never self-assigned). Phone verification and `phone_hash` are deferred to a future phase. |
| `auth_identities`         | `id`, `user_id`, `provider` (`'google' \| 'email'`), `provider_subject_id`, `provider_email`, `created_at`, `updated_at`                                                                                                                                                                          | Supports linking Google OAuth 2.0 and Email/Password identities safely to the same OneXDeal user; `UNIQUE(provider, provider_subject_id)`.                                                                                        |
| `verification_tokens`     | `id`, `user_id`, `type` (`'email_verification' \| 'password_reset'`), `token_hash`, `expires_at`, `consumed_at`, `created_at`                                                                                                                                                                     | Stores cryptographic hash of single-use, time-limited email verification and password reset tokens (never raw tokens).                                                                                                            |
| `user_profiles`           | `user_id`, `display_name`, `avatar_key`, `preferred_locality_id`, `preferred_area`, `locale`, `created_at`, `updated_at`                                                                                                                                                                          | Public-safe profile attributes separated from private auth credentials.                                                                                                                                                           |
| `refresh_sessions`        | `id`, `user_id`, `token_hash`, `device_label`, `ip_address`, `user_agent`, `expires_at`, `revoked_at`, `created_at`                                                                                                                                                                               | Stores token hashes, never raw refresh tokens; supports per-device revocation and rotation.                                                                                                                                       |
| `categories`              | `id`, `parent_id`, `name`, `slug`, `requires_condition`, `sort_order`, `is_active`, `created_at`, `updated_at`                                                                                                                                                                                    | Tree supports category/subcategory; `requires_condition` controls whether item condition is required; archive used categories.                                                                                                    |
| `localities`              | `id`, `name`, `slug`, `district`, `state`, `pincode`, `location_geog` (`geography(Point, 4326)`), `is_active`, `sort_order`, `created_at`, `updated_at`                                                                                                                                           | Curated locality list starting with Hosur (Krishnagiri, Tamil Nadu) and expandable across Tamil Nadu and India.                                                                                                                   |
| `listings`                | `id`, `seller_id`, `category_id`, `locality_id`, `title`, `description`, `price_paise` (`BIGINT`), `currency`, `is_negotiable`, `condition`, `status`, `rejection_reason`, `location_label`, `location_geog` (`geography(Point, 4326)`), `published_at`, `expires_at`, `created_at`, `updated_at` | `CHECK (price_paise >= 0)`; `CHECK (NOT (price_paise = 0 AND is_negotiable = true))`; `expires_at` defaults to 30 days from approval; `rejection_reason` populated when `status = 'rejected'`.                                    |
| `listing_moderation_logs` | `id`, `listing_id`, `moderator_id`, `from_status`, `to_status`, `reason_code`, `notes`, `created_at`                                                                                                                                                                                              | Preserves full moderation decision history across initial submissions, rejections, edits and renewals.                                                                                                                            |
| `listing_images`          | `id`, `listing_id`, `storage_key`, `mime_type`, `size_bytes`, `width`, `height`, `sort_order`, `is_primary`, `created_at`                                                                                                                                                                         | Object bytes live in Cloudflare R2 (`StorageProvider`), never in PostgreSQL.                                                                                                                                                      |
| `favorites`               | `user_id`, `listing_id`, `created_at`                                                                                                                                                                                                                                                             | Composite primary/unique key `(user_id, listing_id)` prevents duplicates.                                                                                                                                                         |
| `conversations`           | `id`, `listing_id`, `buyer_id`, `seller_id`, `status`, `buyer_unread_count`, `seller_unread_count`, `buyer_last_read_at`, `seller_last_read_at`, `last_message_at`, `created_at`, `updated_at`                                                                                                    | `UNIQUE (listing_id, buyer_id, seller_id)`; `CHECK (buyer_id <> seller_id)`. Unread counters updated transactionally when messages are created and read.                                                                          |
| `messages`                | `id`, `conversation_id`, `sender_id`, `client_message_id`, `body`, `created_at`, `edited_at`, `deleted_at`                                                                                                                                                                                        | Source of truth for conversation messages; `UNIQUE (sender_id, client_message_id)` for idempotent retry.                                                                                                                          |
| `user_blocks`             | `blocker_id`, `blocked_user_id`, `created_at`                                                                                                                                                                                                                                                     | `UNIQUE (blocker_id, blocked_user_id)`; checked before starting conversation or sending messages.                                                                                                                                 |
| `reports`                 | `id`, `reporter_id`, `listing_id`, `reported_user_id`, `reason`, `details`, `status`, `assigned_to`, `resolved_at`, `created_at`                                                                                                                                                                  | At least one target (`listing_id` or `reported_user_id`); staff enforcement actions audited in `admin_audit_logs`.                                                                                                                |
| `notifications`           | `id`, `user_id`, `type`, `payload_json`, `dedupe_key`, `read_at`, `created_at`                                                                                                                                                                                                                    | In-app notification records; no sensitive payloads.                                                                                                                                                                               |
| `device_tokens`           | `id`, `user_id`, `platform`, `push_token`, `last_seen_at`, `revoked_at`, `created_at`                                                                                                                                                                                                             | Multiple devices per user for `PushProvider` (Expo Push).                                                                                                                                                                         |
| `admin_audit_logs`        | `id`, `actor_user_id`, `action`, `target_type`, `target_id`, `reason`, `metadata_json`, `created_at`                                                                                                                                                                                              | Append-only audit trail for moderator and administrator actions.                                                                                                                                                                  |
| `app_events`              | `id`, `user_id` (nullable), `event_name`, `event_time`, `properties_json`                                                                                                                                                                                                                         | Privacy-minimised product analytics; never stores passwords, tokens, message bodies or raw GPS.                                                                                                                                   |

## 4. Future phone verification enhancement (Deferred from MVP)

Phone number verification via SMS OTP or WhatsApp OTP is **not** part of the MVP:

- In MVP, `users.phone_e164` is optional and nullable, unverified, and never used as a login identifier.
- Do not create `users.phone_hash` or OTP tables in the MVP schema.
- When phone verification is added in a future phase:
  1. Normalize numbers to E.164 format.
  2. Add `phone_hash` using keyed HMAC-SHA256 for fast lookup and uniqueness.
  3. Encrypt retained raw phone numbers (`phone_encrypted`) at rest and never expose them in public responses.

## 5. Relationships

```text
users 1----1 user_profiles
users 1----N auth_identities
users 1----N verification_tokens / refresh_sessions / device_tokens / notifications
users 1----N listings (as seller)
categories 1----N listings
localities 1----N listings
listings 1----N listing_images
listings 1----N listing_moderation_logs
users N----N listings (favorites)
listings 1----N conversations
users 1----N conversations (as buyer / seller)
conversations 1----N messages
users 1----N reports (reporter / target)
users 1----N admin_audit_logs (as actor)
```

## 6. Required constraints and indexes

- `users`: `UNIQUE (email)`, `CHECK (role IN ('user', 'moderator', 'admin'))`.
- `auth_identities`: `UNIQUE (provider, provider_subject_id)`, index on `(user_id)`.
- `verification_tokens`: `UNIQUE (token_hash)`, index on `(user_id, type, expires_at)`.
- `localities`: GiST index on `location_geog`; index on `(state, district, is_active, sort_order)` and `(pincode)`.
- `listings`:
  - `CHECK (price_paise >= 0)`
  - `CHECK (NOT (price_paise = 0 AND is_negotiable = true))`
  - `CHECK (status IN ('draft', 'pending_review', 'active', 'rejected', 'sold', 'archived', 'expired', 'removed'))`
  - `CHECK (status <> 'rejected' OR rejection_reason IS NOT NULL)`
  - Spatial GiST index: `CREATE INDEX idx_listings_active_geog ON listings USING GIST (location_geog) WHERE status = 'active';`
  - Feed & filter B-tree indexes: `(status, published_at DESC, id DESC)`, `(seller_id, status)`, `(category_id, status, published_at DESC)`.
  - Full-text GIN index on generated `search_vector` (`tsvector`) and trigram GIN index (`gin_trgm_ops`) on `title`.
- `conversations`: `UNIQUE (listing_id, buyer_id, seller_id)`, `CHECK (buyer_id <> seller_id)`, indexes on `(buyer_id, last_message_at DESC)` and `(seller_id, last_message_at DESC)`.
- `messages`: index on `(conversation_id, created_at DESC)`, `UNIQUE (sender_id, client_message_id)`.
- `user_blocks`: `UNIQUE (blocker_id, blocked_user_id)` and reverse lookup index `(blocked_user_id, blocker_id)`.

## 7. Spatial & search query patterns

```sql
-- Nearby active, non-expired listings within radius (meters) using PostGIS geography(Point, 4326)
SELECT
  l.id,
  l.title,
  l.price_paise,
  l.is_negotiable,
  l.location_label,
  ST_Distance(l.location_geog, ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography) AS distance_meters
FROM listings l
WHERE l.status = 'active'
  AND l.expires_at > NOW()
  AND ST_DWithin(
    l.location_geog,
    ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography,
    :radius_meters
  )
ORDER BY l.published_at DESC, l.id DESC
LIMIT :page_size;
```

Always bind parameters via Drizzle ORM / parameterized queries; never concatenate untrusted strings into SQL.

## 8. Migration, backup and retention

- Enable extensions (`postgis`, `pg_trgm`) in the initial versioned SQL migration.
- Test every migration on both an empty PostgreSQL 18 database and an upgraded database in CI.
- Back up PostgreSQL daily at minimum to encrypted off-site storage and verify restoration before pilot launch.

---

This document is part of the OneXDeal engineering documentation set. Update this document through a reviewed change; do not let an AI agent silently change product or architecture decisions.
