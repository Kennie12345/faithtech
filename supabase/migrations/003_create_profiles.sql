-- Migration 003: Profiles Table
-- Extends auth.users with additional profile information
-- Dependencies: Supabase auth.users (built-in)
-- Blocks: User-generated content (needs created_by foreign keys)

-- Profiles table: Extended user information beyond auth.users
-- One-to-one relationship with auth.users
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Identity
  display_name TEXT, -- Defaults to email until user updates
  avatar_url TEXT, -- Path to avatar in Supabase Storage

  -- Bio
  bio TEXT,

  -- Social links
  linkedin_url TEXT,
  github_url TEXT,
  website_url TEXT,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Trigger: Auto-update updated_at timestamp
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Index for lookups (though id is already PK)
CREATE INDEX profiles_id_idx ON profiles(id);

-- Comments for documentation
COMMENT ON TABLE profiles IS 'Extended user profile information beyond Supabase auth.users';
COMMENT ON COLUMN profiles.id IS 'Foreign key to auth.users(id) - one-to-one relationship';
COMMENT ON COLUMN profiles.display_name IS 'Public display name (shown in content attribution, comments, etc.)';
COMMENT ON COLUMN profiles.avatar_url IS 'Path to avatar image in Supabase Storage (e.g., avatars/user-id.jpg)';

-- Note: Profile creation happens in two places:
-- 1. Email confirmation flow (app/auth/confirm/route.ts should INSERT into profiles)
-- 2. OAuth callback (if we add social login later)
-- Both should emit 'user:created' event via Event Bus
