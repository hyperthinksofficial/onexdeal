# OneXDealProduct Blueprint

**Product direction, pilot scope and delivery map**

- Date: 17 November 2026
- Version: v1.1 - Owner-Approved Engineering Baseline
- Status: Approved for implementation

> Purpose: A concise product-level blueprint that aligns product, design and engineering around the first Hosur launch.

> Decision labels: **Approved** = confirmed by project owner; **Deferred** = intentionally outside MVP; **Open** = pending later phase selection.

## 1. Product at a glance

OneXDeal is a location-aware, peer-to-peer classifieds marketplace. People in and around Hosur can discover nearby products, publish listings (including free `₹0` items and priced items), save favorites and contact sellers through in-app chat. The first release is a marketplace discovery and communication product; it is not a payment or delivery platform.

| Item              | Baseline                                                                                    |
| ----------------- | ------------------------------------------------------------------------------------------- |
| Product           | OneXDeal - local-first marketplace                                                          |
| Pilot geography   | Hosur, Krishnagiri district, Tamil Nadu, India (curated localities + radius search)         |
| Initial clients   | Android and iOS mobile apps (`apps/mobile`); responsive web and admin console (`apps/web`)  |
| Primary users     | Buyers/sellers (unified `user` role), moderators (`moderator`) and administrators (`admin`) |
| Authentication    | Google Sign-In (OAuth 2.0) and Email + Password with mandatory email verification           |
| Business model    | Not an MVP dependency; free and priced peer-to-peer listings                                |
| Delivery strategy | Validate locally in Hosur, improve, then expand across Tamil Nadu and India                 |

## 2. Product vision and principles

Make it fast and safe for nearby people to discover useful products and start a direct conversation. OneXDeal should feel trustworthy, lightweight and understandable to first-time marketplace users.

- Local relevance first: show useful nearby listings (default 10 km radius; selectable 2, 5, 10, 25, 50 km) and curated Hosur localities when GPS is unavailable.
- Low-friction posting: guide a verified seller through a short, structured listing flow.
- Trust before growth: email/Google verification, mandatory listing moderation (`pending_review`), reporting, blocking and privacy are MVP capabilities.
- Mobile-first: core buyer and seller journeys must work well on Android and iOS.
- Portable engineering: avoid vendor lock-in; keep storage, email, push and search behind clean adapter interfaces.
- Measure before scaling: use pilot data to decide when to add external search vendors, horizontal Socket.IO Redis scaling or microservices.

## 3. Personas and key needs

| Persona                    | Primary job                  | Needs                                                                                                    |
| -------------------------- | ---------------------------- | -------------------------------------------------------------------------------------------------------- |
| Local buyer (`user`)       | Find a product nearby        | Useful search, clear photos/price (or Free badge), approximate area, seller profile, safe in-app contact |
| Individual seller (`user`) | List and sell an item        | Quick posting, photo upload, edit/sold/archive controls, inbox and clear moderation feedback             |
| Moderator (`moderator`)    | Keep the marketplace healthy | Review queue, reports, evidence, action history and mandatory structured rejection reason codes          |
| Administrator (`admin`)    | Operate the pilot            | Manage users, categories, localities, configuration, roles, metrics and audit trail                      |

_Note: A normal registered account (`user` role) can act as both buyer and seller._

## 4. Core journeys

1. Buyer: open app -> choose/confirm approximate Hosur locality or GPS -> browse categories or search -> filter by radius (2/5/10/25/50 km)/price/condition -> open listing -> save or start chat -> report/block when necessary.
2. Seller: sign in with Google or register with Email/Password & verify email -> complete basic profile -> create listing -> add 1–8 photos -> preview -> submit for moderation (`pending_review`) -> receive approval/rejection -> respond to buyer -> mark sold or archive (or renew after 30-day expiry).
3. Moderator: open queue -> inspect listing (`pending_review` from creation or material edit) and seller history -> approve or reject with required reason code -> review user reports -> take proportionate action.
4. Administrator: configure categories, localities and limits -> manage staff roles (`moderator`, `admin`) -> review audit events and marketplace health -> manage backups and release access.

## 5. Scope by release

| Release           | Included                                                                                                                                                                                                                                                                                                                                                                                     | Explicitly deferred                                                                                                                                                       |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| MVP / Hosur pilot | Google Sign-In (OAuth 2.0), Email/Password auth + email verification, profiles, categories, curated Hosur localities, listing create/edit/sold/archive/expiry (30d), photos (Cloudflare R2), local search (PostgreSQL 18 + PostGIS 3.7 + `pg_trgm`), filters, favorites, text chat (Socket.IO), push/in-app notifications (Expo Push), reporting/blocking, admin moderation, basic analytics | SMS OTP, WhatsApp OTP, phone verification, payments/Razorpay, escrow, delivery/logistics, bidding, seller subscriptions, public ratings/reviews, advanced recommendations |
| Pilot hardening   | Optional phone verification (E.164 + HMAC + encryption), search relevance tuning, improved moderation tooling, Tamil translations, saved searches, additional abuse controls                                                                                                                                                                                                                 | Major service decomposition or multi-region architecture                                                                                                                  |
| Growth            | Evaluate Algolia/GeoSearch, Redis Socket.IO multi-node adapter, payment flows, richer messaging, additional Tamil Nadu/India cities and independent services                                                                                                                                                                                                                                 | Only build features supported by observed demand and legal/operational readiness                                                                                          |

## 6. MVP product map

- Mobile app (`apps/mobile`): onboarding; Google Sign-In & Email/Password auth; home/feed; category browse; search and filter; listing details; create/edit listing; favorites; inbox/chat; notifications; profile; settings; report/block.
- Web (`apps/web`): public landing pages and crawlable listing/category pages; responsive browsing; protected admin console for moderation and operations.
- Backend (`apps/api`): auth, users, taxonomy, localities, listings, media, search, favorites, conversations, notifications, reports, admin, audit and analytics modules.
- Shared packages: `@onexdeal/ui`, `@onexdeal/types`, `@onexdeal/utils`, `@onexdeal/config`.
- Platform operations: GitHub Actions CI, Sentry error monitoring, Docker Compose on Hostinger KVM VPS, off-site encrypted backups, database migrations, incident runbook and release checklist.

## 7. Pilot success measures

| Metric                | Definition                                                | Why it matters                                   |
| --------------------- | --------------------------------------------------------- | ------------------------------------------------ |
| Seller activation     | Verified users who publish their first approved listing   | Measures supply creation                         |
| Search-to-detail rate | Search sessions that open at least one listing detail     | Measures relevance                               |
| Detail-to-chat rate   | Listing-detail views that initiate a conversation         | Measures buyer intent                            |
| Time to publish       | Time from submit to moderation decision                   | Measures seller friction and moderation capacity |
| 7-day returning users | Users active again within 7 days                          | Early retention signal                           |
| Trust and safety      | Reports per 1,000 active listings; action resolution time | Detects marketplace quality issues               |
| Reliability           | Crash-free mobile sessions, API errors and latency        | Protects user experience                         |

## 8. Non-functional product targets

- API target: p95 under 500 ms for common authenticated reads under the agreed pilot load; search target p95 under 800 ms. Measure rather than promise.
- Mobile: usable on mid-range Android devices and typical 4G; compress images and paginate feeds.
- Availability: initial operating target 99.5% monthly on Hostinger KVM VPS.
- Accessibility: adequate contrast, scalable text, touch targets, labels and keyboard support on web.
- Privacy: do not expose a seller’s exact home address or optional phone number; use approximate listing location and explicit location permission.

## 9. Key risks and mitigations

| Risk                           | Mitigation                                                                                                                             |
| ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------- |
| Low initial listing density    | Start with a tightly defined Hosur pilot; seed legitimate supply with consent; track category liquidity.                               |
| Scams and prohibited listings  | Mandatory moderation queue for new listings and material edits, report/block, rate limits, and user education.                         |
| Location privacy               | Strip EXIF GPS metadata, use approximate public coordinates/locality centroids, explicit permission, and server-side radius filtering. |
| Single VPS operations          | Use Docker Compose on Hostinger KVM VPS with off-site R2/S3 backups, tested restore drills, and portable containers.                   |
| Premature complexity           | Start with a modular monolith (in-memory Socket.IO initially, Redis for BullMQ/rate-limits) and scale horizontally only when measured. |
| Uncontrolled AI-generated code | Agent instructions, small PRs, tests, human review and no autonomous production changes.                                               |

## 10. Approved baseline decisions

| Decision                              | Status   | Details                                                                                                  |
| ------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------- |
| Hosur / Tamil Nadu pilot              | Approved | Hosur first (with curated locality table); expand across Tamil Nadu & India.                             |
| React Native + Expo (`apps/mobile`)   | Approved | Cross-platform Android & iOS mobile app in TypeScript.                                                   |
| Next.js (`apps/web`)                  | Approved | Public web plus protected admin routes in TypeScript.                                                    |
| Node.js + Express (`apps/api`)        | Approved | TypeScript modular monolith REST API (`/api/v1`) + Socket.IO (`/realtime`).                              |
| Database: PostgreSQL 18 + PostGIS 3.7 | Approved | Includes `pg_trgm`, Drizzle ORM, and version-controlled SQL migrations.                                  |
| Supporting infra: Redis               | Approved | Used for BullMQ queues, shared rate-limiting, and justified caching.                                     |
| Authentication                        | Approved | Google Sign-In (OAuth 2.0) + Email/Password with mandatory email verification.                           |
| SMS / WhatsApp OTP                    | Deferred | Explicitly excluded from MVP; phone number is optional and unverified in MVP.                            |
| Hosting: Hostinger KVM VPS            | Approved | Docker Compose deployment with HTTPS reverse proxy and off-site backups.                                 |
| Storage / Push / Error providers      | Approved | Cloudflare R2 (`StorageProvider`), Expo Push (`PushProvider`), Sentry, and configurable `EmailProvider`. |
| Brand identity and monetisation       | Open     | Using v1 design tokens in `@onexdeal/ui`; monetisation deferred.                                         |

## 11. Definition of MVP ready

- [ ] A user can register and sign in securely via Google OAuth 2.0 or Email/Password (with email verification).
- [ ] A verified seller can submit a complete listing (priced or Free `₹0`) with photos and a Hosur locality/approximate location.
- [ ] Material edits to title, description or photos re-enter `pending_review`; mark-sold and archive take effect immediately.
- [ ] A buyer can search nearby active, non-expired listings (2/5/10/25/50 km radius) and open details.
- [ ] A buyer can start a conversation and messages/unread counters update reliably.
- [ ] Users can favorite, report and block.
- [ ] Moderators can approve/reject listings (with mandatory rejection reasons) and act on reports with an audit trail.
- [ ] Critical journeys pass automated and manual release tests.
- [ ] Backups, monitoring, support contact and rollback procedures are tested.
- [ ] Privacy notice, terms, prohibited-items policy and user-facing safety guidance are reviewed before public release.

---

This document is part of the OneXDeal engineering documentation set. Update this document through a reviewed change; do not let an AI agent silently change product or architecture decisions.
