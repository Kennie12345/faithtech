# Database Migrations: Version Control for Schema

**Document Type:** Core (Stable)
**Stability Level:** Stable
**Audience:** All engineers
**Last Updated:** 2025-11-05
**Dependencies:** None (foundational)

---

## Purpose

This document defines how we manage database schema changes using Supabase migrations.

**Key Principle:** Schema is code. All changes go through migration files, never manual SQL in Supabase Studio.

---

## Migration Workflow

```
┌─────────────────────────────────┐
│ 1. Developer writes migration   │
│    supabase/migrations/XXX.sql  │
└─────────────┬───────────────────┘
              │
              ▼
┌─────────────────────────────────┐
│ 2. Apply locally                │
│    supabase db reset            │
└─────────────┬───────────────────┘
              │
              ▼
┌─────────────────────────────────┐
│ 3. Test changes                 │
│    Run app, verify schema       │
└─────────────┬───────────────────┘
              │
              ▼
┌─────────────────────────────────┐
│ 4. Commit migration to Git      │
│    git add supabase/migrations/ │
└─────────────┬───────────────────┘
              │
              ▼
┌─────────────────────────────────┐
│ 5. Deploy to production         │
│    Vercel build runs migrations │
└─────────────────────────────────┘
```

---

## File Structure

```
supabase/
├── config.toml                  # Supabase project config
├── seed.sql                     # Test data for local development
└── migrations/
    ├── 20250101000000_initial_schema.sql
    ├── 20250102000000_create_cities.sql
    ├── 20250103000000_create_profiles.sql
    ├── 20250104000000_create_user_city_roles.sql
    ├── 20250105000000_create_groups.sql
    ├── 20250106000000_rls_core_tables.sql
    └── ... (feature migrations follow)
```

**Naming Convention:**
- `YYYYMMDDHHMMSS_description.sql`
- Timestamp ensures order
- Description is human-readable (use snake_case)

---

## Creating Migrations

### Method 1: Supabase CLI (Recommended)

```bash
# Generate timestamped migration file
supabase migration new create_cities

# File created: supabase/migrations/20250102123456_create_cities.sql
```

**Edit the file:**

```sql
-- supabase/migrations/20250102123456_create_cities.sql

-- Create cities table
CREATE TABLE cities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes
CREATE UNIQUE INDEX cities_slug_idx ON cities(slug);

-- Enable RLS (policies added in separate migration)
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;
```

### Method 2: Manual Creation

```bash
# Create file manually
touch supabase/migrations/$(date +%Y%m%d%H%M%S)_create_cities.sql

# Edit file...
```

---

## Applying Migrations

### Local Development

```bash
# Reset database (drops all tables, re-runs ALL migrations)
supabase db reset

# OR apply new migrations only (preserves data)
supabase migration up
```

**When to use `reset` vs. `up`:**
- `reset`: Clean slate, useful during active development
- `up`: Production-like (preserves data), test migration on existing data

---

### Production (Automatic)

When you push to `main` branch:

1. Vercel build triggers
2. Vercel runs `npm run build`
3. Our build script includes: `supabase db push` (applies new migrations)
4. Deployment completes

**⚠️ Critical:** Migrations run automatically. Test locally first!

---

## Migration Best Practices

### 1. One Concern Per Migration

```sql
-- ✅ Good: One table per migration
-- 20250102_create_cities.sql
CREATE TABLE cities (...);

-- 20250103_create_profiles.sql
CREATE TABLE profiles (...);

-- ❌ Bad: Multiple unrelated changes
-- 20250102_create_everything.sql
CREATE TABLE cities (...);
CREATE TABLE profiles (...);
CREATE TABLE events (...);  -- Belongs in separate migration
```

**Why:** Easier to revert, debug, and understand history.

---

### 2. Idempotent Migrations

```sql
-- ✅ Good: Can run multiple times safely
CREATE TABLE IF NOT EXISTS cities (...);

-- ❌ Bad: Fails if run twice
CREATE TABLE cities (...);  -- ERROR: table already exists
```

**Why:** Prevents errors if migration runs twice (e.g., during rollback/retry).

---

### 3. Include Rollback Instructions

```sql
-- Migration: 20250102_create_cities.sql

-- Up Migration
CREATE TABLE cities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL
);

-- Rollback (commented out, for reference)
-- DROP TABLE cities;
```

**Why:** Documents how to undo changes if needed.

---

### 4. Data Migrations Separate from Schema

```sql
-- ✅ Good: Schema migration
-- 20250102_create_cities.sql
CREATE TABLE cities (...);

-- ✅ Good: Data migration
-- 20250103_seed_initial_cities.sql
INSERT INTO cities (name, slug) VALUES
  ('FaithTech Adelaide', 'adelaide'),
  ('FaithTech Sydney', 'sydney');

-- ❌ Bad: Mixed schema + data
CREATE TABLE cities (...);
INSERT INTO cities (...);  -- Makes rollback complex
```

---

### 5. Test with Seed Data

**File:** `supabase/seed.sql`

```sql
-- This file runs after migrations in local development
-- Use for realistic test data

-- Create test super admin
INSERT INTO auth.users (id, email) VALUES
  ('00000000-0000-0000-0000-000000000001', 'admin@faithtech.test');

INSERT INTO profiles (id, display_name) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Test Admin');

INSERT INTO user_city_roles (user_id, city_id, role) VALUES
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'super_admin');

-- Create test cities
INSERT INTO cities (name, slug) VALUES
  ('Test City Adelaide', 'adelaide-test'),
  ('Test City Sydney', 'sydney-test');
```

**Run with:**
```bash
supabase db reset  # Runs migrations + seed.sql
```

---

## Migration Order

**Core dependencies:**

```
001_initial_schema.sql       (extensions, types)
  ↓
002_create_cities.sql
  ↓
003_create_profiles.sql
  ↓
004_create_user_city_roles.sql (depends on cities + profiles)
  ↓
005_create_groups.sql          (depends on cities)
  ↓
006_rls_core_tables.sql        (depends on all above)
  ↓
007+ feature migrations        (events, blog, etc.)
```

**Rule:** Features can depend on core, but never on each other.

---

## Common Migration Patterns

### Adding a Table

```sql
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id UUID NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX events_city_id_idx ON events(city_id);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;
```

---

### Adding a Column

```sql
ALTER TABLE cities
  ADD COLUMN timezone TEXT DEFAULT 'Australia/Adelaide';
```

**Note:** Include default value to avoid breaking existing rows.

---

### Modifying a Column

```sql
-- Rename column
ALTER TABLE cities
  RENAME COLUMN about TO about_markdown;

-- Change column type
ALTER TABLE cities
  ALTER COLUMN slug TYPE VARCHAR(100);
```

**⚠️ Warning:** Type changes can fail if existing data incompatible.

---

### Dropping a Column

```sql
-- Add migration comment explaining why
-- We no longer need 'legacy_id' after migration to UUIDs
ALTER TABLE cities
  DROP COLUMN legacy_id;
```

**Best Practice:** Don't drop columns immediately. Mark as deprecated first, drop in later migration.

---

### Adding RLS Policy

```sql
CREATE POLICY "city_isolation_select" ON events
  FOR SELECT
  USING (city_id = auth.current_city());
```

---

### Creating Functions

```sql
CREATE OR REPLACE FUNCTION auth.current_city()
RETURNS UUID AS $$
  SELECT city_id FROM user_city_roles
  WHERE user_id = auth.uid()
  LIMIT 1;
$$ LANGUAGE SQL STABLE;
```

---

## Handling Migration Failures

### Local Failure

```bash
# Migration fails during `supabase db reset`
supabase db reset

# Error: syntax error at line 15

# Fix the migration file, then re-run
supabase db reset
```

---

### Production Failure

**Scenario:** Migration fails during Vercel deployment.

**What happens:**
1. Build fails (migration error)
2. Deployment does NOT go live (old version still running)
3. Database may be in partial state

**Recovery:**

```bash
# Option 1: Fix migration, push again
git commit --amend  # Fix migration file
git push --force-with-lease

# Option 2: Rollback migration (manual)
# SSH into Supabase or use Studio SQL Editor
# Run rollback SQL (from migration comments)
```

**Prevention:**
- Always test migrations locally with `supabase db reset`
- Test with production-like data (use seed.sql)
- Have rollback SQL ready

---

## Versioning Strategy

### Development Workflow

```bash
# Feature branch
git checkout -b feature/events

# Create migration
supabase migration new create_events
# Edit migration file...

# Test locally
supabase db reset

# Commit
git add supabase/migrations/
git commit -m "Add events table"

# Merge to main
git push origin feature/events
# Create PR, review, merge
```

---

### Hotfix Workflow

```bash
# Hotfix: Production issue requires immediate migration

# Create migration with current timestamp
supabase migration new hotfix_add_missing_index

# Test locally
supabase db reset

# Merge directly to main (skip PR for urgency)
git add supabase/migrations/
git commit -m "Hotfix: Add missing index on events.city_id"
git push origin main

# Vercel auto-deploys
```

---

## Atomic Implementation Units

### Unit 1: Initial Schema
- **File:** `supabase/migrations/001_initial_schema.sql`
- **Contents:**
  ```sql
  CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
  CREATE TYPE user_role AS ENUM ('super_admin', 'city_admin', 'member');
  ```
- **Acceptance Criteria:** Migrations run without errors locally

### Unit 2: Core Tables
- **Files:** `002_cities.sql`, `003_profiles.sql`, `004_user_city_roles.sql`, `005_groups.sql`
- **Acceptance Criteria:** All tables created, foreign keys work

### Unit 3: RLS Policies
- **File:** `006_rls_core_tables.sql`
- **Acceptance Criteria:** Policies applied, tested with SET ROLE

### Unit 4: Seed Data
- **File:** `supabase/seed.sql`
- **Acceptance Criteria:** Test admin + cities created on `db reset`

---

## Testing Checklist

- [ ] Migration runs without errors (`supabase db reset`)
- [ ] Rollback SQL tested (commented in migration)
- [ ] Seed data works with new schema
- [ ] RLS policies applied correctly
- [ ] Indexes created for foreign keys
- [ ] Migration committed to Git

---

## Troubleshooting

**Issue:** "Migration XXX already applied"
- **Cause:** Running `migration up` after migration already ran
- **Fix:** This is normal. Supabase tracks applied migrations.

**Issue:** "Syntax error in migration"
- **Cause:** Typo in SQL
- **Fix:** Edit migration file, run `supabase db reset` again

**Issue:** "Migration fails in production but works locally"
- **Cause:** Production database has data that local doesn't
- **Fix:** Test with realistic seed data locally

---

## Next Steps

- Read [05-api-contracts.md](05-api-contracts.md) for Event Bus implementation
- Start creating feature migrations (see `docs/features/*.md`)
