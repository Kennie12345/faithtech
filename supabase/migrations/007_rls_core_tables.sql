-- Migration 007: Row Level Security Policies for Core Tables
-- Enables RLS and creates policies for multi-tenant data isolation
-- Dependencies: 006 (helper functions: auth.current_city(), auth.user_role(), auth.is_super_admin())
-- Blocks: Safe querying of core tables

-- =============================================================================
-- CITIES TABLE
-- =============================================================================

ALTER TABLE cities ENABLE ROW LEVEL SECURITY;

-- SELECT: Users can see cities they are members of + super admins see all
CREATE POLICY "Cities visible to members"
  ON cities
  FOR SELECT
  TO authenticated
  USING (
    auth.is_super_admin()
    OR id IN (
      SELECT city_id
      FROM user_city_roles
      WHERE user_id = auth.uid()
    )
  );

-- INSERT: Super admin only
CREATE POLICY "Cities insertable by super admin"
  ON cities
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.is_super_admin());

-- UPDATE: Super admin only
CREATE POLICY "Cities updatable by super admin"
  ON cities
  FOR UPDATE
  TO authenticated
  USING (auth.is_super_admin())
  WITH CHECK (auth.is_super_admin());

-- DELETE: Super admin only
CREATE POLICY "Cities deletable by super admin"
  ON cities
  FOR DELETE
  TO authenticated
  USING (auth.is_super_admin());

-- =============================================================================
-- PROFILES TABLE
-- =============================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- SELECT: Public - anyone can view profiles (needed for author attribution)
CREATE POLICY "Profiles visible to everyone"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (true);

-- INSERT: Users can only create their own profile
CREATE POLICY "Profiles insertable by owner"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

-- UPDATE: Users can only update their own profile
CREATE POLICY "Profiles updatable by owner"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- DELETE: Users can delete their own profile OR super admin
CREATE POLICY "Profiles deletable by owner or super admin"
  ON profiles
  FOR DELETE
  TO authenticated
  USING (id = auth.uid() OR auth.is_super_admin());

-- =============================================================================
-- USER_CITY_ROLES TABLE
-- =============================================================================

ALTER TABLE user_city_roles ENABLE ROW LEVEL SECURITY;

-- SELECT: Users see their own memberships + city admins see their city's members + super admin sees all
CREATE POLICY "User city roles visible to user and city admins"
  ON user_city_roles
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR auth.is_super_admin()
    OR (
      city_id IN (
        SELECT city_id
        FROM user_city_roles
        WHERE user_id = auth.uid()
          AND role IN ('city_admin', 'super_admin')
      )
    )
  );

-- INSERT: City admins can add members to their city, super admins can add anyone anywhere
CREATE POLICY "User city roles insertable by city admin"
  ON user_city_roles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.is_super_admin()
    OR (
      -- City admin adding member to their own city
      city_id IN (
        SELECT city_id
        FROM user_city_roles
        WHERE user_id = auth.uid()
          AND role IN ('city_admin', 'super_admin')
      )
      -- Can only assign 'member' role (not escalate to admin)
      AND role = 'member'
    )
  );

-- UPDATE: Super admin only (role changes are sensitive)
CREATE POLICY "User city roles updatable by super admin"
  ON user_city_roles
  FOR UPDATE
  TO authenticated
  USING (auth.is_super_admin())
  WITH CHECK (auth.is_super_admin());

-- DELETE: Users can leave cities OR admins can remove members
CREATE POLICY "User city roles deletable by user or admin"
  ON user_city_roles
  FOR DELETE
  TO authenticated
  USING (
    user_id = auth.uid() -- User leaving city
    OR auth.is_super_admin()
    OR (
      -- City admin removing member from their city
      city_id IN (
        SELECT city_id
        FROM user_city_roles
        WHERE user_id = auth.uid()
          AND role IN ('city_admin', 'super_admin')
      )
    )
  );

-- =============================================================================
-- GROUPS TABLE
-- =============================================================================

ALTER TABLE groups ENABLE ROW LEVEL SECURITY;

-- SELECT: Members of a city can see groups in that city
CREATE POLICY "Groups visible to city members"
  ON groups
  FOR SELECT
  TO authenticated
  USING (
    city_id = auth.current_city()
    OR auth.is_super_admin()
  );

-- INSERT: City admins only
CREATE POLICY "Groups insertable by city admin"
  ON groups
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.is_super_admin()
    OR auth.user_role(city_id) IN ('city_admin', 'super_admin')
  );

-- UPDATE: City admins only
CREATE POLICY "Groups updatable by city admin"
  ON groups
  FOR UPDATE
  TO authenticated
  USING (
    auth.is_super_admin()
    OR auth.user_role(city_id) IN ('city_admin', 'super_admin')
  )
  WITH CHECK (
    auth.is_super_admin()
    OR auth.user_role(city_id) IN ('city_admin', 'super_admin')
  );

-- DELETE: City admins only
CREATE POLICY "Groups deletable by city admin"
  ON groups
  FOR DELETE
  TO authenticated
  USING (
    auth.is_super_admin()
    OR auth.user_role(city_id) IN ('city_admin', 'super_admin')
  );

-- =============================================================================
-- GROUP_MEMBERS TABLE
-- =============================================================================

ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;

-- SELECT: Members of the city can see group membership
CREATE POLICY "Group members visible to city members"
  ON group_members
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM groups
      WHERE groups.id = group_members.group_id
        AND (groups.city_id = auth.current_city() OR auth.is_super_admin())
    )
  );

-- INSERT: Users can join public groups OR admins can add to any group
CREATE POLICY "Group members insertable by user or admin"
  ON group_members
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid() -- User joining themselves
    OR auth.is_super_admin()
    OR EXISTS (
      -- City admin adding member to group in their city
      SELECT 1
      FROM groups
      WHERE groups.id = group_members.group_id
        AND auth.user_role(groups.city_id) IN ('city_admin', 'super_admin')
    )
  );

-- DELETE: Users can leave groups OR admins can remove members
CREATE POLICY "Group members deletable by user or admin"
  ON group_members
  FOR DELETE
  TO authenticated
  USING (
    user_id = auth.uid() -- User leaving group
    OR auth.is_super_admin()
    OR EXISTS (
      -- City admin removing member from group in their city
      SELECT 1
      FROM groups
      WHERE groups.id = group_members.group_id
        AND auth.user_role(groups.city_id) IN ('city_admin', 'super_admin')
    )
  );

-- =============================================================================
-- COMMENTS
-- =============================================================================

COMMENT ON POLICY "Cities visible to members" ON cities IS 'Users can only see cities they are members of (prevents data leakage)';
COMMENT ON POLICY "Profiles visible to everyone" ON profiles IS 'Public profiles enable author attribution on blog posts, projects, etc.';
COMMENT ON POLICY "User city roles visible to user and city admins" ON user_city_roles IS 'City admins can see their city''s members for member management UI';
COMMENT ON POLICY "Groups visible to city members" ON groups IS 'Groups are city-scoped - members of a city see groups in that city';

-- =============================================================================
-- TESTING NOTES
-- =============================================================================

-- Test RLS policies with:
--
-- SET ROLE authenticated;
-- SET request.jwt.claims.sub TO 'adelaide-user-uuid';
-- SELECT * FROM cities; -- Should only see Adelaide
--
-- SET request.jwt.claims.sub TO 'sydney-user-uuid';
-- SELECT * FROM cities; -- Should only see Sydney
--
-- RESET ROLE;
