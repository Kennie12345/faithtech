-- Migration 005: Groups Tables
-- Creates groups and group memberships (optional feature for MVP)
-- Dependencies: 002 (cities), auth.users (built-in)
-- Blocks: Nothing (optional feature, can be built without UI in Phase 1)

-- Groups table: Community groups within a city
-- Examples: "Web Developers", "Prayer Team", "Event Volunteers"
CREATE TABLE groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Multi-tenant isolation: Groups belong to a city
  city_id UUID NOT NULL REFERENCES cities(id) ON DELETE CASCADE,

  -- Identity
  name TEXT NOT NULL,
  description TEXT,

  -- Privacy
  is_public BOOLEAN NOT NULL DEFAULT true, -- Public groups visible to all, private require invitation

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Constraint: Group names must be unique within a city
  CONSTRAINT groups_city_name_unique UNIQUE (city_id, name)
);

-- Group members: Junction table for users in groups
CREATE TABLE group_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Relationships
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Metadata
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Constraint: A user can only join a group once
  CONSTRAINT group_member_unique UNIQUE (group_id, user_id)
);

-- Indexes for groups
CREATE INDEX groups_city_idx ON groups(city_id);
CREATE INDEX groups_public_idx ON groups(is_public) WHERE is_public = true;

-- Indexes for group_members
CREATE INDEX group_members_group_idx ON group_members(group_id);
CREATE INDEX group_members_user_idx ON group_members(user_id);

-- Triggers: Auto-update updated_at timestamp
CREATE TRIGGER groups_updated_at
  BEFORE UPDATE ON groups
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments for documentation
COMMENT ON TABLE groups IS 'Community groups within a city (e.g., "Web Developers", "Prayer Team")';
COMMENT ON TABLE group_members IS 'Junction table: tracks which users are members of which groups';
COMMENT ON COLUMN groups.is_public IS 'Public groups visible to all members, private groups require invitation';
COMMENT ON CONSTRAINT groups_city_name_unique ON groups IS 'Group names must be unique within a city (but can duplicate across cities)';

-- Note: This feature is included in schema but UI is optional for Phase 1
-- Can be used for future features like:
-- - Group-based event invitations
-- - Private project teams
-- - Skill-based communities
