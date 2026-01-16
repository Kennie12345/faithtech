/**
 * Settings Feature Server Actions
 * All database operations for city settings and feature toggles
 */

'use server';

import { createClient } from '@/lib/supabase/server';
import { getCurrentCityId, isAdmin, getCity } from '@/lib/core/api';
import { revalidatePath } from 'next/cache';
import type {
  CityFeature,
  CityProfile,
  UpdateCityProfileInput,
  ActionResult,
  FeatureSlug,
} from './types';

// =============================================================================
// CITY PROFILE ACTIONS
// =============================================================================

/**
 * Get city profile for current city (admin only)
 * @returns City profile or null
 */
export async function getCityProfile(): Promise<CityProfile | null> {
  const cityId = await getCurrentCityId();
  if (!cityId) return null;

  const admin = await isAdmin(cityId);
  if (!admin) return null;

  const city = await getCity(cityId);
  if (!city) return null;

  return {
    id: city.id,
    name: city.name,
    slug: city.slug,
    logo_url: city.logo_url,
    hero_image_url: city.hero_image_url,
    accent_color: city.accent_color,
    is_active: city.is_active,
  };
}

/**
 * Update city profile (admin only)
 * @param updates - Fields to update
 * @returns Success or error
 */
export async function updateCityProfile(
  updates: UpdateCityProfileInput
): Promise<ActionResult<CityProfile>> {
  const supabase = await createClient();
  const cityId = await getCurrentCityId();

  if (!cityId) {
    return { error: 'No city context' };
  }

  const admin = await isAdmin(cityId);
  if (!admin) {
    return { error: 'Unauthorized' };
  }

  // Validate name if provided
  if (updates.name !== undefined && updates.name.trim().length < 2) {
    return { error: 'City name must be at least 2 characters' };
  }

  // Validate accent color if provided
  if (updates.accent_color !== undefined) {
    const validColors = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#06B6D4'];
    if (!validColors.includes(updates.accent_color)) {
      return { error: 'Invalid accent color' };
    }
  }

  const { data, error } = await supabase
    .from('cities')
    .update({
      ...(updates.name && { name: updates.name.trim() }),
      ...(updates.logo_url !== undefined && { logo_url: updates.logo_url }),
      ...(updates.hero_image_url !== undefined && { hero_image_url: updates.hero_image_url }),
      ...(updates.accent_color && { accent_color: updates.accent_color }),
    })
    .eq('id', cityId)
    .select('id, name, slug, logo_url, hero_image_url, accent_color, is_active')
    .single();

  if (error) {
    console.error('updateCityProfile error:', error);
    return { error: 'Failed to update city profile' };
  }

  revalidatePath('/protected/admin/settings');
  return { data: data as CityProfile };
}

// =============================================================================
// FEATURE TOGGLE ACTIONS
// =============================================================================

/**
 * Get all feature toggles for current city
 * @returns Array of feature toggles
 */
export async function getFeatureToggles(): Promise<CityFeature[]> {
  const supabase = await createClient();
  const cityId = await getCurrentCityId();

  if (!cityId) {
    console.error('getFeatureToggles: No city context');
    return [];
  }

  const admin = await isAdmin(cityId);
  if (!admin) {
    console.error('getFeatureToggles: Unauthorized');
    return [];
  }

  const { data, error } = await supabase
    .from('city_features')
    .select('*')
    .eq('city_id', cityId)
    .order('feature_slug');

  if (error) {
    console.error('getFeatureToggles error:', error);
    return [];
  }

  return data as CityFeature[];
}

/**
 * Toggle a feature on/off (admin only)
 * @param featureSlug - Feature to toggle
 * @param enabled - New state
 * @returns Success or error
 */
export async function toggleFeature(
  featureSlug: FeatureSlug,
  enabled: boolean
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

  // Validate feature slug
  const validFeatures: FeatureSlug[] = ['events', 'blog', 'projects', 'newsletter'];
  if (!validFeatures.includes(featureSlug)) {
    return { error: 'Invalid feature' };
  }

  // Upsert the feature toggle (create if doesn't exist, update if does)
  const { error } = await supabase
    .from('city_features')
    .upsert(
      {
        city_id: cityId,
        feature_slug: featureSlug,
        is_enabled: enabled,
      },
      {
        onConflict: 'city_id,feature_slug',
      }
    );

  if (error) {
    console.error('toggleFeature error:', error);
    return { error: 'Failed to toggle feature' };
  }

  revalidatePath('/protected/admin/settings');
  return { data: undefined };
}

/**
 * Check if a feature is enabled for a city
 * Can be called without admin access for public UI conditionals
 * @param cityId - City to check
 * @param featureSlug - Feature to check
 * @returns Whether the feature is enabled
 */
export async function isFeatureEnabled(
  cityId: string,
  featureSlug: FeatureSlug
): Promise<boolean> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('city_features')
    .select('is_enabled')
    .eq('city_id', cityId)
    .eq('feature_slug', featureSlug)
    .single();

  if (error) {
    // Default to enabled if no record exists
    return true;
  }

  return data.is_enabled;
}

/**
 * Get all enabled features for a city (for public UI)
 * @param cityId - City to check
 * @returns Object with feature states
 */
export async function getEnabledFeatures(
  cityId: string
): Promise<Record<FeatureSlug, boolean>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('city_features')
    .select('feature_slug, is_enabled')
    .eq('city_id', cityId);

  // Default all features to enabled
  const features: Record<FeatureSlug, boolean> = {
    events: true,
    blog: true,
    projects: true,
    newsletter: true,
  };

  if (error) {
    console.error('getEnabledFeatures error:', error);
    return features;
  }

  // Override with actual values from database
  data.forEach((item) => {
    const slug = item.feature_slug as FeatureSlug;
    if (slug in features) {
      features[slug] = item.is_enabled;
    }
  });

  return features;
}
