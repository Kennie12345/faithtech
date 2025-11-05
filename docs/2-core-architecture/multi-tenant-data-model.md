# Core Data Model: Multi-Tenant Foundation

**Document Type:** Core (Stable)
**Stability Level:** Stable - Changes rarely
**Audience:** All engineers
**Last Updated:** 2025-11-05
**Dependencies:** [architectural-principles.md](../1-vision/architectural-principles.md)

---

## Purpose

This document defines the **core entities** that ALL features depend on. These tables rarely change and form the foundation of the multi-tenant architecture.

**Scope:** Core entities only (`cities`, `users`, `user_city_roles`, `groups`, `group_members`)

**Out of Scope:** Feature-specific tables (events, blog posts, etc.) are defined in their respective feature docs.

---

## Design Principles

1. **Multi-Tenancy First**: Every user-generated entity belongs to a city
2. **Many-to-Many Relationships**: Users can belong to multiple cities with different roles
3. **Normalized Schema**: Avoid data duplication, use foreign keys
4. **Soft Deletes**: Critical entities (users, cities) use `deleted_at` instead of hard deletes
5. **Audit Trails**: `created_at` and `updated_at` on all tables

---

## Entity Relationship Diagram

```
┌─────────────┐
│   cities    │
└──────┬──────┘
       │
       │ 1:N
       │
┌──────▼──────────────┐         ┌─────────────────┐
│ user_city_roles     │ N:1     │     users       │
│                     ├────────►│  (Supabase Auth)│
│ - user_id           │         └─────────────────┘
│ - city_id           │
│ - role (enum)       │
└──────┬──────────────┘
       │
       │ 1:N
       │
┌──────▼──────┐
│   groups    │ (e.g., "Tech Industry", "Students")
└──────┬──────┘
       │
       │ 1:N
       │
┌──────▼───────────┐
│  group_members   │
│                  │
│ - group_id       │
│ - user_id        │
└──────────────────┘
```

---

## Core Entities

### 1. `cities`

Represents a FaithTech city or community (e.g., Adelaide, Sydney, Melbourne).

```sql
CREATE TABLE cities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identity
  name TEXT NOT NULL,                    -- "FaithTech Adelaide"
  slug TEXT UNIQUE NOT NULL,             -- "adelaide" (for URLs)

  -- Branding
  about_markdown TEXT,                   -- Rich text description
  logo_url TEXT,                         -- Supabase Storage URL
  hero_image_url TEXT,                   -- Homepage hero image
  accent_color TEXT DEFAULT '#3B82F6',   -- Tailwind blue-500 (from curated list)

  -- Metadata
  is_active BOOLEAN DEFAULT TRUE,        -- Allows regional admin to "pause" a city
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ                 -- Soft delete
);

-- Indexes
CREATE UNIQUE INDEX cities_slug_unique ON cities(slug) WHERE deleted_at IS NULL;
CREATE INDEX cities_active ON cities(is_active) WHERE deleted_at IS NULL;
```

**Business Rules:**
- `slug` must be URL-safe (lowercase, no spaces)
- Only Super Admins can create/delete cities
- Soft delete prevents breaking foreign keys

**Example Data:**
```sql
INSERT INTO cities (name, slug, about_markdown) VALUES
  ('FaithTech Adelaide', 'adelaide', 'Connecting Christian technologists...'),
  ('FaithTech Sydney', 'sydney', '...'),
  ('FaithTech Melbourne', 'melbourne', '...');
```

---

### 2. `users` (Supabase Auth)

User accounts are managed by Supabase Auth. We extend with a `profiles` table for additional data.

**Note:** Supabase Auth stores users in `auth.users` (not directly accessible via RLS). We use `public.profiles` for public data.

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Public Profile
  display_name TEXT,                     -- "John Doe"
  avatar_url TEXT,                       -- Supabase Storage URL
  bio TEXT,                              -- Short bio

  -- Contact (opt-in visibility)
  linkedin_url TEXT,
  github_url TEXT,
  website_url TEXT,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: Users can update their own profile, everyone can read
CREATE POLICY "users_update_own_profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "profiles_public_read" ON profiles
  FOR SELECT USING (TRUE);
```

**Business Rules:**
- Profile is created automatically when user signs up (via Supabase trigger)
- Email is stored in `auth.users` (not duplicated here)

---

### 3. `user_city_roles`

Many-to-many relationship: A user can belong to multiple cities with different roles.

```sql
CREATE TYPE user_role AS ENUM ('super_admin', 'city_admin', 'member');

CREATE TABLE user_city_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  city_id UUID NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'member',

  -- Metadata
  joined_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, city_id)  -- User can only have ONE role per city
);

-- Indexes
CREATE INDEX user_city_roles_user_idx ON user_city_roles(user_id);
CREATE INDEX user_city_roles_city_idx ON user_city_roles(city_id);
CREATE INDEX user_city_roles_role_idx ON user_city_roles(role);
```

**Role Definitions:**

| Role | Capabilities | Scope |
|------|-------------|-------|
| `super_admin` | Create cities, assign city admins, view all data (read-only) | Global (all cities) |
| `city_admin` | Manage city settings, approve members, CRUD features (events, blog) | Single city |
| `member` | RSVP to events, comment on blog, submit projects | Single city |

**Business Rules:**
- `super_admin` role is city-agnostic (they have a special city `id = '00000000-0000-0000-0000-000000000000'`)
- Users must be explicitly granted `city_admin` role (no self-promotion)
- First user to set up the system becomes `super_admin`

**Example Data:**
```sql
-- Alice is super admin
INSERT INTO user_city_roles (user_id, city_id, role) VALUES
  ('uuid-alice', '00000000-0000-0000-0000-000000000000', 'super_admin');

-- Bob is city admin for Adelaide
INSERT INTO user_city_roles (user_id, city_id, role) VALUES
  ('uuid-bob', 'uuid-adelaide', 'city_admin');

-- Charlie is member of both Adelaide and Sydney
INSERT INTO user_city_roles (user_id, city_id, role) VALUES
  ('uuid-charlie', 'uuid-adelaide', 'member'),
  ('uuid-charlie', 'uuid-sydney', 'member');
```

---

### 4. `groups`

Optional community groups within a city (e.g., "Tech Industry", "Finance Professionals", "Students").

**Use Cases:**
- Events can target specific groups ("Invite Finance group to this event")
- Newsletter can segment by group
- Member directory can filter by group

```sql
CREATE TABLE groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id UUID NOT NULL REFERENCES cities(id) ON DELETE CASCADE,

  -- Identity
  name TEXT NOT NULL,                    -- "Tech Industry Club"
  description TEXT,

  -- Visibility
  is_public BOOLEAN DEFAULT TRUE,        -- Public groups visible to all, private require invite

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(city_id, name)  -- Group names unique per city
);

-- Indexes
CREATE INDEX groups_city_idx ON groups(city_id);
```

**Business Rules:**
- Groups are city-scoped (Adelaide's "Tech Industry" is separate from Sydney's)
- City admins can create groups
- Public groups: Anyone can join. Private groups: Invite-only.

---

### 5. `group_members`

Many-to-many: Users can belong to multiple groups.

```sql
CREATE TABLE group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Metadata
  joined_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(group_id, user_id)
);

-- Indexes
CREATE INDEX group_members_group_idx ON group_members(group_id);
CREATE INDEX group_members_user_idx ON group_members(user_id);
```

**Business Rules:**
- Users can only join groups in cities they're members of (enforced by RLS)
- City admins can add users to groups

---

## Helper Functions

### `auth.current_city()`

Returns the city_id of the currently authenticated user based on request context.

```sql
CREATE OR REPLACE FUNCTION auth.current_city()
RETURNS UUID AS $$
  SELECT city_id FROM user_city_roles
  WHERE user_id = auth.uid()
  LIMIT 1;  -- For multi-city users, app sets context
$$ LANGUAGE SQL STABLE;
```

**Note:** For users in multiple cities, the app sets a session variable (e.g., `SET LOCAL app.city_id = 'uuid-adelaide'`) before queries.

---

### `auth.user_role(city_id UUID)`

Returns the user's role in a specific city.

```sql
CREATE OR REPLACE FUNCTION auth.user_role(city_id UUID)
RETURNS user_role AS $$
  SELECT role FROM user_city_roles
  WHERE user_id = auth.uid() AND city_id = $1;
$$ LANGUAGE SQL STABLE;
```

---

## Data Integrity Rules

1. **Cascade Deletes**: When a city is deleted, all related data (groups, user_city_roles) cascade
2. **Soft Deletes**: Cities use `deleted_at` to preserve historical data
3. **Unique Constraints**: Prevent duplicate slugs, duplicate group names per city
4. **Foreign Keys**: Enforce referential integrity (can't create group without valid city)

---

## Multi-City User Workflow

**Scenario:** Alice is a member of Adelaide and Sydney.

1. **Login:** Alice signs in (Supabase Auth)
2. **City Selection:** App shows "Select your city" dropdown (Adelaide, Sydney)
3. **Set Context:** User picks Adelaide → App sets `app.city_id = 'uuid-adelaide'`
4. **Scoped Queries:** All subsequent queries use RLS to filter by `city_id`

**In Code:**
```typescript
// Client-side: User selects city
const { city } = await setActiveCity(adelaideId);

// Server-side: RLS automatically scopes queries
const events = await supabase.from('events').select('*');
// Returns only Adelaide events (RLS filters by auth.current_city())
```

---

## Migration Strategy

**Initial Setup:**
```sql
-- Run in order:
-- 1. Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create types
CREATE TYPE user_role AS ENUM ('super_admin', 'city_admin', 'member');

-- 3. Create tables (in dependency order)
CREATE TABLE cities (...);
CREATE TABLE profiles (...);
CREATE TABLE user_city_roles (...);
CREATE TABLE groups (...);
CREATE TABLE group_members (...);

-- 4. Create helper functions
CREATE FUNCTION auth.current_city() ...;
CREATE FUNCTION auth.user_role() ...;

-- 5. Enable RLS
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
-- (RLS policies defined in 03-authorization.md)
```

---

## Atomic Implementation Units

Here are discrete buildable pieces:

### Unit 1: Cities Table
- **Files:** `supabase/migrations/001_create_cities.sql`
- **Acceptance Criteria:**
  - ✅ Table created with all columns
  - ✅ Unique index on slug
  - ✅ Sample cities inserted (Adelaide, Sydney, Melbourne)

### Unit 2: Profiles Table
- **Files:** `supabase/migrations/002_create_profiles.sql`
- **Acceptance Criteria:**
  - ✅ Table created, linked to auth.users
  - ✅ RLS policies applied (users update own, all read)

### Unit 3: User-City-Roles Table
- **Files:** `supabase/migrations/003_create_user_city_roles.sql`
- **Acceptance Criteria:**
  - ✅ Enum type created
  - ✅ Table created with unique constraint
  - ✅ Indexes on user_id, city_id, role

### Unit 4: Groups Tables
- **Files:** `supabase/migrations/004_create_groups.sql`
- **Acceptance Criteria:**
  - ✅ `groups` and `group_members` tables created
  - ✅ Cascade delete from groups to members

### Unit 5: Helper Functions
- **Files:** `supabase/migrations/005_create_helper_functions.sql`
- **Acceptance Criteria:**
  - ✅ `auth.current_city()` returns correct city for logged-in user
  - ✅ `auth.user_role()` returns correct role

---

## Testing Checklist

**Multi-Tenancy Isolation:**
- [ ] Create 2 cities, insert test data for each
- [ ] Login as user in City A
- [ ] Verify queries only return City A data (not City B)

**Role Enforcement:**
- [ ] Login as `member`, attempt to create city → Should fail
- [ ] Login as `city_admin`, update own city → Should succeed
- [ ] Login as `super_admin`, view all cities → Should succeed

**Cascade Deletes:**
- [ ] Delete a city, verify groups are also deleted

---

## Open Questions

1. **City Metadata:** Do cities need `timezone`, `currency`, `language` fields? (Likely needed for global expansion)
2. **Archiving:** Should `deleted_at` cities be queryable by super admins? (For compliance/history)
3. **Member Approval:** Should city admins approve new members, or auto-approve? (Default: auto-approve)

---

## Summary

This data model provides:
- ✅ Multi-tenant isolation (every entity scoped to city)
- ✅ Flexible role system (users can have different roles in different cities)
- ✅ Normalized schema (no data duplication)
- ✅ Extensibility (features add tables that reference these core entities)

**Next Steps:**
- Read [02-authentication.md](02-authentication.md) for Supabase Auth SSR implementation
- Read [03-authorization.md](03-authorization.md) for RLS policy details
