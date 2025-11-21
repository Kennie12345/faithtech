-- Migration 016: Row Level Security Policies for Project Members Table
-- Enables RLS and creates policies for project_members
-- Dependencies: 006 (helper functions), 013 (projects table), 014 (project_members table)
-- Blocks: Safe querying of project members

-- =============================================================================
-- PROJECT_MEMBERS TABLE
-- =============================================================================

ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;

-- SELECT: Everyone can see project team members (needed for public project pages)
DROP POLICY IF EXISTS "Project members visible to everyone" ON project_members;
CREATE POLICY "Project members visible to everyone"
  ON project_members
  FOR SELECT
  TO authenticated
  USING (true);

-- INSERT: Project creator OR city admin can add team members
DROP POLICY IF EXISTS "Project members insertable by project creator or admin" ON project_members;
CREATE POLICY "Project members insertable by project creator or admin"
  ON project_members
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM projects
      WHERE projects.id = project_members.project_id
        AND (
          projects.created_by = auth.uid()
          OR public.is_super_admin()
          OR public.user_role(projects.city_id) IN ('city_admin', 'super_admin')
        )
    )
  );

-- UPDATE: Project creator OR city admin can update team member roles
DROP POLICY IF EXISTS "Project members updatable by project creator or admin" ON project_members;
CREATE POLICY "Project members updatable by project creator or admin"
  ON project_members
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM projects
      WHERE projects.id = project_members.project_id
        AND (
          projects.created_by = auth.uid()
          OR public.is_super_admin()
          OR public.user_role(projects.city_id) IN ('city_admin', 'super_admin')
        )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM projects
      WHERE projects.id = project_members.project_id
        AND (
          projects.created_by = auth.uid()
          OR public.is_super_admin()
          OR public.user_role(projects.city_id) IN ('city_admin', 'super_admin')
        )
    )
  );

-- DELETE: Project creator OR city admin can remove team members
DROP POLICY IF EXISTS "Project members deletable by project creator or admin" ON project_members;
CREATE POLICY "Project members deletable by project creator or admin"
  ON project_members
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM projects
      WHERE projects.id = project_members.project_id
        AND (
          projects.created_by = auth.uid()
          OR public.is_super_admin()
          OR public.user_role(projects.city_id) IN ('city_admin', 'super_admin')
        )
    )
  );

-- =============================================================================
-- COMMENTS
-- =============================================================================

COMMENT ON POLICY "Project members visible to everyone" ON project_members IS 'Team members are public so everyone can see who worked on each project';
COMMENT ON POLICY "Project members insertable by project creator or admin" ON project_members IS 'Only project creator or city admin can add team members';
COMMENT ON POLICY "Project members updatable by project creator or admin" ON project_members IS 'Only project creator or city admin can update team member roles';
COMMENT ON POLICY "Project members deletable by project creator or admin" ON project_members IS 'Only project creator or city admin can remove team members';

-- =============================================================================
-- TESTING NOTES
-- =============================================================================

-- Test RLS policies with:
--
-- SET ROLE authenticated;
-- SET request.jwt.claims.sub TO 'project-creator-uuid';
-- INSERT INTO project_members (project_id, user_id, role) VALUES ('their-project-uuid', 'teammate-uuid', 'contributor');
-- -- Should succeed - creator can add team members to their project
--
-- SET request.jwt.claims.sub TO 'different-member-uuid';
-- INSERT INTO project_members (project_id, user_id, role) VALUES ('not-their-project-uuid', 'random-uuid', 'contributor');
-- -- Should fail - cannot add team members to someone else's project
--
-- SET request.jwt.claims.sub TO 'city-admin-uuid';
-- INSERT INTO project_members (project_id, user_id, role) VALUES ('any-project-uuid', 'teammate-uuid', 'lead');
-- -- Should succeed - admin can add team members to any project in their city
--
-- UPDATE project_members SET role = 'lead' WHERE project_id = 'their-project-uuid';
-- -- Should succeed - admin can update roles
--
-- DELETE FROM project_members WHERE project_id = 'their-project-uuid';
-- -- Should succeed - admin can remove team members
--
-- RESET ROLE;
