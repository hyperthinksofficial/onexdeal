# OneXDeal Engineering Code Style

**TypeScript, monorepo conventions and API contracts**

- Date: 17 November 2026
- Version: v1.1 - Owner-Approved Engineering Baseline
- Status: Approved for implementation

> Purpose: Provides consistent implementation rules for human developers and Gemini coding agents across the OneXDeal monorepo.

## 1. Core rules

- TypeScript strict mode (`"strict": true`) across `apps/mobile`, `apps/web`, `apps/api` and all `packages/*`. Avoid `any`; use `unknown` and narrow safely.
- One feature/module per domain boundary; UI components do not own business rules or direct database logic.
- Validate at trust boundaries: API request, environment variables, external webhooks, OAuth tokens, uploaded media metadata and persisted state transitions.
- Prefer boring, readable solutions to clever abstractions. Keep functions small and side effects explicit.
- No hard-coded secrets, production IDs, user data or environment-specific URLs.
- All code must pass `pnpm lint`, `pnpm typecheck`, `pnpm test` and `pnpm build` before merge.

## 2. Naming conventions

| Artifact                                   | Convention                                                                    | Example                                                 |
| ------------------------------------------ | ----------------------------------------------------------------------------- | ------------------------------------------------------- |
| React component / type / class / interface | PascalCase                                                                    | `ListingCard`, `CreateListingInput`, `StorageProvider`  |
| Variable / function / hook                 | camelCase                                                                     | `listingId`, `useListings`, `formatPricePaise`          |
| Constant                                   | UPPER_SNAKE_CASE for true constants                                           | `MAX_LISTING_IMAGES`, `SEARCH_RADIUS_KM_OPTIONS`        |
| Database table / column                    | snake_case                                                                    | `listing_images`, `is_negotiable`, `buyer_unread_count` |
| API JSON property                          | camelCase                                                                     | `publishedAt`, `isNegotiable`, `buyerUnreadCount`       |
| File                                       | Feature-oriented; component files PascalCase, utility/module files kebab-case | `ListingCard.tsx`, `price-formatter.ts`                 |
| Environment variable                       | UPPER_SNAKE_CASE                                                              | `DATABASE_URL`, `GOOGLE_CLIENT_ID`                      |

## 3. Monorepo and package boundaries

```text
apps/mobile/       # Expo React Native app: screens, navigation, native integrations
apps/web/          # Next.js App Router: public pages and protected admin routes
apps/api/          # Node.js + Express: routes, middleware, domain modules, Socket.IO, BullMQ worker
packages/ui/       # @onexdeal/ui: Design tokens, theme helpers and shared UI primitives
packages/types/    # @onexdeal/types: Shared Zod schemas, DTOs, API envelopes and provider interfaces
packages/utils/    # @onexdeal/utils: Pure utilities (price/paise formatting, geo validation, PII scrubbing)
packages/config/   # @onexdeal/config: Shared TypeScript, ESLint and Prettier configurations
```

- Apps (`apps/mobile`, `apps/web`, `apps/api`) depend on `@onexdeal/ui`, `@onexdeal/types`, `@onexdeal/utils`, and `@onexdeal/config`.
- Shared packages (`packages/*`) must never import from `apps/*`.
- Pin `pnpm` and Node.js versions in `package.json` (`engines` and `packageManager`); commit `pnpm-lock.yaml`; use Turborepo workspace commands consistently.

## 4. Layering rules (`apps/api`)

| Layer              | Allowed responsibility                                                                                                | Must not do                                                      |
| ------------------ | --------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| Route / Controller | Parse & validate request with Zod, invoke service/use-case, return standard API envelope                              | Contain business rules, Drizzle/SQL queries, or vendor SDK calls |
| Service / Use case | Business policy, moderation/expiry transitions, email verification checks, orchestration                              | Know about Express `req`/`res` objects or raw SQL syntax         |
| Repository         | Persist/query domain data via Drizzle ORM; encapsulate PostGIS spatial queries (`geography(Point, 4326)`)             | Make external HTTP calls or render UI                            |
| Provider adapter   | Implement `StorageProvider` (R2/S3), `EmailProvider` (SMTP/Mailpit/API), `PushProvider` (Expo Push), `SearchProvider` | Leak vendor SDK types into domain services                       |
| UI component       | Render props/state and emit user intent                                                                               | Call database or bypass API authorization                        |

## 5. API and error conventions

- Base path `/api/v1`; plural resource nouns; use HTTP status codes consistently.
- Validate params/query/body using Zod schemas from `@onexdeal/types`; infer TypeScript types with `z.infer<typeof Schema>`.
- Success shape: `{ data, meta? }`. Error shape: `{ error: { code, message, details?, requestId } }`.
- Use stable machine-readable error codes; never expose stack traces in production.
- Use cursor pagination for changing feeds; cap page size server-side.
- Price rules: store and transmit money as integer paise (`pricePaise >= 0`); format `0` as `"Free"` using `@onexdeal/utils`; disallow `isNegotiable: true` when `pricePaise === 0`.

## 6. React Native (`apps/mobile`) and Next.js (`apps/web`) patterns

- React Native: feature folders; Expo Router / structured navigation; OS-backed secure storage (`expo-secure-store`) for session tokens.
- Server state: TanStack Query; local transient UI state: React state or small store.
- Forms: React Hook Form + Zod resolver (`@onexdeal/types`); server remains authoritative.
- Next.js: App Router; Server Components by default for public/read-only pages; Client Components only for interactive UI islands.
- Admin pages must enforce server-verified sessions and `moderator`/`admin` role checks on every request and API action.

## 7. Backend patterns (`apps/api`)

- Express router -> controller -> service/use-case -> repository / provider adapter.
- Use PostgreSQL transactions (`db.transaction(...)`) whenever mutating multiple tables (e.g., persisting a chat message and updating `conversations.buyer_unread_count` / `seller_unread_count`, or recording a moderation decision and inserting into `listing_moderation_logs`).
- Keep Socket.IO using the standard in-memory adapter in MVP; keep the initialization modular so `@socket.io/redis-adapter` can be enabled via configuration when scaling horizontally.
- Central error middleware maps known domain/validation errors to standard API error envelopes and logs unexpected failures with `requestId` and PII scrubbing.

## 8. Git, PR and review

- Branch format: `feat/short-description`, `fix/short-description`, `chore/short-description`, `docs/short-description`.
- Commit format: Conventional Commits (`feat`, `fix`, `refactor`, `test`, `docs`, `chore`, `perf`, `security`).
- Keep PRs focused and single-purpose.
- Require human review and approval for authentication, database migrations, security policies, infrastructure, and production deployments.

## 9. Quality and prohibited patterns

- [ ] No `any` without a documented reason and narrow scope.
- [ ] No `console.log` of sensitive data; use structured logger with PII scrubbing.
- [ ] No floating-point numbers for money; always use integer paise (`bigint` / safe integer paise).
- [ ] No SMS OTP, WhatsApp OTP, MSG91, or 2Factor.in code in the MVP codebase.
- [ ] No secret values in source code, logs, screenshots or AI prompt history.
- [ ] No cross-module database writes that bypass owning module services.

## 10. Required checks

- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm build`

---

This document is part of the OneXDeal engineering documentation set. Update this document through a reviewed change; do not let an AI agent silently change product or architecture decisions.
