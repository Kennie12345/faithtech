-- Migration 002: Cities Table
-- Creates the core cities table for multi-tenancy
-- Dependencies: 001 (uuid-ossp extension)
-- Blocks: ALL feature tables (they reference city_id)

-- Cities table: Core entity for multi-tenant architecture
-- Each city has its own isolated data via city_id foreign keys
CREATE TABLE IF NOT EXISTS cities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identity
  name TEXT NOT NULL,
  slug TEXT NOT NULL, -- URL-safe identifier (e.g., 'adelaide', 'sydney')

  -- Branding
  logo_url TEXT, -- Path to logo in Supabase Storage
  hero_image_url TEXT, -- Homepage hero image
  accent_color TEXT DEFAULT '#6366f1', -- Tailwind indigo-500 default

  -- Status
  is_active BOOLEAN NOT NULL DEFAULT true,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ -- Soft delete support
);

-- Unique constraint on slug (used for routing /[citySlug]/...)
CREATE UNIQUE INDEX IF NOT EXISTS cities_slug_unique ON cities(slug) WHERE deleted_at IS NULL;

-- Index for filtering active cities
CREATE INDEX IF NOT EXISTS cities_active_idx ON cities(is_active) WHERE deleted_at IS NULL;

-- Trigger: Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS cities_updated_at ON cities;
CREATE TRIGGER cities_updated_at
  BEFORE UPDATE ON cities
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments for documentation
COMMENT ON TABLE cities IS 'FaithTech cities/regions. Core entity for multi-tenant data isolation.';
COMMENT ON COLUMN cities.slug IS 'URL-safe identifier for routing (e.g., /adelaide/events)';
COMMENT ON COLUMN cities.accent_color IS 'Hex color for city branding (used in UI theming)';
COMMENT ON COLUMN cities.deleted_at IS 'Soft delete timestamp - NULL means active';
