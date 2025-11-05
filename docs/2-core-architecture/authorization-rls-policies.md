# Authorization: Row-Level Security (RLS) Policies

**Document Type:** Core (Stable)
**Stability Level:** Stable
**Audience:** Engineers implementing features
**Last Updated:** 2025-11-05
**Dependencies:** [01-data-model.md](01-data-model.md), [02-authentication.md](02-authentication.md)

---

## Purpose

This document defines how we enforce multi-tenant isolation and role-based access using PostgreSQL Row-Level Security (RLS).

**Key Principle:** Never trust client-side code. All authorization happens at the database level.

---

## RLS Overview

**Row-Level Security** adds `WHERE` clauses to every query automatically:

```sql
-- User writes this:
SELECT * FROM events;

-- PostgreSQL executes this (with RLS):
SELECT * FROM events WHERE city_id = auth.current_city();
```

**Benefits:**
- ✅ Impossible to bypass (enforced by PostgreSQL, not app code)
- ✅ Works with any client (SQL, API, direct DB access)
- ✅ No N+1 queries (single WHERE clause, not app-level filtering)

---

## Core RLS Patterns

### Pattern 1: City Isolation

**Goal:** Users only see data from their city.

```sql
-- Enable RLS on table
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Policy: SELECT queries only return user's city data
CREATE POLICY "city_isolation_select" ON events
  FOR SELECT
  USING (city_id = auth.current_city());

-- Policy: INSERT must set city_id to user's city
CREATE POLICY "city_isolation_insert" ON events
  FOR INSERT
  WITH CHECK (city_id = auth.current_city());

-- Policy: UPDATE only own city's data
CREATE POLICY "city_isolation_update" ON events
  FOR UPDATE
  USING (city_id = auth.current_city());

-- Policy: DELETE only own city's data
CREATE POLICY "city_isolation_delete" ON events
  FOR DELETE
  USING (city_id = auth.current_city());
```

**Result:** User in Adelaide cannot see/edit Sydney's events.

---

### Pattern 2: Role-Based Access

**Goal:** Only city admins can create/update, members can only read.

```sql
-- Members can view events
CREATE POLICY "members_view_events" ON events
  FOR SELECT
  USING (
    city_id = auth.current_city()
    AND auth.user_role(city_id) IN ('member', 'city_admin', 'super_admin')
  );

-- Only city admins can create events
CREATE POLICY "admins_create_events" ON events
  FOR INSERT
  WITH CHECK (
    city_id = auth.current_city()
    AND auth.user_role(city_id) IN ('city_admin', 'super_admin')
  );

-- Only city admins can update events
CREATE POLICY "admins_update_events" ON events
  FOR UPDATE
  USING (
    city_id = auth.current_city()
    AND auth.user_role(city_id) IN ('city_admin', 'super_admin')
  );

-- Only city admins can delete events
CREATE POLICY "admins_delete_events" ON events
  FOR DELETE
  USING (
    city_id = auth.current_city()
    AND auth.user_role(city_id) IN ('city_admin', 'super_admin')
  );
```

---

### Pattern 3: User-Owned Data

**Goal:** Users can only edit their own profile.

```sql
-- Everyone can view profiles
CREATE POLICY "profiles_public_read" ON profiles
  FOR SELECT
  USING (TRUE);

-- Users can only update their own profile
CREATE POLICY "users_update_own_profile" ON profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Users can insert their own profile (during signup)
CREATE POLICY "users_insert_own_profile" ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);
```

---

### Pattern 4: Super Admin Bypass

**Goal:** Super admins can view all cities (read-only).

```sql
CREATE POLICY "super_admin_view_all_cities" ON cities
  FOR SELECT
  USING (
    is_active = TRUE
    AND (
      -- Regular users see only their cities
      id IN (SELECT city_id FROM user_city_roles WHERE user_id = auth.uid())
      OR
      -- Super admins see all cities
      EXISTS (
        SELECT 1 FROM user_city_roles
        WHERE user_id = auth.uid() AND role = 'super_admin'
      )
    )
  );
```

---

## Core Table Policies

### `cities`

```sql
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;

-- SELECT: Users see cities they're members of, super admins see all
CREATE POLICY "cities_select" ON cities
  FOR SELECT
  USING (
    id IN (SELECT city_id FROM user_city_roles WHERE user_id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM user_city_roles
      WHERE user_id = auth.uid() AND role = 'super_admin'
    )
  );

-- INSERT: Only super admins create cities
CREATE POLICY "cities_insert" ON cities
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_city_roles
      WHERE user_id = auth.uid() AND role = 'super_admin'
    )
  );

-- UPDATE: City admins update their city, super admins update any
CREATE POLICY "cities_update" ON cities
  FOR UPDATE
  USING (
    (id = auth.current_city() AND auth.user_role(id) = 'city_admin')
    OR EXISTS (
      SELECT 1 FROM user_city_roles
      WHERE user_id = auth.uid() AND role = 'super_admin'
    )
  );

-- DELETE: Only super admins delete cities
CREATE POLICY "cities_delete" ON cities
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_city_roles
      WHERE user_id = auth.uid() AND role = 'super_admin'
    )
  );
```

---

### `profiles`

```sql
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Everyone can view profiles
CREATE POLICY "profiles_select" ON profiles
  FOR SELECT
  USING (TRUE);

-- Users can insert their own profile
CREATE POLICY "profiles_insert" ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "profiles_update" ON profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- No delete (profiles soft-deleted via auth.users)
```

---

### `user_city_roles`

```sql
ALTER TABLE user_city_roles ENABLE ROW LEVEL SECURITY;

-- SELECT: Users see their own roles, city admins see their city's roles
CREATE POLICY "user_city_roles_select" ON user_city_roles
  FOR SELECT
  USING (
    user_id = auth.uid()
    OR (city_id = auth.current_city() AND auth.user_role(city_id) = 'city_admin')
    OR EXISTS (
      SELECT 1 FROM user_city_roles
      WHERE user_id = auth.uid() AND role = 'super_admin'
    )
  );

-- INSERT: City admins assign roles in their city, super admins assign anywhere
CREATE POLICY "user_city_roles_insert" ON user_city_roles
  FOR INSERT
  WITH CHECK (
    (city_id = auth.current_city() AND auth.user_role(city_id) = 'city_admin')
    OR EXISTS (
      SELECT 1 FROM user_city_roles
      WHERE user_id = auth.uid() AND role = 'super_admin'
    )
  );

-- UPDATE: City admins update roles in their city
CREATE POLICY "user_city_roles_update" ON user_city_roles
  FOR UPDATE
  USING (
    (city_id = auth.current_city() AND auth.user_role(city_id) = 'city_admin')
    OR EXISTS (
      SELECT 1 FROM user_city_roles
      WHERE user_id = auth.uid() AND role = 'super_admin'
    )
  );

-- DELETE: City admins remove members from their city
CREATE POLICY "user_city_roles_delete" ON user_city_roles
  FOR DELETE
  USING (
    (city_id = auth.current_city() AND auth.user_role(city_id) = 'city_admin')
    OR EXISTS (
      SELECT 1 FROM user_city_roles
      WHERE user_id = auth.uid() AND role = 'super_admin'
    )
  );
```

---

### `groups` & `group_members`

```sql
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;

-- GROUPS: City isolation
CREATE POLICY "groups_city_isolation" ON groups
  FOR ALL
  USING (city_id = auth.current_city());

-- GROUP_MEMBERS: Users can join groups if they're in that city
CREATE POLICY "group_members_join" ON group_members
  FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM groups
      WHERE id = group_id AND city_id = auth.current_city()
    )
  );

-- GROUP_MEMBERS: Users can leave groups
CREATE POLICY "group_members_leave" ON group_members
  FOR DELETE
  USING (user_id = auth.uid());

-- GROUP_MEMBERS: Everyone can view
CREATE POLICY "group_members_view" ON group_members
  FOR SELECT
  USING (TRUE);
```

---

## Feature Table RLS Pattern

When creating feature tables (events, blog posts, etc.), follow this template:

```sql
-- 1. Enable RLS
ALTER TABLE [table_name] ENABLE ROW LEVEL SECURITY;

-- 2. SELECT: City isolation
CREATE POLICY "[table]_select" ON [table_name]
  FOR SELECT
  USING (city_id = auth.current_city());

-- 3. INSERT: Only city admins
CREATE POLICY "[table]_insert" ON [table_name]
  FOR INSERT
  WITH CHECK (
    city_id = auth.current_city()
    AND auth.user_role(city_id) IN ('city_admin', 'super_admin')
  );

-- 4. UPDATE: Only city admins
CREATE POLICY "[table]_update" ON [table_name]
  FOR UPDATE
  USING (
    city_id = auth.current_city()
    AND auth.user_role(city_id) IN ('city_admin', 'super_admin')
  );

-- 5. DELETE: Only city admins
CREATE POLICY "[table]_delete" ON [table_name]
  FOR DELETE
  USING (
    city_id = auth.current_city()
    AND auth.user_role(city_id) IN ('city_admin', 'super_admin')
  );
```

**Variations:**
- **User-Generated Content** (e.g., RSVP): Allow members to INSERT
- **Public Read** (e.g., blog comments): Remove city_id filter on SELECT

---

## Testing RLS Policies

### Manual Testing

```sql
-- Test as specific user
SET ROLE authenticated;
SET request.jwt.claims.sub TO 'user-uuid-here';

-- Run queries and verify correct filtering
SELECT * FROM events;  -- Should only see user's city

-- Reset
RESET ROLE;
```

### Automated Testing

```typescript
// test/rls/events.test.ts
import { createClient } from '@supabase/supabase-js';

test('members cannot create events', async () => {
  const supabase = createClient(url, anonKey);

  // Login as member
  await supabase.auth.signInWithPassword({ email: 'member@test.com', password: '...' });

  // Attempt to create event
  const { error } = await supabase.from('events').insert({
    city_id: 'adelaide-id',
    title: 'Test Event',
  });

  expect(error).toBeTruthy(); // Should fail due to RLS
});

test('city admins can create events', async () => {
  const supabase = createClient(url, anonKey);

  // Login as city admin
  await supabase.auth.signInWithPassword({ email: 'admin@test.com', password: '...' });

  // Create event
  const { data, error } = await supabase.from('events').insert({
    city_id: 'adelaide-id',
    title: 'Test Event',
  });

  expect(error).toBeNull();
  expect(data).toBeTruthy();
});

test('city isolation prevents cross-city access', async () => {
  const supabase = createClient(url, anonKey);

  // Login as Adelaide admin
  await supabase.auth.signInWithPassword({ email: 'adelaide@test.com', password: '...' });

  // Try to read Sydney events
  const { data } = await supabase.from('events').select('*');

  // Should only see Adelaide events
  expect(data.every(e => e.city_id === 'adelaide-id')).toBe(true);
});
```

---

## Performance Considerations

### Avoid N+1 Queries in Policies

```sql
-- ❌ Slow: Subquery runs for every row
CREATE POLICY "bad_policy" ON events
  FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM cities WHERE id = city_id AND is_active = TRUE)
  );

-- ✅ Fast: Use JOIN or cached function
CREATE POLICY "good_policy" ON events
  FOR SELECT
  USING (city_id = auth.current_city());
```

### Index Foreign Keys

```sql
-- Index city_id on all multi-tenant tables
CREATE INDEX events_city_id_idx ON events(city_id);
CREATE INDEX groups_city_id_idx ON groups(city_id);
```

### Cache Helper Functions

```sql
-- Mark as STABLE (result won't change within transaction)
CREATE OR REPLACE FUNCTION auth.current_city()
RETURNS UUID AS $$
  ...
$$ LANGUAGE SQL STABLE;  -- Cached per request
```

---

## Security Checklist

- [ ] RLS enabled on ALL tables (except truly global ones like `auth.users`)
- [ ] Every policy has both USING and WITH CHECK clauses
- [ ] Policies tested with actual user sessions (not service_role)
- [ ] `city_id` indexed on all multi-tenant tables
- [ ] Helper functions marked STABLE for caching
- [ ] No policies use `TRUE` without careful consideration

---

## Atomic Implementation Units

### Unit 1: Core Table Policies
- **Files:** `supabase/migrations/010_rls_core_tables.sql`
- **Acceptance Criteria:**
  - ✅ RLS enabled on cities, profiles, user_city_roles, groups
  - ✅ Policies tested manually (SET ROLE)

### Unit 2: Feature Table Policy Template
- **Files:** `docs/core/03-authorization.md` (this doc)
- **Acceptance Criteria:**
  - ✅ Template documented for feature developers

### Unit 3: RLS Test Suite
- **Files:** `test/rls/*.test.ts`
- **Acceptance Criteria:**
  - ✅ Tests for city isolation
  - ✅ Tests for role-based access

---

## Next Steps

- Read [04-database-migrations.md](04-database-migrations.md) for migration workflow
- Read [05-api-contracts.md](05-api-contracts.md) for Event Bus + CoreAPI
