-- Migration 015: Row Level Security Policies for Projects Table
-- Enables RLS and creates policies for projects
-- Dependencies: 006 (helper functions), 013 (projects table)
-- Blocks: Safe querying of projects

-- =============================================================================
-- PROJECTS TABLE
-- =============================================================================

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- SELECT: Members of a city can see projects in that city
DROP POLICY IF EXISTS "Projects visible to city members" ON projects;
CREATE POLICY "Projects visible to city members"
  ON projects
  FOR SELECT
  TO authenticated
  USING (
    city_id = public.current_city()
    OR public.is_super_admin()
  );

-- INSERT: Any authenticated member can submit projects
-- This differs from events where only admins can create
DROP POLICY IF EXISTS "Projects insertable by city members" ON projects;
CREATE POLICY "Projects insertable by city members"
  ON projects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    city_id = public.current_city()
    AND created_by = auth.uid()
  );

-- UPDATE: Project creator OR city admin can edit
-- This allows members to edit their own submissions
DROP POLICY IF EXISTS "Projects updatable by creator or admin" ON projects;
CREATE POLICY "Projects updatable by creator or admin"
  ON projects
  FOR UPDATE
  TO authenticated
  USING (
    public.is_super_admin()
    OR created_by = auth.uid()
    OR public.user_role(city_id) IN ('city_admin', 'super_admin')
  )
  WITH CHECK (
    public.is_super_admin()
    OR created_by = auth.uid()
    OR public.user_role(city_id) IN ('city_admin', 'super_admin')
  );

-- DELETE: City admins only (members cannot delete their own projects)
DROP POLICY IF EXISTS "Projects deletable by city admin" ON projects;
CREATE POLICY "Projects deletable by city admin"
  ON projects
  FOR DELETE
  TO authenticated
  USING (
    public.is_super_admin()
    OR public.user_role(city_id) IN ('city_admin', 'super_admin')
  );

-- =============================================================================
-- COMMENTS
-- =============================================================================

COMMENT ON POLICY "Projects visible to city members" ON projects IS 'Projects are city-scoped - members of a city see projects in that city';
COMMENT ON POLICY "Projects insertable by city members" ON projects IS 'Any authenticated member can submit projects to their city';
COMMENT ON POLICY "Projects updatable by creator or admin" ON projects IS 'Project creators can edit their own projects, city admins can edit any project';
COMMENT ON POLICY "Projects deletable by city admin" ON projects IS 'Only city admins can delete projects (not project creators)';

-- =============================================================================
-- TESTING NOTES
-- =============================================================================

-- Test RLS policies with:
--
-- SET ROLE authenticated;
-- SET request.jwt.claims.sub TO 'adelaide-member-uuid';
-- INSERT INTO projects (city_id, title, slug, created_by) VALUES ('adelaide-city-uuid', 'Test Project', 'test', 'adelaide-member-uuid');
-- -- Should succeed - members can submit projects
--
-- UPDATE projects SET title = 'Updated Title' WHERE created_by = 'adelaide-member-uuid';
-- -- Should succeed - creator can update their own project
--
-- SET request.jwt.claims.sub TO 'different-member-uuid';
-- UPDATE projects SET title = 'Hacked' WHERE created_by = 'adelaide-member-uuid';
-- -- Should fail - cannot update other members' projects
--
-- SET request.jwt.claims.sub TO 'adelaide-admin-uuid';
-- UPDATE projects SET is_featured = TRUE WHERE city_id = 'adelaide-city-uuid';
-- -- Should succeed - admin can update any project in their city
--
-- DELETE FROM projects WHERE created_by = 'adelaide-member-uuid';
-- -- Should succeed - admin can delete projects
--
-- SET request.jwt.claims.sub TO 'adelaide-member-uuid';
-- DELETE FROM projects WHERE created_by = 'adelaide-member-uuid';
-- -- Should fail - members cannot delete their own projects
--
-- RESET ROLE;
