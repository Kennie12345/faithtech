-- Migration 013: Projects Table
-- Creates the projects table for project showcase feature
-- Dependencies: 002 (cities), 003 (profiles via auth.users)
-- Blocks: 014 (project_members references projects)

-- Projects table: Community project showcases (CREATE hackathons, tech-for-good initiatives)
-- Isolated per city via city_id foreign key
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id UUID NOT NULL REFERENCES cities(id) ON DELETE CASCADE,

  -- Project details
  title TEXT NOT NULL,
  description TEXT, -- Markdown support
  slug TEXT NOT NULL, -- URL-safe identifier (e.g., 'prayer-app')

  -- Project specifics
  problem_statement TEXT, -- What problem does it solve?
  solution TEXT, -- How does it solve it?

  -- Links
  github_url TEXT, -- GitHub repository URL
  demo_url TEXT, -- Live demo or deployed app URL
  image_url TEXT, -- Project screenshot or logo

  -- Featured flag (city admin can highlight best projects)
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Unique slug per city (Adelaide and Sydney can both have 'prayer-app' slug)
  UNIQUE(city_id, slug)
);

-- Index for city-based queries (most common filter)
CREATE INDEX IF NOT EXISTS projects_city_idx ON projects(city_id);

-- Index for featured projects (homepage queries)
CREATE INDEX IF NOT EXISTS projects_featured_idx ON projects(city_id, is_featured, created_at DESC);

-- Index for slug lookups
CREATE INDEX IF NOT EXISTS projects_slug_idx ON projects(slug);

-- Index for creator queries
CREATE INDEX IF NOT EXISTS projects_created_by_idx ON projects(created_by);

-- Trigger: Auto-update updated_at timestamp
DROP TRIGGER IF EXISTS projects_updated_at ON projects;
CREATE TRIGGER projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments for documentation
COMMENT ON TABLE projects IS 'Community project showcases (CREATE hackathons, tech-for-good initiatives). City-scoped.';
COMMENT ON COLUMN projects.slug IS 'URL-safe identifier for routing (e.g., /adelaide/projects/prayer-app)';
COMMENT ON COLUMN projects.description IS 'Project description in Markdown format';
COMMENT ON COLUMN projects.problem_statement IS 'What problem does this project solve?';
COMMENT ON COLUMN projects.solution IS 'How does this project solve the problem?';
COMMENT ON COLUMN projects.is_featured IS 'TRUE if city admin has featured this project (shows on homepage)';
COMMENT ON COLUMN projects.created_by IS 'User who submitted the project';
