-- Migration 017: Posts Table
-- Creates the posts table for blog feature
-- Dependencies: 002 (cities), 003 (profiles via auth.users)
-- Blocks: 018 (RLS policies for posts)

-- Posts table: Blog posts with draft/publish workflow and SEO support
-- Isolated per city via city_id foreign key
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id UUID NOT NULL REFERENCES cities(id) ON DELETE CASCADE,

  -- Content
  title TEXT NOT NULL,
  content TEXT, -- Markdown support for long-form content
  slug TEXT NOT NULL, -- URL-safe identifier (e.g., 'introducing-our-new-initiative')
  excerpt TEXT, -- Short preview/summary for list views and SEO

  -- Publishing & Features
  published_at TIMESTAMPTZ, -- NULL = draft, NOT NULL = published
  is_featured BOOLEAN NOT NULL DEFAULT FALSE, -- Highlighted on homepage

  -- Media
  featured_image_url TEXT, -- Cover image for social sharing (Open Graph)

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Unique slug per city (Adelaide and Sydney can both have same slug)
  UNIQUE(city_id, slug)
);

-- Index for city-based queries (most common filter)
CREATE INDEX IF NOT EXISTS posts_city_idx ON posts(city_id);

-- Index for published posts chronological (public blog list page)
CREATE INDEX IF NOT EXISTS posts_published_idx ON posts(city_id, published_at DESC)
  WHERE published_at IS NOT NULL;

-- Index for featured posts (homepage queries)
CREATE INDEX IF NOT EXISTS posts_featured_idx ON posts(city_id, is_featured, published_at DESC)
  WHERE is_featured = TRUE AND published_at IS NOT NULL;

-- Index for slug lookups (public post detail page)
CREATE INDEX IF NOT EXISTS posts_slug_idx ON posts(slug);

-- Index for creator queries (admin "my posts" view)
CREATE INDEX IF NOT EXISTS posts_created_by_idx ON posts(created_by);

-- Trigger: Auto-update updated_at timestamp
DROP TRIGGER IF EXISTS posts_updated_at ON posts;
CREATE TRIGGER posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments for documentation
COMMENT ON TABLE posts IS 'Blog posts with draft/publish workflow and SEO support. City-scoped.';
COMMENT ON COLUMN posts.slug IS 'URL-safe identifier for routing (e.g., /adelaide/blog/introducing-new-initiative)';
COMMENT ON COLUMN posts.content IS 'Post content in Markdown format (supports headings, lists, links, code blocks)';
COMMENT ON COLUMN posts.excerpt IS 'Short preview/summary for list views and SEO meta descriptions';
COMMENT ON COLUMN posts.published_at IS 'NULL = draft (visible only to creator/admin), NOT NULL = published (public)';
COMMENT ON COLUMN posts.is_featured IS 'TRUE if city admin has featured this post (shows on homepage)';
COMMENT ON COLUMN posts.featured_image_url IS 'Cover image URL for social sharing (Open Graph, Twitter Cards)';
COMMENT ON COLUMN posts.created_by IS 'User who created the post';
