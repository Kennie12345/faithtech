/**
 * Events Feature Server Actions
 * All database operations for events and RSVPs
 */

'use server';

import { createClient } from '@/lib/supabase/server';
import { getUser, getCurrentCityId, isAdmin } from '@/lib/core/api';
import { emitEvent } from '@/lib/core/events';
import { revalidatePath } from 'next/cache';
import { slugify, generateUniqueSlug } from '@/lib/utils/slugify';
import type {
  EventRSVP,
  EventWithCounts,
  EventRSVPWithProfile,
  RSVPStatus,
  ActionResult,
} from './types';

// =============================================================================
// EVENT CRUD OPERATIONS
// =============================================================================

/**
 * Get all events for a city
 * @param cityId - Optional city ID (defaults to current city)
 * @param upcomingOnly - Filter to only show upcoming events
 * @param featuredOnly - Filter to only show featured events
 * @param limit - Optional limit on number of results
 * @returns Array of events with RSVP counts
 */
export async function getEvents(
  cityId?: string,
  upcomingOnly: boolean = false,
  featuredOnly: boolean = false,
  limit?: number
): Promise<EventWithCounts[]> {
  const supabase = await createClient();
  const targetCityId = cityId || (await getCurrentCityId());

  if (!targetCityId) {
    console.error('getEvents: No city context');
    return [];
  }

  let query = supabase
    .from('events')
    .select(
      `
      *,
      rsvp_yes_count:event_rsvps(count).eq.status.yes,
      rsvp_no_count:event_rsvps(count).eq.status.no,
      rsvp_maybe_count:event_rsvps(count).eq.status.maybe,
      total_rsvps:event_rsvps(count)
    `
    )
    .eq('city_id', targetCityId)
    .order('starts_at', { ascending: false });

  if (upcomingOnly) {
    query = query.gte('starts_at', new Date().toISOString());
  }

  if (featuredOnly) {
    query = query.eq('is_featured', true);
  }

  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error('getEvents error:', error);
    return [];
  }

  return data as unknown as EventWithCounts[];
}

/**
 * Get a single event by ID
 * @param eventId - Event UUID
 * @returns Event with RSVP counts or null
 */
export async function getEvent(eventId: string): Promise<EventWithCounts | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('events')
    .select(
      `
      *,
      rsvp_yes_count:event_rsvps(count).eq.status.yes,
      rsvp_no_count:event_rsvps(count).eq.status.no,
      rsvp_maybe_count:event_rsvps(count).eq.status.maybe,
      total_rsvps:event_rsvps(count)
    `
    )
    .eq('id', eventId)
    .single();

  if (error) {
    console.error('getEvent error:', error);
    return null;
  }

  return data as unknown as EventWithCounts;
}

/**
 * Get event by slug and city
 * @param cityId - City UUID
 * @param slug - Event slug
 * @returns Event with RSVP counts or null
 */
export async function getEventBySlug(
  cityId: string,
  slug: string
): Promise<EventWithCounts | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('events')
    .select(
      `
      *,
      rsvp_yes_count:event_rsvps(count).eq.status.yes,
      rsvp_no_count:event_rsvps(count).eq.status.no,
      rsvp_maybe_count:event_rsvps(count).eq.status.maybe,
      total_rsvps:event_rsvps(count)
    `
    )
    .eq('city_id', cityId)
    .eq('slug', slug)
    .single();

  if (error) {
    console.error('getEventBySlug error:', error);
    return null;
  }

  return data as unknown as EventWithCounts;
}

/**
 * Create a new event
 * @param formData - Form data from event creation form
 * @returns Action result with event ID or error
 */
export async function createEvent(formData: FormData): Promise<ActionResult<{ id: string }>> {
  const supabase = await createClient();

  // Get current user and city
  const user = await getUser();
  const cityId = await getCurrentCityId();

  if (!user || !cityId) {
    return { error: 'Not authenticated or no city context' };
  }

  // Check authorization
  const userIsAdmin = await isAdmin(cityId);
  if (!userIsAdmin) {
    return { error: 'Unauthorized - only city admins can create events' };
  }

  // Parse form data
  const title = formData.get('title') as string;
  const description = formData.get('description') as string | null;
  const starts_at = formData.get('starts_at') as string;
  const ends_at = (formData.get('ends_at') as string) || null;
  const location_name = (formData.get('location_name') as string) || null;
  const location_address = (formData.get('location_address') as string) || null;
  const location_url = (formData.get('location_url') as string) || null;
  const max_attendees_str = formData.get('max_attendees') as string;
  const max_attendees = max_attendees_str ? parseInt(max_attendees_str) : null;

  // Generate unique slug
  const baseSlug = slugify(title);
  const slug = await generateUniqueSlug(baseSlug, async (testSlug) => {
    const { data } = await supabase
      .from('events')
      .select('id')
      .eq('city_id', cityId)
      .eq('slug', testSlug)
      .single();
    return !!data;
  });

  // Insert event
  const { data, error } = await supabase
    .from('events')
    .insert({
      city_id: cityId,
      title,
      description,
      slug,
      starts_at,
      ends_at,
      location_name,
      location_address,
      location_url,
      max_attendees,
      created_by: user.id,
    })
    .select()
    .single();

  if (error) {
    console.error('createEvent error:', error);
    return { error: error.message };
  }

  // Emit event
  emitEvent('event:created', {
    eventId: data.id,
    cityId,
    createdBy: user.id,
  });

  // Revalidate cache
  revalidatePath('/protected/admin/events');
  revalidatePath(`/[citySlug]/events`, 'page');

  return { data: { id: data.id } };
}

/**
 * Update an existing event
 * @param eventId - Event UUID
 * @param formData - Form data from event edit form
 * @returns Action result with success or error
 */
export async function updateEvent(
  eventId: string,
  formData: FormData
): Promise<ActionResult> {
  const supabase = await createClient();

  // Get current user and city
  const user = await getUser();
  const cityId = await getCurrentCityId();

  if (!user || !cityId) {
    return { error: 'Not authenticated or no city context' };
  }

  // Check authorization
  const userIsAdmin = await isAdmin(cityId);
  if (!userIsAdmin) {
    return { error: 'Unauthorized - only city admins can update events' };
  }

  // Verify event belongs to current city
  const { data: existingEvent } = await supabase
    .from('events')
    .select('city_id')
    .eq('id', eventId)
    .single();

  if (!existingEvent || existingEvent.city_id !== cityId) {
    return { error: 'Event not found or access denied' };
  }

  // Parse form data
  const updates: Record<string, any> = {};
  const title = formData.get('title') as string;
  if (title) updates.title = title;

  const description = formData.get('description');
  if (description !== undefined) updates.description = description || null;

  const starts_at = formData.get('starts_at') as string;
  if (starts_at) updates.starts_at = starts_at;

  const ends_at = formData.get('ends_at');
  if (ends_at !== undefined) updates.ends_at = ends_at || null;

  const location_name = formData.get('location_name');
  if (location_name !== undefined) updates.location_name = location_name || null;

  const location_address = formData.get('location_address');
  if (location_address !== undefined) updates.location_address = location_address || null;

  const location_url = formData.get('location_url');
  if (location_url !== undefined) updates.location_url = location_url || null;

  const max_attendees_str = formData.get('max_attendees') as string;
  if (max_attendees_str !== undefined) {
    updates.max_attendees = max_attendees_str ? parseInt(max_attendees_str) : null;
  }

  // Update event
  const { error } = await supabase
    .from('events')
    .update(updates)
    .eq('id', eventId);

  if (error) {
    console.error('updateEvent error:', error);
    return { error: error.message };
  }

  // Emit event
  emitEvent('event:updated', {
    eventId,
    cityId,
    updatedBy: user.id,
  });

  // Revalidate cache
  revalidatePath('/protected/admin/events');
  revalidatePath(`/protected/admin/events/${eventId}`);
  revalidatePath(`/[citySlug]/events`, 'page');

  return { data: undefined };
}

/**
 * Delete an event
 * @param eventId - Event UUID
 * @returns Action result with success or error
 */
export async function deleteEvent(eventId: string): Promise<ActionResult> {
  const supabase = await createClient();

  // Get current user and city
  const user = await getUser();
  const cityId = await getCurrentCityId();

  if (!user || !cityId) {
    return { error: 'Not authenticated or no city context' };
  }

  // Check authorization
  const userIsAdmin = await isAdmin(cityId);
  if (!userIsAdmin) {
    return { error: 'Unauthorized - only city admins can delete events' };
  }

  // Verify event belongs to current city
  const { data: existingEvent } = await supabase
    .from('events')
    .select('city_id')
    .eq('id', eventId)
    .single();

  if (!existingEvent || existingEvent.city_id !== cityId) {
    return { error: 'Event not found or access denied' };
  }

  // Delete event (RSVPs will cascade delete)
  const { error } = await supabase.from('events').delete().eq('id', eventId);

  if (error) {
    console.error('deleteEvent error:', error);
    return { error: error.message };
  }

  // Emit event
  emitEvent('event:deleted', {
    eventId,
    cityId,
    deletedBy: user.id,
  });

  // Revalidate cache
  revalidatePath('/protected/admin/events');
  revalidatePath(`/[citySlug]/events`, 'page');

  return { data: undefined };
}

// =============================================================================
// RSVP OPERATIONS
// =============================================================================

/**
 * Get all RSVPs for an event with user profiles
 * @param eventId - Event UUID
 * @returns Array of RSVPs with user profiles
 */
export async function getEventRSVPs(eventId: string): Promise<EventRSVPWithProfile[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('event_rsvps')
    .select(
      `
      *,
      profile:profiles(id, display_name, avatar_url)
    `
    )
    .eq('event_id', eventId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('getEventRSVPs error:', error);
    return [];
  }

  return data as unknown as EventRSVPWithProfile[];
}

/**
 * Get current user's RSVP for an event
 * @param eventId - Event UUID
 * @returns RSVP or null
 */
export async function getUserRSVP(eventId: string): Promise<EventRSVP | null> {
  const supabase = await createClient();
  const user = await getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from('event_rsvps')
    .select('*')
    .eq('event_id', eventId)
    .eq('user_id', user.id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // No RSVP found
    console.error('getUserRSVP error:', error);
    return null;
  }

  return data as EventRSVP;
}

/**
 * Create or update an RSVP
 * @param eventId - Event UUID
 * @param status - RSVP status (yes/no/maybe)
 * @returns Action result with success or error
 */
export async function rsvpToEvent(
  eventId: string,
  status: RSVPStatus
): Promise<ActionResult> {
  const supabase = await createClient();

  // Get current user
  const user = await getUser();
  if (!user) {
    return { error: 'Not authenticated' };
  }

  // Verify event exists and belongs to current city
  const cityId = await getCurrentCityId();
  if (!cityId) {
    return { error: 'No city context' };
  }

  const event = await getEvent(eventId);
  if (!event) {
    return { error: 'Event not found' };
  }

  if (event.city_id !== cityId) {
    return { error: 'Cannot RSVP to event in different city' };
  }

  // Check capacity
  if (
    status === 'yes' &&
    event.max_attendees &&
    event.rsvp_yes_count >= event.max_attendees
  ) {
    return { error: 'Event is at capacity' };
  }

  // Upsert RSVP
  const { error } = await supabase
    .from('event_rsvps')
    .upsert(
      {
        event_id: eventId,
        user_id: user.id,
        status,
      },
      {
        onConflict: 'event_id,user_id',
      }
    )
    .select()
    .single();

  if (error) {
    console.error('rsvpToEvent error:', error);
    return { error: error.message };
  }

  // Emit event
  emitEvent('event:rsvp_added', {
    eventId,
    userId: user.id,
    status,
  });

  // Revalidate cache
  revalidatePath(`/[citySlug]/events`, 'page');
  revalidatePath(`/protected/admin/events/${eventId}`);

  return { data: undefined };
}

/**
 * Remove an RSVP
 * @param eventId - Event UUID
 * @returns Action result with success or error
 */
export async function removeRSVP(eventId: string): Promise<ActionResult> {
  const supabase = await createClient();

  // Get current user
  const user = await getUser();
  if (!user) {
    return { error: 'Not authenticated' };
  }

  // Delete RSVP
  const { error } = await supabase
    .from('event_rsvps')
    .delete()
    .eq('event_id', eventId)
    .eq('user_id', user.id);

  if (error) {
    console.error('removeRSVP error:', error);
    return { error: error.message };
  }

  // Emit event
  emitEvent('event:rsvp_removed', {
    eventId,
    userId: user.id,
  });

  // Revalidate cache
  revalidatePath(`/[citySlug]/events`, 'page');
  revalidatePath(`/protected/admin/events/${eventId}`);

  return { data: undefined };
}
