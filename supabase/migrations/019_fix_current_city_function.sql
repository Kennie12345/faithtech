-- Migration 019: Fix public.current_city() Function
-- Fixes the MIN(uuid) error in the current_city() function
-- Dependencies: 006 (original function definition)
-- Issue: PostgreSQL has no MIN() aggregate for UUID type

-- Replace the broken function with corrected version
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
  -- FIXED: Split into two queries to avoid MIN(uuid) error
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

COMMENT ON FUNCTION public.current_city() IS 'Returns current city_id from session context or user''s only city. Used by RLS policies for multi-tenant filtering. FIXED: Removed MIN(uuid) error.';
