-- =============================================================================
-- Seed Data for FaithTech Regional Hub
-- =============================================================================
-- Creates initial test data for local development
-- Run with: supabase db reset (applies all migrations + seed data)
--
-- IMPORTANT: This seed data is for LOCAL DEVELOPMENT ONLY
-- Production data should be created via the /setup wizard or admin UI
-- =============================================================================

-- =============================================================================
-- CITIES
-- =============================================================================

-- Insert test cities for Australia
INSERT INTO cities (id, name, slug, logo_url, hero_image_url, accent_color, is_active, created_at, updated_at)
VALUES
  -- Adelaide (FaithTech Australia HQ)
  (
    'c1111111-1111-1111-1111-111111111111',
    'Adelaide',
    'adelaide',
    NULL, -- Logo to be added later via storage
    NULL, -- Hero image to be added later via storage
    '#6366f1', -- Indigo (default)
    true,
    now(),
    now()
  ),
  -- Sydney
  (
    'c2222222-2222-2222-2222-222222222222',
    'Sydney',
    'sydney',
    NULL,
    NULL,
    '#8b5cf6', -- Purple
    true,
    now(),
    now()
  ),
  -- Melbourne
  (
    'c3333333-3333-3333-3333-333333333333',
    'Melbourne',
    'melbourne',
    NULL,
    NULL,
    '#ec4899', -- Pink
    true,
    now(),
    now()
  );

-- =============================================================================
-- TEST USERS & PROFILES
-- =============================================================================

-- Note: Users must be created via Supabase Auth (either UI or auth.signup())
-- Cannot directly INSERT into auth.users table as it requires proper password hashing
--
-- FOR LOCAL DEVELOPMENT:
-- 1. Start supabase: supabase start
-- 2. Open Supabase Studio: http://localhost:54323
-- 3. Go to Authentication > Users > Add User
-- 4. Create test users:
--    - super-admin@faithtech.test / password: TestAdmin123!
--    - adelaide-admin@faithtech.test / password: TestAdmin123!
--    - sydney-admin@faithtech.test / password: TestAdmin123!
--    - member@faithtech.test / password: TestMember123!
--
-- 5. Note the UUIDs generated for each user
-- 6. Update the INSERT statements below with the actual UUIDs

-- Uncomment and update with real UUIDs after creating users in Supabase Studio:
/*
-- Create profiles for test users
INSERT INTO profiles (id, display_name, avatar_url, bio, created_at, updated_at)
VALUES
  (
    'REPLACE-WITH-SUPER-ADMIN-UUID',
    'Super Admin',
    NULL,
    'FaithTech Australia Super Admin - manages all cities',
    now(),
    now()
  ),
  (
    'REPLACE-WITH-ADELAIDE-ADMIN-UUID',
    'Adelaide Admin',
    NULL,
    'FaithTech Adelaide City Admin',
    now(),
    now()
  ),
  (
    'REPLACE-WITH-SYDNEY-ADMIN-UUID',
    'Sydney Admin',
    NULL,
    'FaithTech Sydney City Admin',
    now(),
    now()
  ),
  (
    'REPLACE-WITH-MEMBER-UUID',
    'Test Member',
    NULL,
    'Regular FaithTech member for testing',
    now(),
    now()
  );

-- Assign roles to cities
INSERT INTO user_city_roles (user_id, city_id, role, joined_at)
VALUES
  -- Super Admin: Global access to all cities
  ('REPLACE-WITH-SUPER-ADMIN-UUID', 'c1111111-1111-1111-1111-111111111111', 'super_admin', now()),
  ('REPLACE-WITH-SUPER-ADMIN-UUID', 'c2222222-2222-2222-2222-222222222222', 'super_admin', now()),
  ('REPLACE-WITH-SUPER-ADMIN-UUID', 'c3333333-3333-3333-3333-333333333333', 'super_admin', now()),

  -- Adelaide Admin: City admin for Adelaide only
  ('REPLACE-WITH-ADELAIDE-ADMIN-UUID', 'c1111111-1111-1111-1111-111111111111', 'city_admin', now()),

  -- Sydney Admin: City admin for Sydney only
  ('REPLACE-WITH-SYDNEY-ADMIN-UUID', 'c2222222-2222-2222-2222-222222222222', 'city_admin', now()),

  -- Test Member: Member of Adelaide
  ('REPLACE-WITH-MEMBER-UUID', 'c1111111-1111-1111-1111-111111111111', 'member', now());
*/

-- =============================================================================
-- GROUPS (Optional test data)
-- =============================================================================

-- Create test groups for each city
INSERT INTO groups (id, city_id, name, description, is_public, created_at, updated_at)
VALUES
  -- Adelaide groups
  (
    'g1111111-1111-1111-1111-111111111111',
    'c1111111-1111-1111-1111-111111111111',
    'Web Developers',
    'Frontend and backend web developers building for the kingdom',
    true,
    now(),
    now()
  ),
  (
    'g1111112-1111-1111-1111-111111111111',
    'c1111111-1111-1111-1111-111111111111',
    'Prayer Team',
    'Committed to praying for FaithTech Adelaide and tech workers',
    true,
    now(),
    now()
  ),
  -- Sydney groups
  (
    'g2222221-2222-2222-2222-222222222222',
    'c2222222-2222-2222-2222-222222222222',
    'Mobile Developers',
    'iOS and Android developers serving the Sydney community',
    true,
    now(),
    now()
  ),
  -- Melbourne groups
  (
    'g3333331-3333-3333-3333-333333333333',
    'c3333333-3333-3333-3333-333333333333',
    'Data Scientists',
    'Using data science and AI for social good in Melbourne',
    true,
    now(),
    now()
  );

-- =============================================================================
-- EVENTS (Test events for each city)
-- =============================================================================

-- Create upcoming test events
INSERT INTO events (id, city_id, title, description, slug, starts_at, ends_at, location_name, location_address, max_attendees, created_at, updated_at)
VALUES
  -- Adelaide upcoming event
  (
    'e1111111-1111-1111-1111-111111111111',
    'c1111111-1111-1111-1111-111111111111',
    'Community Meetup',
    E'Join us for our monthly community meetup!\n\nWe\'ll be discussing how technology can serve the kingdom, sharing testimonies, and connecting with other tech workers in Adelaide.\n\nBring a friend! Light refreshments provided.',
    'community-meetup',
    (now() + interval '7 days')::timestamptz, -- Next week
    (now() + interval '7 days 2 hours')::timestamptz,
    'St Paul''s Church',
    '123 Main Street, Adelaide SA 5000',
    50,
    now(),
    now()
  ),
  -- Adelaide upcoming event 2
  (
    'e1111112-1111-1111-1111-111111111111',
    'c1111111-1111-1111-1111-111111111111',
    'Web Development Workshop',
    E'Learn modern web development with React and Next.js!\n\nThis hands-on workshop is perfect for beginners and intermediate developers looking to level up their skills.\n\nBring your laptop.',
    'web-dev-workshop',
    (now() + interval '14 days')::timestamptz, -- Two weeks from now
    (now() + interval '14 days 3 hours')::timestamptz,
    'TechHub Adelaide',
    '456 Tech St, Adelaide SA 5000',
    25,
    now(),
    now()
  ),
  -- Sydney upcoming event
  (
    'e2222221-2222-2222-2222-222222222222',
    'c2222222-2222-2222-2222-222222222222',
    'Prayer & Worship Night',
    E'Join us for an evening of prayer and worship focused on tech workers in Sydney.\n\nWe\'ll pray for breakthrough in the tech industry and for God\'s kingdom to advance through technology.',
    'prayer-worship-night',
    (now() + interval '10 days')::timestamptz,
    (now() + interval '10 days 2 hours')::timestamptz,
    'Hillsong City Campus',
    '789 George St, Sydney NSW 2000',
    NULL, -- Unlimited capacity
    now(),
    now()
  ),
  -- Melbourne upcoming event
  (
    'e3333331-3333-3333-3333-333333333333',
    'c3333333-3333-3333-3333-333333333333',
    'AI & Ethics Roundtable',
    E'A thoughtful discussion on artificial intelligence and Christian ethics.\n\nFeaturing guest speakers from leading tech companies and theological institutions.\n\nQ&A session included.',
    'ai-ethics-roundtable',
    (now() + interval '21 days')::timestamptz,
    (now() + interval '21 days 3 hours')::timestamptz,
    'Melbourne Convention Centre',
    '1 Convention Centre Pl, South Wharf VIC 3006',
    100,
    now(),
    now()
  ),
  -- Adelaide past event (for testing)
  (
    'e1111113-1111-1111-1111-111111111111',
    'c1111111-1111-1111-1111-111111111111',
    'Launch Event',
    E'Our inaugural FaithTech Adelaide launch event!\n\nIt was amazing to see 80+ tech workers gather to worship, network, and envision how God can use technology for His glory.',
    'launch-event',
    (now() - interval '30 days')::timestamptz, -- Last month
    (now() - interval '30 days 3 hours')::timestamptz,
    'St Paul''s Church',
    '123 Main Street, Adelaide SA 5000',
    NULL,
    now() - interval '45 days',
    now() - interval '45 days'
  );

-- =============================================================================
-- EVENT RSVPs (Test RSVPs)
-- =============================================================================

-- Note: Uncomment after creating test users and updating UUIDs
/*
INSERT INTO event_rsvps (event_id, user_id, status, created_at)
VALUES
  -- Adelaide Community Meetup RSVPs
  ('e1111111-1111-1111-1111-111111111111', 'REPLACE-WITH-ADELAIDE-ADMIN-UUID', 'yes', now()),
  ('e1111111-1111-1111-1111-111111111111', 'REPLACE-WITH-MEMBER-UUID', 'yes', now()),
  ('e1111111-1111-1111-1111-111111111111', 'REPLACE-WITH-SUPER-ADMIN-UUID', 'maybe', now()),

  -- Web Dev Workshop RSVPs
  ('e1111112-1111-1111-1111-111111111111', 'REPLACE-WITH-MEMBER-UUID', 'yes', now()),

  -- Sydney Prayer Night RSVPs
  ('e2222221-2222-2222-2222-222222222222', 'REPLACE-WITH-SYDNEY-ADMIN-UUID', 'yes', now()),
  ('e2222221-2222-2222-2222-222222222222', 'REPLACE-WITH-SUPER-ADMIN-UUID', 'yes', now()),

  -- Adelaide Launch Event (past event) RSVPs
  ('e1111113-1111-1111-1111-111111111111', 'REPLACE-WITH-ADELAIDE-ADMIN-UUID', 'yes', now() - interval '35 days'),
  ('e1111113-1111-1111-1111-111111111111', 'REPLACE-WITH-MEMBER-UUID', 'yes', now() - interval '35 days');
*/

-- =============================================================================
-- VERIFICATION QUERIES
-- =============================================================================

-- Run these queries to verify seed data loaded correctly:

-- Check cities
-- SELECT * FROM cities ORDER BY name;

-- Check profiles (after uncommenting and adding real UUIDs)
-- SELECT * FROM profiles;

-- Check user-city-roles (after uncommenting and adding real UUIDs)
-- SELECT
--   ucr.*,
--   c.name as city_name,
--   p.display_name as user_name
-- FROM user_city_roles ucr
-- JOIN cities c ON c.id = ucr.city_id
-- JOIN profiles p ON p.id = ucr.user_id
-- ORDER BY ucr.role DESC, c.name;

-- Check groups
-- SELECT
--   g.*,
--   c.name as city_name
-- FROM groups g
-- JOIN cities c ON c.id = g.city_id
-- ORDER BY c.name, g.name;

-- Check events
-- SELECT
--   e.*,
--   c.name as city_name
-- FROM events e
-- JOIN cities c ON c.id = e.city_id
-- ORDER BY e.starts_at DESC;

-- Check event RSVPs
-- SELECT
--   er.*,
--   e.title as event_title,
--   p.display_name as user_name
-- FROM event_rsvps er
-- JOIN events e ON e.id = er.event_id
-- JOIN profiles p ON p.id = er.user_id
-- ORDER BY e.title, er.status;

-- =============================================================================
-- NOTES FOR TESTING RLS POLICIES
-- =============================================================================

-- To test RLS policies in Supabase Studio SQL Editor:
--
-- 1. Set role to authenticated user:
-- SET ROLE authenticated;
-- SET request.jwt.claims.sub TO 'user-uuid-here';
--
-- 2. Set city context:
-- SELECT set_city_context('c1111111-1111-1111-1111-111111111111'); -- Adelaide
--
-- 3. Test queries (should only return Adelaide data):
-- SELECT * FROM cities;
-- SELECT * FROM groups;
--
-- 4. Switch to Sydney user and verify isolation:
-- SET request.jwt.claims.sub TO 'sydney-user-uuid';
-- SELECT set_city_context('c2222222-2222-2222-2222-222222222222'); -- Sydney
-- SELECT * FROM groups; -- Should only see Sydney groups
--
-- 5. Reset to superuser:
-- RESET ROLE;
