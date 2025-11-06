-- Migration 010: Event RSVPs Table
-- Creates the event_rsvps table for tracking event attendance
-- Dependencies: 009 (events), 003 (profiles via auth.users)
-- Blocks: None

-- Event RSVPs table: User responses to events (yes/no/maybe)
-- One RSVP per user per event (enforced by unique constraint)
CREATE TABLE event_rsvps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- RSVP status
  status TEXT NOT NULL DEFAULT 'yes' CHECK (status IN ('yes', 'no', 'maybe')),

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- One RSVP per user per event
  UNIQUE(event_id, user_id)
);

-- Index for event-based queries (show all RSVPs for an event)
CREATE INDEX event_rsvps_event_idx ON event_rsvps(event_id);

-- Index for user-based queries (show all events a user RSVP'd to)
CREATE INDEX event_rsvps_user_idx ON event_rsvps(user_id);

-- Index for status filtering (count 'yes' RSVPs)
CREATE INDEX event_rsvps_status_idx ON event_rsvps(status);

-- Comments for documentation
COMMENT ON TABLE event_rsvps IS 'User RSVPs to events. One RSVP per user per event.';
COMMENT ON COLUMN event_rsvps.status IS 'RSVP response: yes (attending), no (not attending), maybe (tentative)';
COMMENT ON COLUMN event_rsvps.created_at IS 'When the user first RSVP''d (updated RSVPs keep original timestamp)';
