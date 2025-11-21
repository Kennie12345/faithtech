-- Migration 006: Helper Functions
-- Creates SQL functions used by RLS policies for authorization
-- Dependencies: 004 (user_city_roles table)
-- Blocks: 007 (RLS policies reference these functions)

-- Function: public.current_city()
-- Returns the current city_id for the authenticated user
-- Used by RLS policies to filter data by city
--
-- How it works:
-- 1. Reads 'app.current_city_id' session variable (set by application via SET LOCAL)
-- 2. Falls back to user's first city if only member of one city
-- 3. Returns NULL if ambiguous (user in multiple cities without explicit selection)
--
-- Application must set context via:
-- SET LOCAL app.current_city_id = 'uuid-here';
CREATE OR REPLACE FUNCTION public.current_city()
RETURNS UUID
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
DECLARE
  city_id_from_session TEXT;
  user_city_count INT;
  first_city_id UUID;
BEGIN
  -- Try to get city_id from session variable (set by application)
  BEGIN
    city_id_from_session := current_setting('app.current_city_id', true);
    IF city_id_from_session IS NOT NULL AND city_id_from_session != '' THEN
      RETURN city_id_from_session::UUID;
    END IF;
  EXCEPTION
    WHEN OTHERS THEN
      -- Setting doesn't exist, continue to fallback logic
      NULL;
  END;

  -- Fallback: If user is only a member of ONE city, return that city
  SELECT COUNT(*)
  INTO user_city_count
  FROM user_city_roles
  WHERE user_id = auth.uid();

  IF user_city_count = 1 THEN
    SELECT city_id
    INTO first_city_id
    FROM user_city_roles
    WHERE user_id = auth.uid()
    LIMIT 1;
    RETURN first_city_id;
  END IF;

  -- If user is in 0 or multiple cities, return NULL
  -- Application should show city selector and set session variable
  RETURN NULL;
END;
$$;

-- Function: public.user_role(city_id UUID)
-- Returns the user's role in a specific city
-- Used by RLS policies to check permissions
--
-- Returns:
-- - 'super_admin', 'city_admin', or 'member' if user has access to the city
-- - NULL if user is not a member of the city
CREATE OR REPLACE FUNCTION public.user_role(city_id UUID)
RETURNS user_role
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT role
  FROM user_city_roles
  WHERE user_id = auth.uid()
    AND user_city_roles.city_id = $1
  LIMIT 1;
$$;

-- Function: public.is_super_admin()
-- Convenience function to check if current user is a super admin in ANY city
-- Super admins have global access across all cities
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM user_city_roles
    WHERE user_id = auth.uid()
      AND role = 'super_admin'
  );
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION public.current_city() TO authenticated;
GRANT EXECUTE ON FUNCTION public.user_role(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_super_admin() TO authenticated;

-- Comments for documentation
COMMENT ON FUNCTION public.current_city() IS 'Returns current_city_id from session context or user''s only city. Used by RLS policies for multi-tenant filtering.';
COMMENT ON FUNCTION public.user_role(UUID) IS 'Returns user''s role (super_admin, city_admin, member) in the specified city. Returns NULL if not a member.';
COMMENT ON FUNCTION public.is_super_admin() IS 'Returns true if user has super_admin role in any city. Super admins have global access.';

-- Performance note: These functions are marked STABLE (not VOLATILE)
-- This allows PostgreSQL to cache results within a single query for better performance
-- The application MUST set session context at the start of each request:
--
-- Example in Server Component:
-- const supabase = await createClient();
-- if (cityId) {
--   await supabase.rpc('set_city_context', { city_id: cityId });
-- }
--
-- Create the RPC wrapper for setting context:
CREATE OR REPLACE FUNCTION public.set_city_context(city_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  PERFORM set_config('app.current_city_id', city_id::TEXT, false);
END;
$$;

GRANT EXECUTE ON FUNCTION public.set_city_context(UUID) TO authenticated;

COMMENT ON FUNCTION public.set_city_context(UUID) IS 'Sets the current city context for the session. Call this at the start of each request.';
