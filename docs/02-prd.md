# OneXDeal Product Requirements Document

**MVP requirements and acceptance criteria**

- Date: 17 November 2026
- Version: v1.1 - Owner-Approved Engineering Baseline
- Status: Approved for implementation

> Purpose: Defines what the first release must do and how the team will verify it.

> Decision labels: **Approved** = confirmed by project owner; **Deferred** = intentionally outside MVP; **Open** = pending later phase selection.

## 1. Purpose and product boundary

This PRD covers the OneXDeal mobile-first classifieds MVP for a controlled Hosur pilot. The platform helps users discover and contact sellers. OneXDeal does not collect payment, escrow funds, arrange delivery, require SMS/WhatsApp OTP verification, or guarantee the condition/authenticity of a listed item in MVP.

## 2. Roles

| Role                                                       | Permissions                                                                                                        |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Guest                                                      | Browse public active listings and categories; view safe, public listing details; must sign in to favorite or chat. |
| User (`user` - unverified email)                           | Sign in, view profile, request verification email resend; **cannot** publish listings until email is verified.     |
| Verified user (`user` - email verified or Google verified) | Act as both buyer and seller: maintain profile, create/manage own listings, favorite, chat, report and block.      |
| Moderator (`moderator`)                                    | Review pending listings/reports and take scoped moderation actions with mandatory reason codes.                    |
| Administrator (`admin`)                                    | Manage categories, localities, users, staff roles (`moderator`/`admin`), configuration and audit events.           |

_Security rule:_ Users can never self-assign `moderator` or `admin` privileges. Role-based access control (RBAC) is strictly enforced on the backend.

## 3. Functional requirements

| ID / feature                                | Requirement                                                                                                                                                                     | Acceptance criteria                                                                                                                                                                                                                                                                  |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| AUTH-01 Google & Email Auth                 | Users can register/sign in via (1) Google Sign-In (OAuth 2.0) or (2) Email and password with email verification.                                                                | Google ID token is verified server-side (signature, issuer, audience, expiry, `email_verified`); passwords hashed with Argon2id; responses prevent email enumeration; safe account linking prevents takeover; auth & resend endpoints are rate-limited.                              |
| AUTH-02 Email Verification & Password Reset | Email/password users must verify their email; users can reset forgotten passwords via email link.                                                                               | Verification and reset tokens are single-use, time-limited, and stored hashed; unverified users cannot publish listings; Google users with verified email skip extra verification step.                                                                                              |
| AUTH-03 Sessions                            | The client can refresh and revoke sessions.                                                                                                                                     | Refresh tokens rotate on use; logout revokes the current session; password reset revokes active sessions; expired/revoked tokens cannot call protected APIs.                                                                                                                         |
| USER-01 Profile                             | User can set display name, optional avatar, preferred locality/area, and optional phone number.                                                                                 | Required fields validated; phone number is optional/nullable, unverified in MVP, and hidden from public APIs by default; user can act as both buyer and seller.                                                                                                                      |
| CAT-01 Categories                           | Users can browse admin-managed categories/subcategories.                                                                                                                        | Only active categories are shown; category order and `requires_condition` flag are configurable; deleted categories with existing listings are archived, not hard-deleted.                                                                                                           |
| LOC-01 Localities                           | System maintains a curated list of Hosur localities (expandable across Tamil Nadu & India).                                                                                     | Includes locality name, district, state, PIN code, and centroid coordinates; supports manual locality selection when GPS is denied or unavailable.                                                                                                                                   |
| LIST-01 Create listing                      | Verified seller can create a listing with title, description, category, price (in paise), negotiability, condition (if required by category), 1–8 photos and location/locality. | Unverified accounts are blocked from publishing; price is integer paise `>= 0` (`₹0` displays as `"Free"` and cannot be marked `is_negotiable`); 1–8 images; preview matches saved listing.                                                                                          |
| LIST-02 Moderation                          | All newly created listings and material edits enter `pending_review`.                                                                                                           | New listings and edits to title, description or photos enter `pending_review`; only approved (`active`) listings appear in public search; moderator rejection requires a structured `rejection_reason`; moderation history is preserved.                                             |
| LIST-03 Manage & Expire listing             | Seller can edit, mark sold, archive, delete or renew their own listing.                                                                                                         | Only owner or authorized admin can mutate; mark-sold and archive take effect immediately without moderation; approved listings expire 30 days after publication/approval and stop appearing in public search (without hard deletion); seller can renew/relist subject to moderation. |
| DISC-01 Browse                              | Users can see recent active, non-expired listings and category results.                                                                                                         | Results are cursor-paginated; stable sort prevents duplicates across pages; empty/loading/error states exist.                                                                                                                                                                        |
| DISC-02 Local search                        | Users can search by text and filter by category, radius, price, condition and sort.                                                                                             | Search only returns `active`, non-expired listings; radius is server-calculated via PostGIS (`geography(Point, 4326)`) with default `10 km` and options `2 km, 5 km, 10 km, 25 km, 50 km`; supports `₹0` (Free) price filtering.                                                     |
| DISC-03 Location permission                 | Users can select a curated locality manually or grant device GPS location.                                                                                                      | App explains why location is requested; denial falls back cleanly to the curated Hosur locality picker; exact device coordinates are never exposed publicly.                                                                                                                         |
| FAV-01 Favorites                            | Signed-in users can save/unsave listings.                                                                                                                                       | A user cannot create duplicate favorites; sold/expired/unavailable listings show a clear inactive state.                                                                                                                                                                             |
| CHAT-01 Conversations                       | Buyer can start a conversation with the seller from an active listing.                                                                                                          | Self-chat is blocked; only conversation members can read/write; one conversation per `(listing_id, buyer_id, seller_id)`; per-participant unread counters (`buyer_unread_count`, `seller_unread_count`) are maintained transactionally.                                              |
| CHAT-02 Messages                            | Members can send and receive text messages in real time.                                                                                                                        | Messages are the source of truth and ordered by server timestamp; duplicate client retries are idempotent via `client_message_id`; blocked users cannot send; reading messages resets participant unread counter transactionally.                                                    |
| SAFE-01 Report/block                        | Users can report listings/users and block another user.                                                                                                                         | Report reason is required; block prevents new contact and messages; moderator can see report history; reporter receives no sensitive enforcement details.                                                                                                                            |
| NOTIF-01 Notifications                      | Users receive in-app and push notifications (`PushProvider` / Expo Push) plus transactional emails (`EmailProvider`).                                                           | Push token is registered per device; notification preferences and permission states are respected; deep links open the relevant screen after authorization checks.                                                                                                                   |
| ADMIN-01 Moderation console                 | Staff (`moderator`, `admin`) can review pending listings, reports, users, categories, localities and action history.                                                            | Admin access is RBAC-protected on the server; every moderation and admin action is recorded in `admin_audit_logs`; bulk destructive actions are disabled in MVP.                                                                                                                     |
| AN-01 Analytics                             | System records privacy-conscious product events.                                                                                                                                | Track activation, search, detail views, chat starts and moderation latency; never log passwords, tokens, message bodies or precise location.                                                                                                                                         |

## 4. Listing rules and states

Approved lifecycle: `draft -> pending_review -> active -> sold | archived | expired`.

- A moderator may move `pending_review` to `active` (setting `published_at` and `expires_at = published_at + 30 days`) or `rejected` (recording a mandatory `rejection_reason`), or move an `active` listing to `removed`.
- Material edits by the seller to `title`, `description`, or `listing_images` transition an `active` or `rejected` listing back to `pending_review`.
- Marking a listing `sold` or `archived` takes effect immediately and removes it from public search.
- Listings automatically transition out of active search after `expires_at` (default 30 days from approval/publication) without being permanently deleted; sellers may renew or relist subject to moderation.

| Field       | Approved Rule                                                                                                                                                  |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Title       | Required; 5–100 characters. Material edits trigger `pending_review`.                                                                                           |
| Description | Required; 20–3,000 characters. Material edits trigger `pending_review`.                                                                                        |
| Price       | Stored in integer paise (`BIGINT`); minimum `0` (`₹0`). Negative prices are rejected. `₹0` displays as `"Free"`.                                               |
| Negotiable  | `is_negotiable` boolean flag. Must be `false` when `price_paise = 0` (Free listings cannot be marked negotiable).                                              |
| Images      | 1–8 images; JPEG/PNG/WebP; validated server-side; EXIF stripped; stored in Cloudflare R2 via `StorageProvider`. Material image edits trigger `pending_review`. |
| Condition   | `new`, `like_new`, `good`, `fair`; required when `categories.requires_condition = true`, optional/hidden otherwise.                                            |
| Location    | Curated locality reference (`locality_id`) and/or approximate `geography(Point, 4326)` coordinate + `location_label`; never publish exact home address.        |
| Expiry      | Default 30 days from approval/publication; expired listings stop appearing in public search; seller can renew/relist subject to moderation.                    |

## 5. Search and ranking

- Default sort: newest `active` and non-expired (`expires_at > NOW()`) listings within the selected area/radius.
- Radius options: **10 km (default)**, **2 km**, **5 km**, **10 km**, **25 km**, **50 km**, centered on the user's current GPS or selected locality.
- Filters: category, radius, minimum/maximum price (supporting `₹0` Free items), condition and sort order.
- Technical baseline: PostgreSQL 18 full-text search (`tsvector` + GIN) + `pg_trgm` + PostGIS 3.7 (`ST_DWithin` on `geography(Point, 4326)`). Keep a `SearchProvider` interface so external engines can be evaluated later.
- Never expose `draft`, `pending_review`, `rejected`, `removed`, `sold`, `archived`, `expired` or blocked-user listings in standard public results.

## 6. UX states and edge cases

- Every network-driven screen has loading, empty, error, retry and offline-aware states.
- Email verification resend cooldown and rate limits are clearly communicated.
- Unverified email/password users attempting to post a listing see a clear prompt to verify their email (with a one-tap resend button).
- Photo upload supports retry and partial failure without losing listing form data.
- Chat handles offline send, reconnect, duplicate retry (`client_message_id`), blocked user and sold/expired/removed listing states.
- Location permission denied or GPS unavailable falls back seamlessly to the curated Hosur locality selector.

## 7. Non-functional requirements

| Area          | Target for pilot                                                                                                                                                                  |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Performance   | Common API reads p95 < 500 ms; search p95 < 800 ms under agreed pilot load.                                                                                                       |
| Reliability   | 99.5% monthly availability target; crash-free sessions > 99.5% target.                                                                                                            |
| Compatibility | Current and previous major supported Android/iOS versions agreed at release; test low/mid-range Android.                                                                          |
| Accessibility | Readable text scaling, accessible labels, sufficient contrast and sensible focus order.                                                                                           |
| Security      | TLS, Argon2id password hashing, Google OAuth ID token validation, server-side RBAC/ownership, Redis rate limits, OS secure token storage, audit logs and tested off-site backups. |
| Localization  | Build with i18n from day one; English default; Tamil-ready content.                                                                                                               |
| Observability | Structured logs, request IDs, Sentry error monitoring with PII scrubbing, API metrics and database/VPS health alerts.                                                             |

## 8. Out of scope for MVP

- **SMS OTP, WhatsApp OTP, and mandatory phone verification** (deferred to a future phase; no MSG91/2Factor.in integration in MVP).
- **Payments, escrow, refunds and Razorpay integration.**
- **Delivery, shipping, courier tracking or order fulfilment.**
- **Seller subscriptions, paid boosts and advertising.**
- **Ratings/reviews, bidding/auctions and advanced recommendation algorithms.**
- **Multi-country, multi-currency or microservices deployment.**

## 9. Release acceptance gates

- [ ] All P0 requirements pass in staging.
- [ ] No unresolved critical/high security findings.
- [ ] Role, email-verification, and ownership tests prove users cannot bypass verification to post or access another user’s listing, messages or admin functions.
- [ ] Off-site backup restore and rollback are rehearsed on the Hostinger KVM VPS environment.
- [ ] Moderation policy, prohibited item policy, privacy notice and terms are approved.
- [ ] Support and escalation ownership is defined for the pilot.

## References

- OWASP ASVS: https://asvs.owasp.org/; OWASP MASVS: https://mas.owasp.org/MASVS/

---

This document is part of the OneXDeal engineering documentation set. Update this document through a reviewed change; do not let an AI agent silently change product or architecture decisions.
