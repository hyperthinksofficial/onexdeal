-- =============================================================================
-- OneXDeal — PostgreSQL 18 + PostGIS 3.7.x Local Bootstrap Script
-- Note: Production schema and extensions are also enforced via versioned
-- Drizzle SQL migrations in Phase 1+.
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
