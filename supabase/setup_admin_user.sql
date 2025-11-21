-- =============================================================================
-- Setup Admin User - Profile and Roles
-- =============================================================================
-- Run this AFTER creating your first user via Supabase Dashboard
--
-- STEP 1: Create user via Dashboard
-- --------------------------------
-- 1. Go to https://supabase.com/dashboard/project/vbyewjoimseejhowxndd
-- 2. Click "Authentication" > "Users"
-- 3. Click "Add User"
-- 4. Email: admin@faithtech.com.au (or your choice)
-- 5. Password: Create a secure password
-- 6. Click "Create User"
-- 7. COPY THE USER UUID from the users list
--
-- STEP 2: Run this script
-- -----------------------
-- 1. Replace 'YOUR_USER_UUID_HERE' below with the actual UUID
-- 2. Go to SQL Editor
-- 3. Paste this entire file
-- 4. Click Run
-- =============================================================================

-- IMPORTANT: Replace 'YOUR_USER_UUID_HERE' with your actual user UUID in ALL places below

-- Create profile for admin user
INSERT INTO profiles (id, display_name, avatar_url, bio, created_at, updated_at)
VALUES
  (
    'YOUR_USER_UUID_HERE',  -- ⬅️ REPLACE THIS
    'Super Admin',
    NULL,
    'FaithTech Australia Super Administrator',
    now(),
    now()
  )
ON CONFLICT (id) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  bio = EXCLUDED.bio,
  updated_at = now();

-- Assign super_admin role for ALL cities
-- Super admin has access to Adelaide, Sydney, Melbourne, Brisbane
INSERT INTO user_city_roles (user_id, city_id, role, joined_at)
VALUES
  -- Adelaide
  ('YOUR_USER_UUID_HERE', 'c1111111-1111-1111-1111-111111111111', 'super_admin', now()),  -- ⬅️ REPLACE THIS
  -- Sydney
  ('YOUR_USER_UUID_HERE', 'c2222222-2222-2222-2222-222222222222', 'super_admin', now()),  -- ⬅️ REPLACE THIS
  -- Melbourne
  ('YOUR_USER_UUID_HERE', 'c3333333-3333-3333-3333-333333333333', 'super_admin', now()),  -- ⬅️ REPLACE THIS
  -- Brisbane
  ('YOUR_USER_UUID_HERE', 'c4444444-4444-4444-4444-444444444444', 'super_admin', now())   -- ⬅️ REPLACE THIS
ON CONFLICT (user_id, city_id) DO UPDATE SET
  role = EXCLUDED.role;

-- =============================================================================
-- VERIFICATION
-- =============================================================================

-- Verify profile was created
SELECT
  id,
  display_name,
  bio,
  created_at
FROM profiles
WHERE id = 'YOUR_USER_UUID_HERE';  -- ⬅️ REPLACE THIS

-- Verify roles were assigned
SELECT
  ucr.user_id,
  c.name as city_name,
  ucr.role,
  ucr.joined_at
FROM user_city_roles ucr
JOIN cities c ON c.id = ucr.city_id
WHERE ucr.user_id = 'YOUR_USER_UUID_HERE'  -- ⬅️ REPLACE THIS
ORDER BY c.name;

-- Expected output: 4 rows showing super_admin role for all cities

-- =============================================================================
-- NEXT STEPS
-- =============================================================================
--
-- Your admin user is now set up! You can:
--
-- 1. LOG IN to your application:
--    Visit: https://your-app-url.vercel.app/auth/login
--    Or locally: http://localhost:3000/auth/login
--
-- 2. ACCESS ADMIN PANELS:
--    - /adelaide/admin
--    - /sydney/admin
--    - /melbourne/admin
--    - /brisbane/admin
--
-- 3. CREATE CONTENT:
--    - Events: /[city]/admin/events/new
--    - Projects: /[city]/admin/projects/new
--    - Blog Posts: /[city]/admin/blog/new
--
-- 4. CREATE MORE USERS:
--    - City Admins (manage one city)
--    - Members (can contribute content, RSVP to events)
--
-- =============================================================================
