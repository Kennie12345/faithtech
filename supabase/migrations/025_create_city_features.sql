-- Migration 025: Create City Features Table
-- Enables feature toggles per city (Events, Blog, Projects, Newsletter)
-- Dependencies: 002 (cities table), 006 (helper functions)
-- Blocks: Admin settings feature toggle functionality

-- =============================================================================
-- CITY_FEATURES TABLE
-- =============================================================================

CREATE TABLE city_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id UUID NOT NULL REFERENCES cities(id) ON DELETE CASCADE,

  -- Feature identification
  feature_slug TEXT NOT NULL, -- 'events', 'blog', 'projects', 'newsletter'

  -- Toggle state
  is_enabled BOOLEAN NOT NULL DEFAULT TRUE,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Unique constraint: one entry per feature per city
  UNIQUE(city_id, feature_slug)
);

-- Index for common query pattern
CREATE INDEX city_features_city_idx ON city_features(city_id);
CREATE INDEX city_features_enabled_idx ON city_features(city_id, is_enabled) WHERE is_enabled = true;

-- Trigger: Auto-update updated_at timestamp
DROP TRIGGER IF EXISTS city_features_updated_at ON city_features;
CREATE TRIGGER city_features_updated_at
  BEFORE UPDATE ON city_features
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Table comments
COMMENT ON TABLE city_features IS 'Feature toggles per city. Allows city admins to enable/disable features.';
COMMENT ON COLUMN city_features.feature_slug IS 'Feature identifier: events, blog, projects, newsletter';
COMMENT ON COLUMN city_features.is_enabled IS 'Whether the feature is enabled for this city';

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE city_features ENABLE ROW LEVEL SECURITY;

-- SELECT: City admins and super admins can view feature settings
-- Public users need this for conditional UI rendering
DROP POLICY IF EXISTS "City features visible to all" ON city_features;
CREATE POLICY "City features visible to all"
  ON city_features
  FOR SELECT
  TO authenticated, anon
  USING (true);

-- INSERT: Only city admins and super admins
DROP POLICY IF EXISTS "City features insertable by admins" ON city_features;
CREATE POLICY "City features insertable by admins"
  ON city_features
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_super_admin()
    OR public.user_role(city_id) IN ('city_admin', 'super_admin')
  );

-- UPDATE: Only city admins and super admins
DROP POLICY IF EXISTS "City features updatable by admins" ON city_features;
CREATE POLICY "City features updatable by admins"
  ON city_features
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

-- DELETE: Only super admins (feature toggles shouldn't normally be deleted)
DROP POLICY IF EXISTS "City features deletable by super admins" ON city_features;
CREATE POLICY "City features deletable by super admins"
  ON city_features
  FOR DELETE
  TO authenticated
  USING (
    public.is_super_admin()
  );

-- =============================================================================
-- SEED DEFAULT FEATURES FOR EXISTING CITIES
-- =============================================================================

-- Insert default feature settings for all existing cities
-- All features enabled by default
INSERT INTO city_features (city_id, feature_slug, is_enabled)
SELECT
  c.id,
  f.feature_slug,
  true
FROM cities c
CROSS JOIN (
  SELECT 'events' AS feature_slug
  UNION ALL SELECT 'blog'
  UNION ALL SELECT 'projects'
  UNION ALL SELECT 'newsletter'
) f
WHERE c.deleted_at IS NULL
ON CONFLICT (city_id, feature_slug) DO NOTHING;

-- =============================================================================
-- HELPER FUNCTION
-- =============================================================================

-- Function to check if a feature is enabled for a city
CREATE OR REPLACE FUNCTION public.is_feature_enabled(p_city_id UUID, p_feature_slug TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT COALESCE(
    (SELECT is_enabled FROM city_features WHERE city_id = p_city_id AND feature_slug = p_feature_slug),
    true  -- Default to enabled if no record exists
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_feature_enabled(UUID, TEXT) TO authenticated, anon;

COMMENT ON FUNCTION public.is_feature_enabled(UUID, TEXT) IS 'Check if a feature is enabled for a city. Returns true if no record exists (default enabled).';

-- =============================================================================
-- COMMENTS
-- =============================================================================

COMMENT ON POLICY "City features visible to all" ON city_features IS 'Anyone can read feature settings for UI conditionals';
COMMENT ON POLICY "City features insertable by admins" ON city_features IS 'Only city admins and super admins can add feature toggles';
COMMENT ON POLICY "City features updatable by admins" ON city_features IS 'Only city admins and super admins can toggle features';
COMMENT ON POLICY "City features deletable by super admins" ON city_features IS 'Only super admins can delete feature records (rare operation)';
