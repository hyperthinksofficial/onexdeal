# OneXDeal — Hostinger KVM VPS Deployment & Operations Guide (Phase 0 Baseline)

This directory contains operational documentation and bootstrap configurations for deploying OneXDeal on a **Hostinger KVM VPS** using Docker Compose, while preserving cloud portability to AWS, Azure, or GCP.

## 1. Approved Production Container Topology

- **Reverse Proxy (`caddy` / `nginx`):** Terminates HTTPS/TLS, enforces HSTS and security headers, routes `/` to `web` (`apps/web`) and `/api/v1` + `/realtime` (WebSocket upgrade) to `api` (`apps/api`).
- **Web (`apps/web`):** Next.js App Router standalone server.
- **API & Realtime (`apps/api`):** Node.js + Express + Socket.IO gateway (using in-memory adapter for single-instance deployment; Redis adapter ready when horizontally scaled).
- **Worker (`apps/api` worker entrypoint):** BullMQ background worker for media processing (`sharp` EXIF stripping & WebP conversion), transactional emails (`EmailProvider`), push notifications (`PushProvider`), and 30-day listing expiry sweeps.
- **Database (`postgres`):** `postgis/postgis:18-3.7` (PostgreSQL 18 + PostGIS 3.7.x + `pg_trgm`), bound strictly to internal Docker network (`127.0.0.1`).
- **Supporting Cache & Queue (`redis`):** `redis:7-alpine`, bound strictly to internal Docker network (`127.0.0.1`).

## 2. Hostinger KVM VPS Security Hardening Checklist

1. **Firewall (`ufw`):**
   - Default deny incoming, allow outgoing.
   - Allow `22/tcp` (or custom SSH port) with rate limiting (`ufw limit ssh`), `80/tcp` (HTTP redirect), and `443/tcp` (HTTPS).
   - Never expose PostgreSQL (`5432`) or Redis (`6379`) on public interfaces.
2. **SSH Security:**
   - Use Ed25519 SSH keys only (`PasswordAuthentication no`, `PermitRootLogin no`).
3. **Automatic Security Updates:**
   - Enable `unattended-upgrades` on Ubuntu LTS for automatic OS security patching.
4. **Encrypted Off-Site Database Backups & Restore Drills:**
   - Run daily `pg_dump --format=custom` encrypted with `age` or `gpg` and upload to an isolated off-site bucket (Cloudflare R2 / AWS S3).
   - Verify backup integrity with an automated monthly/pre-release restoration test against a disposable PostgreSQL 18 + PostGIS 3.7 container.
5. **Resource Sizing & Monitoring:**
   - Do not use the smallest VPS tier without resource verification; evaluate CPU, RAM, disk I/O, and PostgreSQL shared buffers under realistic load before final plan selection.
   - Monitor VPS CPU, RAM, disk usage, network I/O, PostgreSQL connection pool, and Redis memory usage.
