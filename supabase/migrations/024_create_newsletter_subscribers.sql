-- Migration 024: Create Newsletter Subscribers Table
-- Enables email collection for newsletter campaigns
-- Dependencies: 002 (cities table), 006 (helper functions)
-- Blocks: Newsletter feature functionality

-- =============================================================================
-- NEWSLETTER_SUBSCRIBERS TABLE
-- =============================================================================

CREATE TABLE newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id UUID NOT NULL REFERENCES cities(id) ON DELETE CASCADE,

  email TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,

  -- Metadata
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  unsubscribed_at TIMESTAMPTZ,

  -- Unique constraint: one email per city
  UNIQUE(city_id, email)
);

-- Indexes for common query patterns
CREATE INDEX newsletter_city_idx ON newsletter_subscribers(city_id);
CREATE INDEX newsletter_active_idx ON newsletter_subscribers(is_active, subscribed_at DESC);
CREATE INDEX newsletter_email_idx ON newsletter_subscribers(email);

-- Table comment
COMMENT ON TABLE newsletter_subscribers IS 'Email subscribers for city newsletters. Supports export to external email tools (Mailchimp, etc.)';
COMMENT ON COLUMN newsletter_subscribers.is_active IS 'FALSE when unsubscribed. We keep records for compliance/audit.';
COMMENT ON COLUMN newsletter_subscribers.unsubscribed_at IS 'Timestamp when user unsubscribed (for GDPR compliance)';

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- SELECT: City admins can view their city's subscribers
DROP POLICY IF EXISTS "Newsletter subscribers visible to city admins" ON newsletter_subscribers;
CREATE POLICY "Newsletter subscribers visible to city admins"
  ON newsletter_subscribers
  FOR SELECT
  TO authenticated
  USING (
    public.is_super_admin()
    OR public.user_role(city_id) IN ('city_admin', 'super_admin')
  );

-- INSERT: We do NOT create a public INSERT policy here.
-- Public subscribe uses server action with service_role client to bypass RLS.
-- This is more secure as it requires going through our validation logic.

-- UPDATE: City admins can update (e.g., reactivate a subscriber)
DROP POLICY IF EXISTS "Newsletter subscribers updatable by city admins" ON newsletter_subscribers;
CREATE POLICY "Newsletter subscribers updatable by city admins"
  ON newsletter_subscribers
  FOR UPDATE
  TO authenticated
  USING (
    public.is_super_admin()
    OR public.user_role(city_id) IN ('city_admin', 'super_admin')
  )
  WITH CHECK (
    public.is_super_admin()
    OR public.user_role(city_id) IN ('city_admin', 'super_admin')
  );

-- DELETE: City admins can delete (for GDPR "right to be forgotten")
DROP POLICY IF EXISTS "Newsletter subscribers deletable by city admins" ON newsletter_subscribers;
CREATE POLICY "Newsletter subscribers deletable by city admins"
  ON newsletter_subscribers
  FOR DELETE
  TO authenticated
  USING (
    public.is_super_admin()
    OR public.user_role(city_id) IN ('city_admin', 'super_admin')
  );

-- =============================================================================
-- COMMENTS
-- =============================================================================

COMMENT ON POLICY "Newsletter subscribers visible to city admins" ON newsletter_subscribers IS 'Only city admins and super admins can view subscriber lists';
COMMENT ON POLICY "Newsletter subscribers updatable by city admins" ON newsletter_subscribers IS 'Only city admins can update subscriber status (e.g., reactivate)';
COMMENT ON POLICY "Newsletter subscribers deletable by city admins" ON newsletter_subscribers IS 'Only city admins can delete subscribers (GDPR compliance)';

-- =============================================================================
-- TESTING NOTES
-- =============================================================================

-- Test RLS policies with:
--
-- SET ROLE authenticated;
--
-- -- As a city admin:
-- SET request.jwt.claims.sub TO 'adelaide-admin-uuid';
-- SELECT * FROM newsletter_subscribers WHERE city_id = 'adelaide-city-uuid';
-- -- Should see all subscribers for Adelaide
--
-- -- As a regular member:
-- SET request.jwt.claims.sub TO 'adelaide-member-uuid';
-- SELECT * FROM newsletter_subscribers WHERE city_id = 'adelaide-city-uuid';
-- -- Should see NO subscribers (members can't view subscriber lists)
--
-- -- Public subscribe is done via service_role in server action,
-- -- not via direct INSERT from client
--
-- RESET ROLE;
