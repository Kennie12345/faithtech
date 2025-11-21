-- Migration 022: Fix Infinite Recursion in user_city_roles RLS Policy
-- Problem: The SELECT policy on user_city_roles was querying user_city_roles itself,
--          causing infinite recursion when checking permissions
-- Solution: Create helper function that bypasses RLS using SECURITY DEFINER

-- =============================================================================
-- HELPER FUNCTION: Check if user is city admin in a specific city
-- =============================================================================

-- This function bypasses RLS by using SECURITY DEFINER
-- It's safe because it only checks the current user's own roles
CREATE OR REPLACE FUNCTION public.is_city_admin_in(target_city_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM user_city_roles
    WHERE user_id = auth.uid()
      AND city_id = target_city_id
      AND role IN ('city_admin', 'super_admin')
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_city_admin_in(UUID) TO authenticated;

COMMENT ON FUNCTION public.is_city_admin_in(UUID) IS
  'Returns true if current user is a city_admin or super_admin in the specified city. Uses SECURITY DEFINER to bypass RLS and prevent infinite recursion.';

-- =============================================================================
-- FIX RLS POLICIES ON user_city_roles
-- =============================================================================

-- Drop the problematic policy
DROP POLICY IF EXISTS "User city roles visible to user and city admins" ON user_city_roles;

-- Recreate with fixed logic using helper function
CREATE POLICY "User city roles visible to user and city admins"
  ON user_city_roles
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()  -- Users see their own roles
    OR public.is_super_admin()  -- Super admins see all
    OR public.is_city_admin_in(city_id)  -- City admins see roles in their city
  );

-- Fix INSERT policy (had same issue)
DROP POLICY IF EXISTS "User city roles insertable by city admin" ON user_city_roles;

CREATE POLICY "User city roles insertable by city admin"
  ON user_city_roles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_super_admin()
    OR (
      -- City admin adding member to their own city
      public.is_city_admin_in(city_id)
      -- Can only assign 'member' role (not escalate to admin)
      AND role = 'member'
    )
  );

-- Fix DELETE policy (had same issue)
DROP POLICY IF EXISTS "User city roles deletable by user or admin" ON user_city_roles;

CREATE POLICY "User city roles deletable by user or admin"
  ON user_city_roles
  FOR DELETE
  TO authenticated
  USING (
    user_id = auth.uid()  -- User leaving city
    OR public.is_super_admin()
    OR public.is_city_admin_in(city_id)  -- City admin removing member from their city
  );

-- =============================================================================
-- TESTING
-- =============================================================================

-- To verify the fix works:
-- 1. Reset database: supabase db reset
-- 2. Check no infinite recursion errors when querying user_city_roles
-- 3. Test permissions work correctly for regular users, city admins, and super admins