# OneXDeal - AI Coding Agent Instructions

**Prepared:** 17 November 2026 | **Version:** 1.1 (Owner-Approved Engineering Baseline)

## Before you act

1. Read this file and the relevant `/docs/*.md` documents.
2. Treat the PRD, architecture, database, security, code-style and testing documents as the project source of truth.
3. If two documents conflict, stop and report the conflict; do not silently choose one.
4. Identify the task, files to change, dependencies, assumptions, acceptance criteria and risks before editing.

## Approved project baseline

- **Product:** OneXDeal, Hosur-first local classifieds marketplace (scaling across Tamil Nadu and India).
- **Mobile:** React Native + Expo + TypeScript (`apps/mobile`).
- **Web/admin:** Next.js App Router + TypeScript (`apps/web`).
- **Backend:** Node.js + Express + TypeScript (`apps/api`).
- **Workspace:** Turborepo + pnpm monorepo (`apps/mobile`, `apps/web`, `apps/api`, `packages/ui`, `packages/types`, `packages/utils`, `packages/config`).
- **Database:** PostgreSQL 18 (latest minor release) + PostGIS 3.7.x + `pg_trgm`, accessed via **Drizzle ORM** with version-controlled SQL migrations (Owner-Approved).
- **Supporting Infrastructure:** Redis (for BullMQ background queues, shared rate-limiting, justified caching, and future multi-instance Socket.IO scaling; initial single-instance deployment uses the standard in-memory Socket.IO adapter).
- **MVP Architecture:** Modular monolith with strict bounded modules; do not introduce microservices without an approved architecture decision record (ADR) and measured scaling need.
- **Hosting:** Hostinger KVM VPS with Docker Compose (Next.js web, Node API, Socket.IO gateway, BullMQ worker, PostgreSQL 18 + PostGIS 3.7, Redis, HTTPS reverse proxy, encrypted off-site backups). Designed for cloud portability (AWS/Azure).
- **Authentication (MVP):**
  1. Google Sign-In (Google OAuth 2.0 with backend ID token validation).
  2. Email + Password registration (Argon2id password hashing, mandatory email verification before publishing listings, secure password reset).
- **Phone / SMS / WhatsApp Policy (MVP):** SMS OTP and WhatsApp OTP are **NOT** in MVP (deferred to future phase). Do not integrate MSG91, 2Factor.in, or WhatsApp OTP providers. Phone number is optional/nullable and must not be used as a login identifier or require verification in MVP.
- **External Provider Defaults:**
  - Object Storage: Cloudflare R2 behind `StorageProvider` interface (portable to AWS S3 Mumbai).
  - Transactional Email: Configurable behind `EmailProvider` interface (with local dev testing via Mailpit; never depend on personal Gmail SMTP).
  - Push Notifications: Expo Push Service behind `PushProvider` interface (portable to direct FCM/APNs).
  - Error Monitoring: Sentry with strict PII scrubbing.
- **Product Rules (Hosur MVP):**
  - Moderation: All new listings and material edits (title, description, photos) enter `pending_review`; mark-sold/archive are immediate; rejected listings require a rejection reason.
  - Expiry: 30 days from approval/publication; expired listings leave public search without hard deletion.
  - Search Radius: Default 10 km; selectable 2 km, 5 km, 10 km, 25 km, 50 km; curated Hosur localities fallback.
  - Pricing: Integer paise (`BIGINT`), minimum `₹0` (Free listings approved; `₹0` displays as `"Free"` and cannot be marked `is_negotiable`).
- **Payments:** Out of MVP. Do not implement Razorpay unless scope is formally changed.

## Model routing

- Use `gemini-3.8-flash` for the normal build/test/refactor loop.
- Use `gemini-4-argon` for independent high-reasoning architecture/security/migration review only when the account has access. Do not assume access.
- No model output is trusted without code review and tests.
- Never place AI, OAuth client secrets, email, storage, database or analytics secrets in client-side code.

## Engineering rules

- TypeScript strict mode across all apps and packages; no casual `any`.
- Validate all external input at boundaries with Zod schemas from `@onexdeal/types`.
- Enforce auth, email verification state, object ownership and role permissions (`user`, `moderator`, `admin`) on the server for every protected operation. Never allow users to self-assign elevated roles.
- Use `route -> controller -> service/use case -> repository/provider adapter`.
- Keep PostGIS spatial queries encapsulated in dedicated repository/query modules using `geography(Point, 4326)`.
- Never access the database directly from UI or Express route handlers.
- Use parameterised queries / Drizzle ORM bound parameters; never concatenate untrusted input into SQL or shell commands.
- API path prefix `/api/v1`; update OpenAPI/contracts when endpoints change.
- Add tests for success, validation failure, permission denial, edge cases and retries.
- Keep user-generated content untrusted; safely render and moderate it.
- Never log passwords, email verification tokens, password reset tokens, session tokens, private message bodies or precise GPS coordinates.
- Store mobile auth secrets in OS-backed secure storage; web sessions should use secure `HttpOnly` cookies where applicable.
- All migrations must be versioned SQL migrations reviewed, tested on an empty and upgraded database, and include rollback/forward-fix notes.

## Definition of done for each task

- Implementation meets the relevant requirement IDs and acceptance criteria.
- Tests added/updated and passing.
- Lint (`pnpm lint`), typecheck (`pnpm typecheck`), tests (`pnpm test`) and build (`pnpm build`) pass across the monorepo.
- API/schema/design/security docs updated when affected.
- Diff checked for secrets, permissions, privacy, accessibility and unnecessary changes.
- Completion report states files changed, commands/tests run and exact outcomes, known limits and human decisions required.

## Human approval is mandatory

Do not autonomously:

- deploy to production, publish app-store builds or merge protected branches;
- run destructive database or infrastructure commands;
- change authentication, payment, privacy or security policy;
- create paid cloud/provider resources or incur spend;
- use real customer data, secrets or production credentials in prompts or tests.

## Required completion report

```text
Task:
Plan followed:
Files changed:
API/schema changes:
Tests run and exact results:
Lint/typecheck/build results:
Security/privacy review:
Known limitations:
Manual verification needed:
Migration/rollback notes:
Human decisions required:
```
