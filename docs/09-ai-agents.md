# OneXDeal AI Coding Agents and Workflow

**Gemini 4 Argon + Gemini 3.8 Flash operating model**

- Date: 17 November 2026
- Version: v1.1 - Owner-Approved Engineering Baseline
- Status: Approved for implementation

> Purpose: Defines safe, repeatable AI-assisted engineering roles, prompts, approvals and model usage for building OneXDeal.

## 1. Model usage policy

| Model            | Intended role                                                                                                                               | Availability note                                                                                                                                                                         |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Gemini 3.8 Flash | Primary implementation model for feature coding, test generation, refactoring, documentation and routine code review.                       | Google AI Studio lists model ID `gemini-3.8-flash` as stable; verify current limits/pricing in the account before use.                                                                    |
| Gemini 4 Argon   | High-reasoning reviewer for architecture decisions, complex debugging, security threat reviews, major migrations and final design critique. | Google announced phased rollout through its Fairwind Program before broader developer availability. Do not make the workflow depend on Argon until the account/API explicitly has access. |

These models are coding assistants, not trusted authorities. All outputs must be verified by tests, source review and human approval. Do not place Gemini API keys inside the OneXDeal mobile or browser application.

## 2. Agent roles (use only when valuable)

| Agent                    | Primary responsibilities                                                                                            | Required output                                                |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| Orchestrator / Tech Lead | Reads all docs, breaks work into tasks, identifies dependencies, prevents conflicting edits and requests approvals. | Task plan, file ownership map, risks and acceptance checklist. |
| Product Analyst          | Clarifies edge cases and checks scope against PRD.                                                                  | User stories, acceptance criteria, updated requirement trace.  |
| Solution Architect       | Reviews module boundaries, API contracts, data flow and migration impact.                                           | Decision record, sequence/data-flow notes and trade-offs.      |
| Mobile Engineer          | Implements React Native (`apps/mobile`) screens, navigation, forms, native permissions and app state.               | Code, component tests, device checklist and screenshots.       |
| Web Engineer             | Implements Next.js (`apps/web`) public web and protected admin UX.                                                  | Code, Playwright tests, accessibility and responsive evidence. |
| Backend Engineer         | Implements Express (`apps/api`) modules, REST, Socket.IO chat, validation and provider adapters.                    | Code, OpenAPI changes, integration tests and migration notes.  |
| Database Engineer        | Reviews PostgreSQL 18 + PostGIS 3.7 schema, Drizzle migrations, indexes, constraints and query plans.               | SQL migration, Drizzle schema, query test and rollback plan.   |
| Security Reviewer        | Threat-models change, checks Google OAuth / Email auth, RBAC, secrets, privacy and abuse controls.                  | Findings by severity, remediation and residual risks.          |
| QA Engineer              | Creates unit, integration, E2E, regression and performance coverage.                                                | Test plan, automated tests, execution evidence and defects.    |
| DevOps Engineer          | Prepares GitHub Actions CI/CD, Hostinger KVM VPS Docker Compose, observability, backups and rollback.               | Infrastructure code, deployment runbook and recovery evidence. |

## 3. Standard task workflow

1. Read `AGENTS.md` and the relevant `/docs/*.md` files before editing.
2. State the task, scope, assumptions, files likely to change, dependencies and acceptance criteria.
3. Check existing patterns in `apps/*` and `packages/*`; do not invent a parallel framework or duplicate module.
4. Implement the smallest vertical slice. Keep API, UI and database contract changes aligned in `@onexdeal/types`.
5. Add/modify tests, update documentation and run `pnpm lint`, `pnpm typecheck`, `pnpm test` and `pnpm build`.
6. Review diff for secrets, authorization, privacy, accessibility, performance and unintended files.
7. Provide the required completion report.
8. Wait for human reviewer approval before proceeding to the next major phase or running production/destructive actions.

## 4. Root AGENTS.md rules

- Treat this documentation pack as the product and engineering source of truth.
- Do not silently change the approved stack (PostgreSQL 18 + PostGIS 3.7 + `pg_trgm` + Drizzle ORM, Redis, Modular Monolith, Hostinger KVM VPS, Google OAuth 2.0 + Email/Password verification).
- Do not implement SMS OTP, WhatsApp OTP, MSG91, 2Factor.in, or Razorpay in MVP.
- Do not create microservices for MVP without a written scaling/operational justification and owner approval.
- Do not run production commands, mutate production data, rotate real credentials, create paid cloud resources, publish app builds or merge protected branches without explicit human approval.
- Never disable tests, lint, type checks or security checks to make a task pass.

## 5. Agent completion report template

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

---

This document is part of the OneXDeal engineering documentation set. Update this document through a reviewed change; do not let an AI agent silently change product or architecture decisions.
