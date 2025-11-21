-- Migration 004: User City Roles Table
-- Enables multi-tenant membership with role-based permissions
-- Dependencies: 001 (user_role enum), 002 (cities), auth.users (built-in)
-- Blocks: 006 (helper functions query this), 007 (RLS policies use helper functions)

-- User-City-Roles table: Junction table for many-to-many relationship
-- A user can be a member of multiple cities with different roles in each
-- Example: Alice is 'city_admin' in Adelaide and 'member' in Sydney
CREATE TABLE IF NOT EXISTS user_city_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relationships
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  city_id UUID NOT NULL REFERENCES cities(id) ON DELETE CASCADE,

  -- Permission level for this user in this city
  role user_role NOT NULL DEFAULT 'member',

  -- Metadata
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Constraint: A user can only have ONE role per city
  CONSTRAINT user_city_unique UNIQUE (user_id, city_id)
);

-- Index: Fast lookup of all cities for a user
CREATE INDEX IF NOT EXISTS user_city_roles_user_idx ON user_city_roles(user_id);

-- Index: Fast lookup of all members of a city
CREATE INDEX IF NOT EXISTS user_city_roles_city_idx ON user_city_roles(city_id);

-- Index: Fast lookup by role (e.g., find all city admins)
CREATE INDEX IF NOT EXISTS user_city_roles_role_idx ON user_city_roles(role);

-- Composite index: Optimizes public.user_role(city_id) lookups
CREATE INDEX IF NOT EXISTS user_city_roles_user_city_idx ON user_city_roles(user_id, city_id);

-- Comments for documentation
COMMENT ON TABLE user_city_roles IS 'Multi-tenant membership: tracks which users belong to which cities and their role in each';
COMMENT ON COLUMN user_city_roles.role IS 'Permission level: super_admin (global), city_admin (city-scoped), member (read + contribute)';
COMMENT ON CONSTRAINT user_city_unique ON user_city_roles IS 'Prevents duplicate memberships - user can only have one role per city';

-- Note: This table is queried by:
-- 1. public.current_city() - gets the active city_id for the current user session
-- 2. public.user_role(city_id) - checks user's role in a specific city
-- 3. ALL RLS policies - indirectly via the helper functions above
-- Performance is CRITICAL - ensure indexes exist before adding data
