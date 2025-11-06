-- Migration 014: Project Members Table
-- Creates the project_members table for tracking project team members
-- Dependencies: 013 (projects), 003 (profiles via auth.users)
-- Blocks: None

-- Project Members table: Team members for each project (lead, contributors)
-- One user can be on multiple projects, one project can have multiple team members
CREATE TABLE project_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Team role
  role TEXT NOT NULL DEFAULT 'contributor' CHECK (role IN ('lead', 'contributor')),

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- One user can only be added once per project
  UNIQUE(project_id, user_id)
);

-- Index for project-based queries (show all team members for a project)
CREATE INDEX project_members_project_idx ON project_members(project_id);

-- Index for user-based queries (show all projects a user is part of)
CREATE INDEX project_members_user_idx ON project_members(user_id);

-- Index for role filtering (find project leads)
CREATE INDEX project_members_role_idx ON project_members(role);

-- Comments for documentation
COMMENT ON TABLE project_members IS 'Team members for projects. One user per project (unique constraint).';
COMMENT ON COLUMN project_members.role IS 'Team role: lead (project owner/leader) or contributor (team member)';
COMMENT ON COLUMN project_members.created_at IS 'When the user was added to the project team';
