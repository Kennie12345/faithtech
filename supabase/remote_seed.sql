-- =============================================================================
-- Remote Seed Data for FaithTech Regional Hub
-- =============================================================================
-- DEPRECATED: This file is no longer needed for city seeding.
--
-- Cities are now automatically seeded via migration 020_seed_default_cities.sql
-- which runs when you execute `supabase db reset` or apply migrations.
--
-- If you need to manually seed additional data (groups, events, projects, etc.)
-- on a remote Supabase instance, create a new seed file for that specific purpose.
--
-- =============================================================================

-- =============================================================================
-- VERIFICATION - Check that migration 020 created cities
-- =============================================================================

-- Verify cities exist from migration 020
SELECT
  id,
  name,
  slug,
  accent_color,
  is_active,
  created_at
FROM cities
ORDER BY name;

-- =============================================================================
-- VERIFICATION
-- =============================================================================

-- Verify cities were created successfully
SELECT
  id,
  name,
  slug,
  accent_color,
  is_active,
  created_at
FROM cities
ORDER BY name;

-- Expected output: 4 rows (Adelaide, Brisbane, Melbourne, Sydney)

-- =============================================================================
-- NEXT STEPS
-- =============================================================================
--
-- Now that cities exist, you can:
--
-- 1. CREATE USERS via Supabase Auth:
--    - Go to Authentication > Users > Add User
--    - Create admin users for each city
--    - Create test members
--
-- 2. ASSIGN ROLES manually via SQL:
--    INSERT INTO user_city_roles (user_id, city_id, role)
--    VALUES ('user-uuid-here', 'c1111111-1111-1111-1111-111111111111', 'city_admin');
--
-- 3. CREATE CONTENT via the UI:
--    - Visit http://localhost:3000/adelaide/admin (or your deployed URL)
--    - Create events, projects, blog posts
--
-- 4. TEST MULTI-TENANCY:
--    - Log in as different users
--    - Verify they only see data for their assigned cities
--    - Test RLS policies are working correctly
--
-- =============================================================================
