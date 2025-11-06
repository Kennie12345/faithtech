-- Migration 009: Events Table
-- Creates the events table for event management feature
-- Dependencies: 002 (cities), 003 (profiles via auth.users)
-- Blocks: 010 (event_rsvps references events)

-- Events table: Community events with RSVPs
-- Isolated per city via city_id foreign key
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  city_id UUID NOT NULL REFERENCES cities(id) ON DELETE CASCADE,

  -- Event details
  title TEXT NOT NULL,
  description TEXT, -- Markdown support
  slug TEXT NOT NULL, -- URL-safe identifier (e.g., 'community-meetup')

  -- Date & Location
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ, -- NULL = no end time specified
  location_name TEXT, -- e.g., "St Paul's Church"
  location_address TEXT, -- Full address for maps
  location_url TEXT, -- Google Maps link or venue website

  -- Capacity
  max_attendees INT CHECK (max_attendees > 0), -- NULL = unlimited

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Unique slug per city (Adelaide and Sydney can both have 'meetup' slug)
  UNIQUE(city_id, slug)
);

-- Index for city-based queries (most common filter)
CREATE INDEX events_city_idx ON events(city_id);

-- Index for chronological queries (show upcoming events)
CREATE INDEX events_starts_at_idx ON events(starts_at DESC);

-- Index for creator queries
CREATE INDEX events_created_by_idx ON events(created_by);

-- Trigger: Auto-update updated_at timestamp
CREATE TRIGGER events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments for documentation
COMMENT ON TABLE events IS 'Community events with date, location, and RSVP support. City-scoped.';
COMMENT ON COLUMN events.slug IS 'URL-safe identifier for routing (e.g., /adelaide/events/meetup)';
COMMENT ON COLUMN events.description IS 'Event description in Markdown format';
COMMENT ON COLUMN events.max_attendees IS 'Maximum RSVP capacity. NULL = unlimited attendees.';
COMMENT ON COLUMN events.created_by IS 'User who created the event (city admin)';
