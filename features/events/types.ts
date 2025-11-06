/**
 * Events Feature Types
 * TypeScript types matching the database schema
 */

// Event status type
export type RSVPStatus = 'yes' | 'no' | 'maybe';

// Event from database
export interface Event {
  id: string;
  city_id: string;
  title: string;
  description: string | null;
  slug: string;
  starts_at: string; // ISO 8601 timestamp
  ends_at: string | null; // ISO 8601 timestamp
  location_name: string | null;
  location_address: string | null;
  location_url: string | null;
  max_attendees: number | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

// Event RSVP from database
export interface EventRSVP {
  id: string;
  event_id: string;
  user_id: string;
  status: RSVPStatus;
  created_at: string;
}

// Event with RSVP counts (for list views)
export interface EventWithCounts extends Event {
  rsvp_yes_count: number;
  rsvp_no_count: number;
  rsvp_maybe_count: number;
  total_rsvps: number;
}

// Event RSVP with user profile (for admin view)
export interface EventRSVPWithProfile extends EventRSVP {
  profile: {
    id: string;
    display_name: string | null;
    avatar_url: string | null;
  };
}

// Input types for creating/updating events
export interface CreateEventInput {
  city_id: string;
  title: string;
  description?: string | null;
  slug: string;
  starts_at: string;
  ends_at?: string | null;
  location_name?: string | null;
  location_address?: string | null;
  location_url?: string | null;
  max_attendees?: number | null;
  created_by: string;
}

export interface UpdateEventInput {
  title?: string;
  description?: string | null;
  starts_at?: string;
  ends_at?: string | null;
  location_name?: string | null;
  location_address?: string | null;
  location_url?: string | null;
  max_attendees?: number | null;
}

// Input type for RSVP
export interface CreateRSVPInput {
  event_id: string;
  user_id: string;
  status: RSVPStatus;
}

// Server action return types
export interface ActionResult<T = void> {
  data?: T;
  error?: string;
}
