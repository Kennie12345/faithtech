# Data Model: Entity Relationship Diagram

**Document Type:** Visual Architecture
**Purpose:** Understand database structure and relationships
**Last Updated:** 2025-11-05

---

## Core Entities (Multi-Tenant Foundation)

```
┌──────────────────────┐
│       cities         │
│ ──────────────────── │
│ id (UUID, PK)        │◄────────┐
│ name                 │         │
│ slug (unique)        │         │  1:N
│ logo_url             │         │
│ accent_color         │         │
│ is_active            │         │
│ created_at           │         │
└──────────────────────┘         │
                                 │
                                 │
┌──────────────────────────────┐ │
│    user_city_roles           │ │
│ ──────────────────────────── │ │
│ id (UUID, PK)                │ │
│ user_id (UUID, FK) ──────────┼─┼──► auth.users (Supabase)
│ city_id (UUID, FK) ──────────┼─┘      │ id
│ role (ENUM)                  │         │ email
│   - super_admin              │         │ encrypted_password
│   - city_admin               │         └─ (managed by Supabase)
│   - member                   │
│ joined_at                    │
│ UNIQUE(user_id, city_id)     │
└──────────────────────────────┘
                                 │
                                 │ 1:N
                                 ▼
                    ┌──────────────────────┐
                    │      profiles        │
                    │ ──────────────────── │
                    │ id (UUID, PK, FK)    │──► auth.users
                    │ display_name         │
                    │ avatar_url           │
                    │ bio                  │
                    │ linkedin_url         │
                    │ github_url           │
                    └──────────────────────┘


┌──────────────────────┐
│       groups         │
│ ──────────────────── │
│ id (UUID, PK)        │
│ city_id (UUID, FK) ──┼──► cities.id
│ name                 │
│ description          │
│ is_public            │
│ created_at           │
│ UNIQUE(city_id, name)│
└──────────┬───────────┘
           │
           │ 1:N
           │
┌──────────▼───────────────┐
│    group_members         │
│ ──────────────────────── │
│ id (UUID, PK)            │
│ group_id (UUID, FK) ─────┼──► groups.id
│ user_id (UUID, FK) ──────┼──► auth.users.id
│ joined_at                │
│ UNIQUE(group_id, user_id)│
└──────────────────────────┘
```

---

## Feature Tables (City-Scoped)

### Events Feature

```
┌──────────────────────────┐
│        events            │
│ ──────────────────────── │
│ id (UUID, PK)            │
│ city_id (UUID, FK) ──────┼──► cities.id  ⚡ RLS enforces city isolation
│ title                    │
│ slug                     │
│ description              │
│ starts_at (TIMESTAMPTZ)  │
│ ends_at (TIMESTAMPTZ)    │
│ location_name            │
│ location_address         │
│ max_attendees (INT)      │
│ created_at               │
│ created_by (UUID, FK) ───┼──► auth.users.id
│ UNIQUE(city_id, slug)    │
└──────────┬───────────────┘
           │
           │ 1:N
           │
┌──────────▼───────────────────┐
│      event_rsvps             │
│ ──────────────────────────── │
│ id (UUID, PK)                │
│ event_id (UUID, FK) ─────────┼──► events.id (CASCADE DELETE)
│ user_id (UUID, FK) ──────────┼──► auth.users.id
│ status (ENUM)                │
│   - yes                      │
│   - no                       │
│   - maybe                    │
│ created_at                   │
│ UNIQUE(event_id, user_id)    │
└──────────────────────────────┘
```

### Projects Feature

```
┌──────────────────────────┐
│       projects           │
│ ──────────────────────── │
│ id (UUID, PK)            │
│ city_id (UUID, FK) ──────┼──► cities.id  ⚡ RLS enforces city isolation
│ title                    │
│ slug                     │
│ description              │
│ problem_statement        │
│ solution                 │
│ github_url               │
│ demo_url                 │
│ image_url                │
│ is_featured (BOOLEAN)    │
│ created_at               │
│ created_by (UUID, FK) ───┼──► auth.users.id
│ UNIQUE(city_id, slug)    │
└──────────┬───────────────┘
           │
           │ 1:N
           │
┌──────────▼───────────────────┐
│    project_members           │
│ ──────────────────────────── │
│ id (UUID, PK)                │
│ project_id (UUID, FK) ───────┼──► projects.id (CASCADE DELETE)
│ user_id (UUID, FK) ──────────┼──► auth.users.id
│ role (TEXT)                  │
│   - lead                     │
│   - contributor              │
│ UNIQUE(project_id, user_id)  │
└──────────────────────────────┘
```

### Blog Feature

```
┌──────────────────────────┐
│         posts            │
│ ──────────────────────── │
│ id (UUID, PK)            │
│ city_id (UUID, FK) ──────┼──► cities.id  ⚡ RLS enforces city isolation
│ title                    │
│ slug                     │
│ content_markdown (TEXT)  │
│ excerpt                  │
│ meta_description         │
│ og_image_url             │
│ status (ENUM)            │
│   - draft                │
│   - published            │
│ published_at (TIMESTAMPTZ│
│ created_at               │
│ updated_at               │
│ author_id (UUID, FK) ────┼──► auth.users.id
│ UNIQUE(city_id, slug)    │
└──────────────────────────┘
```

### Newsletter Feature

```
┌────────────────────────────────┐
│   newsletter_subscribers       │
│ ────────────────────────────── │
│ id (UUID, PK)                  │
│ city_id (UUID, FK) ────────────┼──► cities.id  ⚡ RLS enforces city isolation
│ email (TEXT)                   │
│ is_active (BOOLEAN)            │
│ subscribed_at (TIMESTAMPTZ)    │
│ unsubscribed_at (TIMESTAMPTZ)  │
│ UNIQUE(city_id, email)         │
└────────────────────────────────┘
```

---

## Multi-Tenancy Pattern

**Every feature table follows this pattern:**

```sql
CREATE TABLE [feature_table] (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id UUID NOT NULL REFERENCES cities(id) ON DELETE CASCADE,  ⚡ Mandatory!

  -- Feature-specific columns...

  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Index for performance
CREATE INDEX [feature_table]_city_idx ON [feature_table](city_id);

-- RLS policy for city isolation
CREATE POLICY "[feature]_city_isolation" ON [feature_table]
  FOR ALL
  USING (city_id = auth.current_city());
```

---

## Relationship Summary

### One-to-Many (1:N)
- 1 City → N Events
- 1 City → N Projects
- 1 City → N Posts
- 1 City → N Groups
- 1 City → N Newsletter Subscribers
- 1 Event → N RSVPs
- 1 Project → N Project Members
- 1 Group → N Group Members

### Many-to-Many (N:M)
- Users ↔ Cities (via `user_city_roles`)
- Users ↔ Groups (via `group_members`)
- Users ↔ Projects (via `project_members`)
- Users ↔ Events (via `event_rsvps`)

---

## Cascade Delete Behavior

**When a city is deleted:**
```
cities (deleted)
  ├─► user_city_roles (CASCADE DELETE)
  ├─► groups (CASCADE DELETE)
  │     └─► group_members (CASCADE DELETE)
  ├─► events (CASCADE DELETE)
  │     └─► event_rsvps (CASCADE DELETE)
  ├─► projects (CASCADE DELETE)
  │     └─► project_members (CASCADE DELETE)
  ├─► posts (CASCADE DELETE)
  └─► newsletter_subscribers (CASCADE DELETE)
```

**When a user is deleted:**
```
auth.users (deleted)
  ├─► profiles (CASCADE DELETE)
  ├─► user_city_roles (CASCADE DELETE)
  ├─► group_members (CASCADE DELETE)
  ├─► event_rsvps (CASCADE DELETE)
  └─► project_members (CASCADE DELETE)
```

---

## Key Constraints

### Uniqueness
- `cities.slug` - URL-safe city identifier
- `user_city_roles (user_id, city_id)` - One role per user per city
- `events (city_id, slug)` - Event slugs unique per city
- `projects (city_id, slug)` - Project slugs unique per city
- `posts (city_id, slug)` - Post slugs unique per city
- `groups (city_id, name)` - Group names unique per city

### Foreign Keys
- All `city_id` columns reference `cities(id)` with `ON DELETE CASCADE`
- All `user_id` columns reference `auth.users(id)` with `ON DELETE CASCADE`
- All `created_by` columns reference `auth.users(id)` with `ON DELETE SET NULL` (preserve content)

---

## Indexes (Performance)

**Required indexes on every table:**
```sql
-- Foreign key index (speeds up joins and RLS)
CREATE INDEX [table]_city_idx ON [table](city_id);

-- Sorting index (for list views)
CREATE INDEX [table]_created_at_idx ON [table](created_at DESC);

-- Slug lookup (for detail pages)
CREATE UNIQUE INDEX [table]_slug_idx ON [table](city_id, slug);
```

---

## Row-Level Security (RLS) Summary

**Every table has RLS enabled:**
```sql
ALTER TABLE [table] ENABLE ROW LEVEL SECURITY;
```

**Standard policies:**
- **SELECT**: City isolation (`WHERE city_id = auth.current_city()`)
- **INSERT**: City admins only
- **UPDATE**: City admins only
- **DELETE**: City admins only

**Exceptions:**
- `event_rsvps`: Members can INSERT/UPDATE/DELETE their own RSVPs
- `newsletter_subscribers`: Public can INSERT (subscribe form)
- `profiles`: Users can UPDATE their own profile

---

## Next Steps

- **For detailed schema SQL:** See [../2-core-architecture/multi-tenant-data-model.md](../2-core-architecture/multi-tenant-data-model.md)
- **For RLS policies:** See [../2-core-architecture/authorization-rls-policies.md](../2-core-architecture/authorization-rls-policies.md)
- **For system layers:** See [system-architecture.md](system-architecture.md)
