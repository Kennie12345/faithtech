-- Migration 012: Row Level Security Policies for Event RSVPs Table
-- Enables RLS and creates policies for event_rsvps
-- Dependencies: 006 (helper functions), 009 (events table), 010 (event_rsvps table)
-- Blocks: Safe querying of event RSVPs

-- =============================================================================
-- EVENT_RSVPS TABLE
-- =============================================================================

ALTER TABLE event_rsvps ENABLE ROW LEVEL SECURITY;

-- SELECT: Everyone can see RSVPs (needed for attendee lists and counts)
DROP POLICY IF EXISTS "Event RSVPs visible to everyone" ON event_rsvps;
CREATE POLICY "Event RSVPs visible to everyone"
  ON event_rsvps
  FOR SELECT
  TO authenticated
  USING (true);

-- INSERT: Members can RSVP to events in their city
DROP POLICY IF EXISTS "Event RSVPs insertable by city members" ON event_rsvps;
CREATE POLICY "Event RSVPs insertable by city members"
  ON event_rsvps
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM events
      WHERE events.id = event_rsvps.event_id
        AND events.city_id = public.current_city()
    )
  );

-- UPDATE: Users can update their own RSVP (change yes/no/maybe)
DROP POLICY IF EXISTS "Event RSVPs updatable by owner" ON event_rsvps;
CREATE POLICY "Event RSVPs updatable by owner"
  ON event_rsvps
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- DELETE: Users can delete their own RSVP (cancel attendance)
DROP POLICY IF EXISTS "Event RSVPs deletable by owner" ON event_rsvps;
CREATE POLICY "Event RSVPs deletable by owner"
  ON event_rsvps
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- =============================================================================
-- COMMENTS
-- =============================================================================

COMMENT ON POLICY "Event RSVPs visible to everyone" ON event_rsvps IS 'RSVPs are public so everyone can see who is attending';
COMMENT ON POLICY "Event RSVPs insertable by city members" ON event_rsvps IS 'Users can only RSVP to events in their own city';
COMMENT ON POLICY "Event RSVPs updatable by owner" ON event_rsvps IS 'Users can change their RSVP status (yes/no/maybe)';
COMMENT ON POLICY "Event RSVPs deletable by owner" ON event_rsvps IS 'Users can cancel their RSVP';

-- =============================================================================
-- TESTING NOTES
-- =============================================================================

-- Test RLS policies with:
--
-- SET ROLE authenticated;
-- SET request.jwt.claims.sub TO 'adelaide-member-uuid';
-- INSERT INTO event_rsvps (event_id, user_id, status) VALUES ('adelaide-event-uuid', 'adelaide-member-uuid', 'yes');
-- -- Should succeed - member RSVPing to event in their city
--
-- INSERT INTO event_rsvps (event_id, user_id, status) VALUES ('sydney-event-uuid', 'adelaide-member-uuid', 'yes');
-- -- Should fail - cannot RSVP to event in different city
--
-- UPDATE event_rsvps SET status = 'maybe' WHERE user_id = 'adelaide-member-uuid';
-- -- Should succeed - updating own RSVP
--
-- DELETE FROM event_rsvps WHERE user_id = 'adelaide-member-uuid';
-- -- Should succeed - deleting own RSVP
--
-- RESET ROLE;
