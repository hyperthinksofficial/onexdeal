# OneXDeal Testing Strategy

**Test pyramid, acceptance scenarios and release gates**

- Date: 17 November 2026
- Version: v1.1 - Owner-Approved Engineering Baseline
- Status: Approved for implementation

> Purpose: Defines what to test, at which layer and what must pass before the Hosur pilot is released.

## 1. Test objectives

Testing must prove core marketplace journeys, Google OAuth & Email/Password verification boundaries, role separation (`user`, `moderator`, `admin`), listing moderation & 30-day expiry rules, `₹0` (Free) vs. priced listing invariants, real-time chat & transactional unread counters, PostGIS location search correctness (`2, 5, 10, 25, 50 km`), and abuse controls.

## 2. Test pyramid and tooling

| Layer                  | Approved tools                                                | Primary coverage                                                                                                                                                                         |
| ---------------------- | ------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Unit                   | Vitest / Jest                                                 | Domain rules, Zod schemas (`@onexdeal/types`), price/paise & `"Free"` formatting (`@onexdeal/utils`), PII scrubbing, state transitions                                                   |
| API integration        | Vitest + Supertest + test PostgreSQL 18 / PostGIS 3.7 + Redis | Google ID token verification stub, Email/Password + email verification, safe account linking, RBAC, listing lifecycle & moderation, PostGIS radius search, chat unread counters, reports |
| Mobile & Web component | Vitest / Jest + Testing Library                               | UI tokens (`@onexdeal/ui`), forms, cards, filter sheet, empty/error/loading states                                                                                                       |
| Web E2E                | Playwright                                                    | Public browse, admin sign-in, moderation queue (approve/reject with reason) and role restrictions                                                                                        |
| Mobile E2E             | Maestro or Detox                                              | Google/Email sign-in, email verification gate, create listing, locality/radius search, favorite, chat and report                                                                         |
| Load/performance       | k6                                                            | Search/read API, listing feed, auth rate limits, chat send/connect                                                                                                                       |
| Security/quality       | Dependency audit, secret scanning, OWASP ASVS/MASVS checks    | Static analysis, dependency and secrets risk, authorization matrix                                                                                                                       |

## 3. Critical end-to-end scenarios

1. **Email/Password Registration & Verification Gate:** New user registers with email/password -> receives verification email (via `EmailProvider` / Mailpit) -> attempting to publish a listing before verification is blocked -> user verifies email via single-use link -> can now submit a listing.
2. **Google Sign-In & Safe Account Linking:** User signs in with Google (verified email) -> receives valid session without extra verification step -> safe linking rules prevent account takeover of pre-existing unverified email accounts.
3. **Create Listing & Initial Moderation:** Verified seller creates a listing (priced or `₹0` Free, 1–8 photos, Hosur locality) -> enters `pending_review` -> does not appear in public search.
4. **Moderation Approval & 30-Day Expiry:** Moderator approves listing -> `status = 'active'` and `expires_at = published_at + 30 days` -> buyer finds it by text/category/radius (`2, 5, 10, 25, 50 km`) and opens details.
5. **Material Edit Re-Moderation vs. Immediate Status Change:** Seller edits title, description or photos on an `active` listing -> listing transitions back to `pending_review`. Seller marks an `active` listing `sold` or `archived` -> change is immediate and listing leaves public search.
6. **Moderation Rejection with Reason:** Moderator rejects a `pending_review` listing with a required `rejection_reason` -> moderation history is recorded -> seller sees reason, corrects and resubmits.
7. **Listing Expiry & Renewal:** Listing reaches `expires_at` (30 days) -> automatically stops appearing in public search without being deleted -> seller renews/relists subject to moderation.
8. **Chat & Transactional Unread Counters:** Buyer starts chat on an active listing -> message is persisted and `seller_unread_count` increments transactionally -> seller reads conversation -> `seller_unread_count` resets to `0` and `seller_last_read_at` updates.
9. **Block & Report:** Buyer blocks seller -> further messages are rejected -> abuse report is visible to moderators.
10. **Manual Locality Selection Fallback:** User denies GPS permission -> selects a curated Hosur locality -> radius search centers on the selected locality's coordinates.

## 4. Authorization and abuse test matrix

| Test                                                                                       | Expected result                               |
| ------------------------------------------------------------------------------------------ | --------------------------------------------- |
| Unverified email/password user submits a listing                                           | `403 Forbidden` (email verification required) |
| User attempts to set `role: 'admin'` or `'moderator'` in registration/profile update       | Ignored/rejected; role remains `'user'`       |
| User A requests edit/sold/delete on User B's listing                                       | `403` or safe `404`; no mutation              |
| Free listing (`pricePaise = 0`) submitted with `isNegotiable = true`                       | `400 Bad Request` validation error            |
| Negative price (`pricePaise < 0`) submitted                                                | `400 Bad Request` validation error            |
| Moderator rejects listing without `rejectionReason`                                        | `400 Bad Request` validation error            |
| Non-member reads conversation messages or sends message                                    | Denied (`403`)                                |
| Blocked participant sends message                                                          | Denied (`403`)                                |
| Regular `user` calls `/api/v1/admin/*` or moderation endpoints                             | Denied (`403`) regardless of UI               |
| Reused or expired email verification / password reset token                                | Rejected (`400`/`401`)                        |
| Login / resend-verification / password-reset burst                                         | Rate-limited (`429`) via Redis                |
| Search query attempts to expose `pending_review`, `rejected`, `expired` or `sold` listings | Excluded from public search results           |

## 5. Data, money and location tests

- PostGIS (`geography(Point, 4326)`) radius tests verify `2 km`, `5 km`, `10 km` (default), `25 km`, and `50 km` filters, boundary distances, and curated Hosur locality coordinates.
- Money tests cover `0` paise (`"Free"`, `isNegotiable: false`), positive paise values, `BIGINT` precision, and `en-IN` INR formatting (`₹`).
- Time tests verify UTC storage, `Asia/Kolkata` display, and 30-day expiry exclusion.
- Migrations test cleanly on an empty PostgreSQL 18 + PostGIS 3.7 database and upgrade cleanly from prior migrations.

## 6. CI gates and quality thresholds

| Gate             | Minimum expectation                                                                             |
| ---------------- | ----------------------------------------------------------------------------------------------- |
| `pnpm lint`      | Zero lint errors across all apps and packages.                                                  |
| `pnpm typecheck` | Zero TypeScript errors (`strict: true`) across all apps and packages.                           |
| `pnpm test`      | All unit and integration tests pass.                                                            |
| `pnpm build`     | All packages and apps build cleanly.                                                            |
| Security         | No committed secrets, no high/critical dependency vulnerabilities without documented exception. |

---

This document is part of the OneXDeal engineering documentation set. Update this document through a reviewed change; do not let an AI agent silently change product or architecture decisions.
