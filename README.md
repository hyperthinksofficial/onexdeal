# OneXDeal — Local Classifieds Marketplace Monorepo

**Version:** 1.1 — Owner-Approved Engineering Baseline (Phase 0 Scaffold)  
**Pilot Market:** Hosur, Krishnagiri district, Tamil Nadu, India (designed for Tamil Nadu & India-wide expansion)

OneXDeal is a location-aware, mobile-first peer-to-peer classifieds marketplace. Users can discover nearby products by radius (`2 km, 5 km, 10 km, 25 km, 50 km`) or curated locality, publish priced or `₹0` (Free) listings with moderator review, save favorites, and chat with sellers in real time.

---

## 1. Approved Technology Baseline

| Area                     | Approved Baseline                                                                                            | Status       |
| :----------------------- | :----------------------------------------------------------------------------------------------------------- | :----------- |
| **Pilot Market**         | Hosur first (curated localities + PostGIS radius search); scale across Tamil Nadu & India                    | **Approved** |
| **Monorepo**             | Turborepo + `pnpm` workspaces + TypeScript (`strict: true`)                                                  | **Approved** |
| **Mobile App**           | React Native + Expo + TypeScript (`apps/mobile`)                                                             | **Approved** |
| **Web & Admin**          | Next.js App Router + TypeScript (`apps/web`)                                                                 | **Approved** |
| **Backend API**          | Node.js + Express + TypeScript (`apps/api`) — Modular Monolith (`/api/v1` + Socket.IO `/realtime`)           | **Approved** |
| **Database**             | PostgreSQL 18 + PostGIS 3.7.x + `pg_trgm` + **Drizzle ORM** + versioned SQL migrations                       | **Approved** |
| **Supporting Infra**     | Redis (BullMQ job queues, shared rate-limiting, justified cache; Socket.IO uses in-memory adapter initially) | **Approved** |
| **Authentication (MVP)** | (1) Google Sign-In (OAuth 2.0) and (2) Email + Password (Argon2id) with mandatory email verification         | **Approved** |
| **SMS / WhatsApp OTP**   | Explicitly deferred to a future phase (phone is optional/unverified in MVP; no MSG91/2Factor.in)             | **Deferred** |
| **Object Storage**       | Cloudflare R2 behind `StorageProvider` interface (portable to AWS S3 Mumbai)                                 | **Approved** |
| **Transactional Email**  | Configurable behind `EmailProvider` interface (local testing via Mailpit; never use personal Gmail SMTP)     | **Approved** |
| **Push Notifications**   | Expo Push Service behind `PushProvider` interface (portable to direct FCM/APNs)                              | **Approved** |
| **Error Monitoring**     | Sentry with strict PII scrubbing                                                                             | **Approved** |
| **Hosting**              | Hostinger KVM VPS running Docker Compose + HTTPS reverse proxy + encrypted off-site backups                  | **Approved** |
| **Payments**             | Out of MVP (Razorpay remains deferred)                                                                       | **Deferred** |

---

## 2. Repository Structure

```text
onexdeal/
├── apps/
│   ├── api/                 # Node.js + Express API, Socket.IO gateway & BullMQ worker
│   ├── mobile/              # React Native + Expo cross-platform mobile application
│   └── web/                 # Next.js App Router public web & protected admin console
├── packages/
│   ├── config/              # @onexdeal/config: Shared TypeScript, ESLint & Prettier configs
│   ├── types/               # @onexdeal/types: Shared Zod schemas, DTOs & provider interfaces
│   ├── ui/                  # @onexdeal/ui: Design system tokens & cross-platform UI primitives
│   └── utils/               # @onexdeal/utils: Currency/paise formatting ("Free"), geo & PII scrubbing
├── infra/
│   └── docker/              # PostgreSQL 18 + PostGIS 3.7 initialization scripts
├── docs/                    # Engineering documentation pack (01-blueprint through 09-ai-agents)
├── .github/
│   └── workflows/           # GitHub Actions CI pipeline (lint, typecheck, test, build)
├── AGENTS.md                # AI coding agent instructions and guardrails
├── docker-compose.yml       # Local development infrastructure (Postgres 18 + PostGIS 3.7, Redis, Mailpit, MinIO)
├── package.json             # Root workspace scripts and devDependencies
├── pnpm-workspace.yaml      # pnpm workspace definition
└── turbo.json               # Turborepo task pipeline configuration
```

---

## 3. Quick Start (Local Development)

### Prerequisites

- **Node.js:** `>= 22.0.0` (tested on Node 22 / 24)
- **pnpm:** `>= 9.0.0`
- **Docker & Docker Compose:** For local PostgreSQL 18 + PostGIS 3.7, Redis, Mailpit, and MinIO.

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Configure Environment Variables

Copy the example environment files for local development:

```bash
cp .env.example .env
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
cp apps/mobile/.env.example apps/mobile/.env
```

### 3. Start Local Infrastructure (Docker Compose)

```bash
docker compose up -d
```

This starts:

- **PostgreSQL 18 + PostGIS 3.7.x:** `localhost:5432` (with `postgis` and `pg_trgm` initialized)
- **Redis 7:** `localhost:6379`
- **Mailpit (Local Email Testing):** SMTP on `localhost:1025`, Web UI on `http://localhost:8025`
- **MinIO (Local S3/R2-Compatible Storage):** API on `http://localhost:9000`, Console on `http://localhost:9001`

### 4. Run Quality Checks & Tests

```bash
pnpm lint        # Run ESLint across all apps and packages
pnpm typecheck   # Run TypeScript strict type checking across all workspaces
pnpm test        # Run unit tests across all workspaces
pnpm build       # Build all packages and applications via Turborepo
```

### 5. Start Development Servers

```bash
pnpm dev         # Run API, Web, and Mobile in development mode
```

---

## 4. Engineering Documentation Pack (`/docs`)

1. [01-blueprint.md](file:///Users/karthikr/Documents/OneXDeal/docs/01-blueprint.md) — Product vision, Hosur pilot scope, journeys, and success measures.
2. [02-prd.md](file:///Users/karthikr/Documents/OneXDeal/docs/02-prd.md) — Functional and non-functional requirements with acceptance criteria.
3. [03-design-system.md](file:///Users/karthikr/Documents/OneXDeal/docs/03-design-system.md) — Visual tokens (`@onexdeal/ui`), components, screens, and accessibility.
4. [04-architecture.md](file:///Users/karthikr/Documents/OneXDeal/docs/04-architecture.md) — Modular monolith architecture, provider adapters, and Hostinger KVM VPS deployment.
5. [05-database.md](file:///Users/karthikr/Documents/OneXDeal/docs/05-database.md) — Approved PostgreSQL 18 + PostGIS 3.7.x + Drizzle ORM data model.
6. [06-security.md](file:///Users/karthikr/Documents/OneXDeal/docs/06-security.md) — Google OAuth / Email security, Argon2id, RBAC, PII scrubbing, and release gates.
7. [07-code-style.md](file:///Users/karthikr/Documents/OneXDeal/docs/07-code-style.md) — TypeScript strict mode, monorepo boundaries, and API conventions.
8. [08-testing.md](file:///Users/karthikr/Documents/OneXDeal/docs/08-testing.md) — Test pyramid, critical scenarios, authorization matrix, and CI gates.
9. [09-ai-agents.md](file:///Users/karthikr/Documents/OneXDeal/docs/09-ai-agents.md) — Gemini model routing, agent roles, and mandatory human approvals.
