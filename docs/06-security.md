# OneXDeal Security and Privacy Standard

**Security baseline, threat controls and operational response**

- Date: 17 November 2026
- Version: v1.1 - Owner-Approved Engineering Baseline
- Status: Approved for implementation

> Purpose: Defines minimum security practices for the mobile apps, web app, APIs, authentication, data and Hostinger KVM VPS deployment.

> Decision labels: **Approved** = confirmed by project owner; **Deferred** = intentionally outside MVP.

## 1. Security objectives and standards

Treat the mobile client, browser and user-supplied content as untrusted. Enforce all access, email verification, and business rules on the server. Use OWASP ASVS 5.0 as the web/API verification baseline and OWASP MASVS as the mobile application security baseline. Security review is a release gate, not a final-week activity.

- Confidentiality: protect user emails, password hashes, verification/session tokens, private messages, optional phone numbers, precise location and admin data.
- Integrity: enforce listing ownership, email verification before listing publication, moderation states, message membership and RBAC (`user`, `moderator`, `admin`).
- Availability: rate-limit abuse via Redis, protect VPS infrastructure and maintain tested off-site backups.
- Privacy: collect minimum data, explain purpose and expose only approximate public location.

## 2. Trust boundaries and threats

| Threat                                                | Required controls                                                                                                                                                                                                 |
| ----------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Credential stuffing / brute force / email enumeration | Argon2id password hashing, Redis rate limits on login/register/resend/reset, generic anti-enumeration responses on registration & password reset, account lock/backoff on repeated failures.                      |
| Account takeover via OAuth / account linking          | Server-side Google ID token validation (signature, issuer, audience, expiry, `email_verified = true`); safe Google/email account linking; never auto-merge with an unverified account without proof of ownership. |
| Verification / reset token compromise                 | Cryptographically random, single-use, time-limited email verification and password reset tokens; store only cryptographic hashes (`token_hash`) in the database; invalidate existing sessions on password reset.  |
| Privilege escalation                                  | Default all sign-ups to `role = 'user'`; never accept `role` in client registration/profile payloads; enforce server-side RBAC on all `moderator` and `admin` endpoints.                                          |
| Unverified spam listings                              | Block unverified email/password accounts from publishing listings; enforce mandatory `pending_review` moderation on new listings and material edits (`title`, `description`, photos).                             |
| IDOR / broken authorization                           | Check object ownership and role on every API operation; test cross-user access for listings, chats, reports and media.                                                                                            |
| Malicious or privacy-leaking uploads                  | Signed upload intent to Cloudflare R2 (`StorageProvider`), size/type allowlist, magic-byte validation, image decode/re-encode, EXIF/GPS metadata stripping, and safe WebP derivatives.                            |
| Message harassment / spam                             | Member-only chat, user block, Redis message rate limits, report flow, and transactional unread counter integrity.                                                                                                 |
| Location exposure                                     | Curated locality centroids and approximate public coordinates; never return raw device GPS coordinates or home addresses in API responses.                                                                        |
| Server compromise                                     | Hostinger KVM VPS firewall, SSH key-only access, automatic security updates, non-root containers, isolated secrets, encrypted off-site backups and incident plan.                                                 |

## 3. Identity, authentication and access control (Approved MVP)

### A. Supported authentication methods

Only two authentication methods are supported in the MVP:

1. **Google Sign-In (OAuth 2.0):**
   - Validate Google ID tokens on the backend: verify cryptographic signature against Google's public keys, `iss` (`https://accounts.google.com` or `accounts.google.com`), `aud` (configured Google OAuth client IDs), `exp`, and require `email_verified === true`.
   - Keep Google OAuth client secrets strictly in server-side environment variables.
2. **Email and Password with Email Verification:**
   - Never store plaintext passwords; hash passwords using **Argon2id** with OWASP-recommended memory, iteration, and parallelism parameters.
   - Require email verification before allowing an email/password user to publish listings.
   - Generate high-entropy (minimum 256-bit) single-use, time-limited tokens for email verification and password reset; store only their SHA-256 hash (`token_hash`) in `verification_tokens`.
   - Enforce Redis rate limits and resend cooldowns on registration, login, verification email resend, and forgot-password endpoints.
   - Prevent email enumeration: forgot-password and resend-verification responses must not reveal whether an email address exists, and registration conflicts must be handled safely.

### B. Safe Google and Email account linking

- Do not allow an attacker to pre-register an unverified email/password account and hijack a victim's subsequent Google Sign-In (or vice versa).
- If a user signs in with Google (`email_verified = true`) for an email that matches an existing **unverified** email/password account, either clear the unverified password hash / require password re-setup or require explicit verification before linking credentials.
- If a user with an already verified email signs in with a verified Google account matching the same email, link the `google` identity in `auth_identities` and record the event.

### C. Sessions and RBAC

- Access token lifetime target: 10–15 minutes. Refresh tokens are cryptographically random, rotated on use, stored hashed server-side (`refresh_sessions.token_hash`), and revocable per device.
- Mobile (`apps/mobile`): store refresh/session secrets using OS-backed secure storage (iOS Keychain / Android Keystore via `expo-secure-store`). Never use `AsyncStorage` for authentication secrets.
- Web (`apps/web`): use `Secure`, `HttpOnly`, `SameSite` cookies with CSRF protection for state-changing requests.
- Enforce both role-based access control (`user`, `moderator`, `admin`) and object-level ownership on the backend.

### D. Deferred SMS / WhatsApp OTP & Phone Privacy

- SMS OTP and WhatsApp OTP are **not** used in MVP.
- Phone number is optional and nullable on user profiles and must not be exposed publicly by default.
- When phone verification is added in a future phase, normalize to E.164, use keyed HMAC-SHA256 for lookup/uniqueness, and encrypt retained phone numbers at rest.

## 4. API, web and mobile controls

- TLS only; redirect HTTP to HTTPS; use HSTS on web.
- Validate every request with Zod schemas from `@onexdeal/types`; reject unexpected fields and unsafe file metadata.
- Use parameterised SQL via Drizzle ORM; never interpolate user strings into SQL, shell commands or file paths.
- Apply CORS allowlists, secure headers (`helmet`), Content Security Policy and CSRF protection where cookie auth is used.
- Rate limit auth, verification resend, password reset, listing creation, search, chat send, reports, uploads and admin actions using Redis.
- Never embed Google OAuth client secrets, database URLs, R2 secret keys, email API keys or Sentry internal tokens in mobile/web client bundles.

## 5. Media and user-generated content

- Client requests an upload intent from the API; API verifies authenticated + verified user, quota, and allowed MIME type (`image/jpeg`, `image/png`, `image/webp`).
- Upload to private/quarantine prefix in Cloudflare R2 (`StorageProvider`) using a short-lived presigned URL.
- Backend worker validates magic bytes, image dimensions and byte size, strips all EXIF/GPS metadata, and re-encodes to safe WebP derivatives before serving via CDN.
- Never allow SVG, HTML or executable uploads for listing images or avatars.

## 6. Logging, monitoring and secrets (Sentry & Structured Logs)

- Use structured JSON logs with a request/correlation ID and automatic PII scrubbing (`@onexdeal/utils`).
- Configure **Sentry** with strict PII scrubbing filters (`beforeSend`).
- **Never** log or send to Sentry: plaintext passwords, password hashes, access/refresh tokens, email verification tokens, password reset tokens, private chat message bodies, or raw precise GPS coordinates.
- Store secrets in server-side environment variables; keep development, staging and production configurations strictly separate.

## 7. Hostinger KVM VPS deployment security

- [ ] VPS firewall (`ufw`) exposes only ports `80`/`443` (and hardened SSH); PostgreSQL 18 and Redis are bound strictly to the internal Docker network.
- [ ] SSH uses Ed25519/RSA keys, disables password authentication and root login; enable unattended security updates.
- [ ] Run application containers as non-root users; pin base images (`postgis/postgis:18-3.7`, `redis:7-alpine`, `node:22-alpine`).
- [ ] Configure encrypted off-site PostgreSQL backups to object storage and perform regular restoration tests.

## 8. Security release gates

- No open critical/high vulnerabilities in production dependencies or security scan results without documented exception.
- Authorization tests cover email verification enforcement, role separation (`user` vs `moderator` vs `admin`), listing ownership, chat membership, block state and media access.
- Account linking, password reset, and token hashing are verified by automated integration tests.

---

This document is part of the OneXDeal engineering documentation set. Update this document through a reviewed change; do not let an AI agent silently change product or architecture decisions.
