# OneXDeal Solution Architecture

**Application, backend, deployment and scaling design**

- Date: 17 November 2026
- Version: v1.1 - Owner-Approved Engineering Baseline
- Status: Approved for implementation

> Purpose: Describes the approved technical system for the React Native mobile app, Next.js web app and Node.js backend.

> Decision labels: **Approved** = confirmed by project owner; **Deferred** = intentionally outside MVP; **Open** = pending later phase selection.

## 1. Approved architecture decisions

| Area               | Approved baseline                                                                                                                                                | Status   |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| Mobile             | React Native + Expo + TypeScript (`apps/mobile`); native iOS/Android builds                                                                                      | Approved |
| Web/admin          | Next.js App Router + TypeScript (`apps/web`)                                                                                                                     | Approved |
| Backend            | Node.js + Express + TypeScript (`apps/api`); REST API `/api/v1`                                                                                                  | Approved |
| Architecture       | Modular monolith with explicit domain modules; extract microservices only if measured scaling justifies it                                                       | Approved |
| Database           | PostgreSQL 18 (latest minor release) + PostGIS 3.7.x + `pg_trgm` + Drizzle ORM + versioned SQL migrations                                                        | Approved |
| Supporting infra   | Redis for BullMQ background queues, shared rate-limiting, justified caching, and future multi-instance Socket.IO scaling                                         | Approved |
| Realtime chat      | Socket.IO gateway (`/realtime`) on API server using standard in-memory adapter initially; switch to Redis adapter when multiple Socket.IO instances are deployed | Approved |
| Authentication     | Google OAuth 2.0 (server-side ID token verification) + Email/Password (Argon2id + mandatory email verification)                                                  | Approved |
| SMS / WhatsApp OTP | Deferred to future phase; not in MVP (no MSG91/2Factor.in integration in MVP)                                                                                    | Deferred |
| Search             | PostgreSQL 18 full-text + `pg_trgm` + PostGIS 3.7 (`geography(Point, 4326)`) behind `SearchProvider` interface                                                   | Approved |
| Media              | Cloudflare R2 + CDN behind `StorageProvider` interface (portable to AWS S3 Mumbai)                                                                               | Approved |
| Email              | Configurable transactional email behind `EmailProvider` interface (local testing via Mailpit; never depend on personal Gmail SMTP)                               | Approved |
| Push               | Expo Push Service behind `PushProvider` interface (portable to direct FCM/APNs)                                                                                  | Approved |
| Error monitoring   | Sentry with strict PII scrubbing                                                                                                                                 | Approved |
| Monorepo           | Turborepo + pnpm workspaces (`apps/mobile`, `apps/web`, `apps/api`, `packages/ui`, `packages/types`, `packages/utils`, `packages/config`)                        | Approved |
| Hosting            | Hostinger KVM VPS running Docker Compose; cloud-portable to AWS/Azure                                                                                            | Approved |

## 2. High-level system shape

```text
Mobile app (React Native / Expo)      Web + Admin (Next.js App Router)
              \                         /
               ---- HTTPS REST API -----
                        |
          Node.js / Express modular monolith (apps/api)
      auth | users | taxonomy | localities | listings | search
      chat | media | moderation | favorites | notifications | analytics
           |                    |                   |
     PostgreSQL 18        Cloudflare R2      Socket.IO Gateway
    + PostGIS 3.7.x      (StorageProvider)   (in-memory MVP ->
     + pg_trgm                  |             Redis adapter later)
           |                    |
        Redis (BullMQ jobs, rate limits, justified cache)

External providers (via adapters):
- Google OAuth 2.0 (ID token verification)
- EmailProvider (transactional verification & reset links; Mailpit locally)
- PushProvider (Expo Push Service -> FCM/APNs)
- Sentry (error monitoring with PII scrubbing)
```

In MVP, domain modules live in one codebase (`apps/api`) with separate process entrypoints for the HTTP/Socket.IO server and the BullMQ background worker. Boundaries remain explicit so high-load modules can be extracted into services in the future without rewriting business logic.

## 3. Why a modular monolith first?

OneXDeal launches with a focused pilot in Hosur before expanding across Tamil Nadu and India. A modular monolith provides clean domain boundaries, single-database ACID transactions, and straightforward operations on a Hostinger KVM VPS:

- Use module interfaces and domain events, not direct cross-module table writes.
- Keep PostGIS spatial queries encapsulated in dedicated repository/query modules.
- Keep the Socket.IO realtime gateway behind a clean module boundary (`chat`), using the standard in-memory adapter for single-instance deployment and enabling `@socket.io/redis-adapter` only when scaling horizontally to multiple API instances.
- Do not create separate databases per module in MVP.

## 4. Approved monorepo structure

```text
onexdeal/
  apps/
    mobile/          # Expo React Native app (Android & iOS)
    web/             # Next.js App Router (public web + protected admin routes)
    api/             # Node.js + Express API, Socket.IO gateway & BullMQ worker
  packages/
    ui/              # Design system tokens, theme helpers and shared UI primitives
    types/           # Shared Zod schemas, DTOs, API envelopes and provider interfaces
    utils/           # Shared pure utilities (INR paise formatter, geo helpers, PII scrubber)
    config/          # Shared TypeScript, ESLint and Prettier configurations
  infra/
    docker/          # Dockerfiles and database init scripts
    hostinger/       # Hostinger KVM VPS bootstrap, reverse proxy and backup notes
  docs/              # Engineering documentation pack (source of truth)
  .github/
    workflows/       # GitHub Actions CI pipelines
  AGENTS.md
  README.md
  docker-compose.yml
  package.json
  pnpm-workspace.yaml
  turbo.json
```

## 5. Backend modules and responsibilities

| Module        | Responsibilities                                                                                                                                                          |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Auth          | Google OAuth 2.0 verification, Email/Password registration (Argon2id), email verification tokens, password reset links, session rotation/revocation, safe account linking |
| Users         | Profile, preferences, optional nullable phone field, RBAC (`user`, `moderator`, `admin`), account lifecycle, blocks                                                       |
| Taxonomy      | Category tree, `requires_condition` rules, sort order and admin configuration                                                                                             |
| Localities    | Curated Hosur localities (expandable across Tamil Nadu/India) with PIN codes and centroid coordinates                                                                     |
| Listings      | Create/update/state transitions (`pending_review`, `active`, `rejected`, `sold`, `archived`, `expired`), 30-day expiry, `₹0` Free & priced rules, ownership               |
| Media         | Upload intent, `StorageProvider` (Cloudflare R2), magic-byte validation, EXIF stripping and WebP derivatives via BullMQ                                                   |
| Search        | PostGIS `geography(Point, 4326)` radius queries (2/5/10/25/50 km) + `tsvector` + `pg_trgm` text search behind `SearchProvider`                                            |
| Favorites     | Save/remove and user-specific list                                                                                                                                        |
| Chat          | Conversation membership, transactional unread counters (`buyer_unread_count`, `seller_unread_count`), message persistence, Socket.IO events                               |
| Moderation    | Listing review queue, mandatory rejection reasons, moderation history audit, user reports and restrictions                                                                |
| Notifications | In-app notifications, `PushProvider` (Expo Push) jobs and `EmailProvider` transactional emails                                                                            |
| Admin/Audit   | Staff RBAC, category/locality management, immutable `admin_audit_logs`                                                                                                    |
| Analytics     | Privacy-conscious event collection and aggregated pilot metrics                                                                                                           |

## 6. API and realtime contracts

- REST base path: `/api/v1`. Use plural resource nouns, consistent cursor pagination for feeds, and OpenAPI documentation.
- Validate all request params, body and query values at the API boundary using shared Zod schemas in `@onexdeal/types`.
- Standard response envelope: `{ data, meta? }` for success; `{ error: { code, message, details?, requestId } }` for failures.
- Use idempotency keys (`clientMessageId` / `Idempotency-Key`) for retryable create/send operations.
- Realtime namespace: `/realtime`. Authenticate handshake and authorize every conversation event against membership and block state.
- Persist messages and update conversation unread counters transactionally in PostgreSQL before emitting durable Socket.IO events.

## 7. Hosting and deployment (Hostinger KVM VPS)

The approved initial target is a **Hostinger KVM VPS** managed via **Docker Compose**, designed so the stack can migrate cleanly to AWS, Azure, or another cloud platform later without changing application business logic:

- **Containers in Production Compose:**
  1. Reverse proxy (Caddy/Nginx) handling HTTPS/TLS termination and WebSocket upgrades.
  2. `web`: Next.js application container.
  3. `api`: Node.js Express API + Socket.IO gateway container.
  4. `worker`: Node.js BullMQ background worker container.
  5. `postgres`: PostgreSQL 18 + PostGIS 3.7.x (`postgis/postgis:18-3.7`) bound to internal network.
  6. `redis`: Redis 7 bound to internal network for BullMQ and rate limits.
- **Resource sizing:** Do not assume the smallest VPS plan is sufficient; evaluate vCPU/RAM/NVMe memory footprint of PostgreSQL 18 + PostGIS + Next.js + Node API + worker before selecting the production KVM tier (recommend at least 8 GB RAM / KVM 2 or KVM 4 for comfortable headroom).
- **Storage & Backups:** Store user media in Cloudflare R2 (`StorageProvider`), never on the VPS filesystem. Configure automated encrypted off-site PostgreSQL backups and rehearse restoration before launch.
- **Environments:** Maintain strict separation between development, staging, and production configurations and secrets.

## 8. Security and observability architecture

- TLS at every public endpoint; secrets injected from environment variables, never committed or bundled in client apps.
- Server-side RBAC (`user`, `moderator`, `admin`), email-verification checks, and object-level ownership on every protected operation.
- Structured logs with request ID; Sentry error tracking with strict PII scrubbing (never log passwords, verification/reset/session tokens, private messages, or raw GPS coordinates).
- Monitor VPS CPU, RAM, disk, network, PostgreSQL connections/slow queries, Redis memory/queue depth, and API p95 latency.

## 9. Scaling and extraction triggers

- Scale the VPS vertically or move PostgreSQL/Redis to managed cloud services after measuring CPU, RAM, disk I/O, and p95 latency.
- Enable the Socket.IO Redis adapter when scaling `api` horizontally beyond a single container instance.
- Extract a module into a standalone microservice only when it has a distinct scaling curve, security boundary, or team ownership trigger.

---

This document is part of the OneXDeal engineering documentation set. Update this document through a reviewed change; do not let an AI agent silently change product or architecture decisions.
