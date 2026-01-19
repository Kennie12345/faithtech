/**
 * Newsletter Feature Server Actions
 * All database operations for newsletter subscribers
 */

'use server';

import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import { getCurrentCityId, isAdmin, getCityBySlug } from '@/lib/core/api';
import { emitEvent } from '@/lib/core/events';
import { revalidatePath } from 'next/cache';
import { subscribeSchema, unsubscribeSchema } from './schemas';
import type { NewsletterSubscriber, ActionResult, ExportResult } from './types';

// =============================================================================
// PUBLIC ACTIONS (No auth required)
// =============================================================================

/**
 * Subscribe to newsletter (public action)
 * Uses service role client to bypass RLS for unauthenticated users
 *
 * @param email - Email address to subscribe
 * @param citySlug - City slug (e.g., 'adelaide')
 * @returns Success or error
 */
export async function subscribeToNewsletter(
  email: string,
  citySlug: string
): Promise<ActionResult<{ id: string }>> {
  try {
    // Look up city by slug first (using regular client for public read)
    const city = await getCityBySlug(citySlug);
    if (!city) {
      return { error: 'City not found' };
    }

    // Validate input
    const validation = subscribeSchema.safeParse({
      email: email.trim().toLowerCase(),
      city_id: city.id,
    });

    if (!validation.success) {
      return { error: validation.error.issues[0]?.message || 'Invalid input' };
    }

    // Use service role client to bypass RLS for public insert
    const supabase = createServiceClient();

    // Check if already subscribed
    const { data: existing } = await supabase
      .from('newsletter_subscribers')
      .select('id, is_active')
      .eq('city_id', city.id)
      .eq('email', validation.data.email)
      .single();

    if (existing) {
      if (existing.is_active) {
        return { error: 'You are already subscribed to this newsletter' };
      }

      // Reactivate subscription
      const { data, error } = await supabase
        .from('newsletter_subscribers')
        .update({
          is_active: true,
          subscribed_at: new Date().toISOString(),
          unsubscribed_at: null,
        })
        .eq('id', existing.id)
        .select('id')
        .single();

      if (error) {
        console.error('subscribeToNewsletter reactivation error:', error);
        return { error: 'Failed to subscribe. Please try again.' };
      }

      emitEvent('subscriber:added', { email: validation.data.email, cityId: city.id });
      return { data: { id: data.id } };
    }

    // Create new subscription
    const { data, error } = await supabase
      .from('newsletter_subscribers')
      .insert({
        city_id: city.id,
        email: validation.data.email,
      })
      .select('id')
      .single();

    if (error) {
      console.error('subscribeToNewsletter error:', error);
      if (error.code === '23505') {
        // Unique constraint violation
        return { error: 'You are already subscribed to this newsletter' };
      }
      return { error: 'Failed to subscribe. Please try again.' };
    }

    emitEvent('subscriber:added', { email: validation.data.email, cityId: city.id });
    return { data: { id: data.id } };
  } catch (error) {
    console.error('subscribeToNewsletter unexpected error:', error);
    return { error: 'An unexpected error occurred' };
  }
}

/**
 * Unsubscribe from newsletter (public action)
 * Uses service role client to bypass RLS
 *
 * @param email - Email address to unsubscribe
 * @param citySlug - City slug
 * @returns Success or error
 */
export async function unsubscribeFromNewsletter(
  email: string,
  citySlug: string
): Promise<ActionResult> {
  try {
    // Look up city by slug
    const city = await getCityBySlug(citySlug);
    if (!city) {
      return { error: 'City not found' };
    }

    // Validate input
    const validation = unsubscribeSchema.safeParse({
      email: email.trim().toLowerCase(),
      city_id: city.id,
    });

    if (!validation.success) {
      return { error: validation.error.issues[0]?.message || 'Invalid input' };
    }

    // Use service role client
    const supabase = createServiceClient();

    const { error } = await supabase
      .from('newsletter_subscribers')
      .update({
        is_active: false,
        unsubscribed_at: new Date().toISOString(),
      })
      .eq('city_id', city.id)
      .eq('email', validation.data.email)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return { error: 'Email not found in our subscriber list' };
      }
      console.error('unsubscribeFromNewsletter error:', error);
      return { error: 'Failed to unsubscribe. Please try again.' };
    }

    emitEvent('subscriber:removed', { email: validation.data.email, cityId: city.id });
    return { data: undefined };
  } catch (error) {
    console.error('unsubscribeFromNewsletter unexpected error:', error);
    return { error: 'An unexpected error occurred' };
  }
}

// =============================================================================
// ADMIN ACTIONS (Auth required)
// =============================================================================

/**
 * Get all subscribers for current city (admin only)
 * @returns Array of subscribers
 */
export async function getSubscribers(): Promise<NewsletterSubscriber[]> {
  const supabase = await createClient();
  const cityId = await getCurrentCityId();

  if (!cityId) {
    console.error('getSubscribers: No city context');
    return [];
  }

  const admin = await isAdmin(cityId);
  if (!admin) {
    console.error('getSubscribers: Unauthorized');
    return [];
  }

  const { data, error } = await supabase
    .from('newsletter_subscribers')
    .select('*')
    .eq('city_id', cityId)
    .order('subscribed_at', { ascending: false });

  if (error) {
    console.error('getSubscribers error:', error);
    return [];
  }

  return data as NewsletterSubscriber[];
}

/**
 * Get active subscribers count for current city
 * @returns Count of active subscribers
 */
export async function getActiveSubscriberCount(): Promise<number> {
  const supabase = await createClient();
  const cityId = await getCurrentCityId();

  if (!cityId) return 0;

  const admin = await isAdmin(cityId);
  if (!admin) return 0;

  const { count, error } = await supabase
    .from('newsletter_subscribers')
    .select('*', { count: 'exact', head: true })
    .eq('city_id', cityId)
    .eq('is_active', true);

  if (error) {
    console.error('getActiveSubscriberCount error:', error);
    return 0;
  }

  return count ?? 0;
}

/**
 * Export subscribers as CSV (admin only)
 * @returns CSV string with subscriber data
 */
export async function exportSubscribersCSV(): Promise<ExportResult> {
  const supabase = await createClient();
  const cityId = await getCurrentCityId();

  if (!cityId) {
    return { error: 'No city context' };
  }

  const admin = await isAdmin(cityId);
  if (!admin) {
    return { error: 'Unauthorized' };
  }

  const { data, error } = await supabase
    .from('newsletter_subscribers')
    .select('email, subscribed_at')
    .eq('city_id', cityId)
    .eq('is_active', true)
    .order('subscribed_at', { ascending: false });

  if (error) {
    console.error('exportSubscribersCSV error:', error);
    return { error: 'Failed to export subscribers' };
  }

  // Generate CSV
  const header = 'Email,Subscribed At';
  const rows = data.map((s) => `${s.email},${s.subscribed_at}`);
  const csv = [header, ...rows].join('\n');

  return { csv, count: data.length };
}

/**
 * Delete a subscriber permanently (admin only, GDPR right to be forgotten)
 * @param subscriberId - Subscriber ID to delete
 */
export async function deleteSubscriber(
  subscriberId: string
): Promise<ActionResult> {
  const supabase = await createClient();
  const cityId = await getCurrentCityId();

  if (!cityId) {
    return { error: 'No city context' };
  }

  const admin = await isAdmin(cityId);
  if (!admin) {
    return { error: 'Unauthorized' };
  }

  // Fetch subscriber email before deletion for event
  const { data: subscriber } = await supabase
    .from('newsletter_subscribers')
    .select('email')
    .eq('id', subscriberId)
    .eq('city_id', cityId)
    .single();

  const { error } = await supabase
    .from('newsletter_subscribers')
    .delete()
    .eq('id', subscriberId)
    .eq('city_id', cityId);

  if (error) {
    console.error('deleteSubscriber error:', error);
    return { error: 'Failed to delete subscriber' };
  }

  if (subscriber) {
    emitEvent('subscriber:removed', { email: subscriber.email, cityId });
  }

  revalidatePath('/protected/admin/newsletter');
  return { data: undefined };
}

/**
 * Reactivate a subscriber (admin only)
 * @param subscriberId - Subscriber ID to reactivate
 */
export async function reactivateSubscriber(
  subscriberId: string
): Promise<ActionResult> {
  const supabase = await createClient();
  const cityId = await getCurrentCityId();

  if (!cityId) {
    return { error: 'No city context' };
  }

  const admin = await isAdmin(cityId);
  if (!admin) {
    return { error: 'Unauthorized' };
  }

  const { data, error } = await supabase
    .from('newsletter_subscribers')
    .update({
      is_active: true,
      subscribed_at: new Date().toISOString(),
      unsubscribed_at: null,
    })
    .eq('id', subscriberId)
    .eq('city_id', cityId)
    .select('email')
    .single();

  if (error) {
    console.error('reactivateSubscriber error:', error);
    return { error: 'Failed to reactivate subscriber' };
  }

  emitEvent('subscriber:added', { email: data.email, cityId });
  revalidatePath('/protected/admin/newsletter');
  return { data: undefined };
}
