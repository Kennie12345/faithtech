-- Migration 020: Add is_featured to Events Table
-- Adds featured flag to events for homepage display
-- Dependencies: 009 (events table)

-- Add is_featured column to events table
ALTER TABLE events
ADD COLUMN is_featured BOOLEAN NOT NULL DEFAULT FALSE;

-- Create index for featured event queries (homepage performance)
CREATE INDEX IF NOT EXISTS events_is_featured_idx ON events(is_featured) WHERE is_featured = TRUE;

-- Comment for documentation
COMMENT ON COLUMN events.is_featured IS 'Featured events shown on city homepage. Used for highlighting key community gatherings.';
