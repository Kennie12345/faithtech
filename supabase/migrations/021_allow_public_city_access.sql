-- Migration 021: Allow public access to view active cities
-- This enables the homepage city directory to work for unauthenticated users
-- while maintaining member-based access for authenticated users.

-- Drop the existing policy if it exists (for idempotency)
DROP POLICY IF EXISTS "Public can view active cities" ON cities;

-- Create new policy: Anonymous users can view active, non-deleted cities
CREATE POLICY "Public can view active cities"
  ON cities
  FOR SELECT
  TO anon  -- Anonymous (unauthenticated) users only
  USING (
    is_active = true
    AND deleted_at IS NULL
  );

-- Note: The existing "Cities visible to members" policy (for authenticated users)
-- remains in place and takes precedence for logged-in users, allowing them to see
-- cities based on their membership or super admin status.
