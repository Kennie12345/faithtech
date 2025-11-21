-- Migration 011: Row Level Security Policies for Events Table
-- Enables RLS and creates policies for events
-- Dependencies: 006 (helper functions), 009 (events table)
-- Blocks: Safe querying of events

-- =============================================================================
-- EVENTS TABLE
-- =============================================================================

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- SELECT: Members of a city can see events in that city
DROP POLICY IF EXISTS "Events visible to city members" ON events;
CREATE POLICY "Events visible to city members"
  ON events
  FOR SELECT
  TO authenticated
  USING (
    city_id = public.current_city()
    OR public.is_super_admin()
  );

-- INSERT: City admins only
DROP POLICY IF EXISTS "Events insertable by city admin" ON events;
CREATE POLICY "Events insertable by city admin"
  ON events
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_super_admin()
    OR public.user_role(city_id) IN ('city_admin', 'super_admin')
  );

-- UPDATE: City admins only
DROP POLICY IF EXISTS "Events updatable by city admin" ON events;
CREATE POLICY "Events updatable by city admin"
  ON events
  FOR UPDATE
  TO authenticated
  USING (
    public.is_super_admin()
    OR public.user_role(city_id) IN ('city_admin', 'super_admin')
  )
  WITH CHECK (
    public.is_super_admin()
    OR public.user_role(city_id) IN ('city_admin', 'super_admin')
  );

-- DELETE: City admins only
DROP POLICY IF EXISTS "Events deletable by city admin" ON events;
CREATE POLICY "Events deletable by city admin"
  ON events
  FOR DELETE
  TO authenticated
  USING (
    public.is_super_admin()
    OR public.user_role(city_id) IN ('city_admin', 'super_admin')
  );

-- =============================================================================
-- COMMENTS
-- =============================================================================

COMMENT ON POLICY "Events visible to city members" ON events IS 'Events are city-scoped - members of a city see events in that city';
COMMENT ON POLICY "Events insertable by city admin" ON events IS 'Only city admins can create events';
COMMENT ON POLICY "Events updatable by city admin" ON events IS 'Only city admins can update events';
COMMENT ON POLICY "Events deletable by city admin" ON events IS 'Only city admins can delete events';

-- =============================================================================
-- TESTING NOTES
-- =============================================================================

-- Test RLS policies with:
--
-- SET ROLE authenticated;
-- SET request.jwt.claims.sub TO 'adelaide-admin-uuid';
-- INSERT INTO events (city_id, title, slug, starts_at) VALUES ('adelaide-city-uuid', 'Test Event', 'test', NOW());
-- -- Should succeed for city admin
--
-- SET request.jwt.claims.sub TO 'adelaide-member-uuid';
-- INSERT INTO events (city_id, title, slug, starts_at) VALUES ('adelaide-city-uuid', 'Test Event 2', 'test2', NOW());
-- -- Should fail - members cannot create events
--
-- RESET ROLE;
