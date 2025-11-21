/**
 * Core API Module
 *
 * Provides a consistent interface for database operations across all features.
 * All functions use per-request Supabase client pattern for serverless compatibility.
 *
 * CRITICAL: Features MUST use CoreAPI instead of direct Supabase queries to ensure:
 * 1. Consistent authorization checks
 * 2. Proper multi-tenant isolation
 * 3. Type safety
 * 4. Centralized error handling
 */

import { createClient } from '@/lib/supabase/server';

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

export type UserRole = 'super_admin' | 'city_admin' | 'member';

export interface City {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  hero_image_url: string | null;
  accent_color: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  linkedin_url: string | null;
  github_url: string | null;
  website_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserCityRole {
  id: string;
  user_id: string;
  city_id: string;
  role: UserRole;
  joined_at: string;
}

export interface Group {
  id: string;
  city_id: string;
  name: string;
  description: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  joined_at: string;
}

// =============================================================================
// USER & AUTHENTICATION
// =============================================================================

/**
 * Get the current authenticated user
 * @returns User object or null if not authenticated
 */
export async function getUser() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error) {
    console.error('CoreAPI.getUser error:', error);
    return null;
  }

  return user;
}

/**
 * Get user profile by ID (defaults to current user)
 * @param userId - Optional user ID (defaults to current user)
 * @returns Profile object or null
 */
export async function getUserProfile(userId?: string): Promise<Profile | null> {
  const supabase = await createClient();

  // If no userId provided, get current user
  const targetUserId = userId || (await getUser())?.id;
  if (!targetUserId) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', targetUserId)
    .single();

  if (error) {
    console.error('CoreAPI.getUserProfile error:', error);
    return null;
  }

  return data;
}

/**
 * Update user profile (must be own profile unless super admin)
 * @param userId - User ID to update
 * @param updates - Profile fields to update
 * @returns Updated profile or null on error
 */
export async function updateUserProfile(
  userId: string,
  updates: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>
): Promise<Profile | null> {
  const supabase = await createClient();
  const currentUser = await getUser();

  if (!currentUser) return null;

  // Check authorization: must be own profile or super admin
  if (currentUser.id !== userId && !(await isAdmin())) {
    console.error('CoreAPI.updateUserProfile: Unauthorized');
    return null;
  }

  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error('CoreAPI.updateUserProfile error:', error);
    return null;
  }

  return data;
}

// =============================================================================
// AUTHORIZATION & ROLES
// =============================================================================

/**
 * Get user's role in a specific city
 * @param cityId - City ID to check role for (defaults to current city)
 * @returns Role or null if not a member
 */
export async function getUserRole(cityId?: string): Promise<UserRole | null> {
  const supabase = await createClient();
  const user = await getUser();
  if (!user) return null;

  const targetCityId = cityId || await getCurrentCityId();
  if (!targetCityId) return null;

  const { data, error } = await supabase
    .from('user_city_roles')
    .select('role')
    .eq('user_id', user.id)
    .eq('city_id', targetCityId)
    .single();

  if (error) {
    // Not an error if user simply isn't a member
    return null;
  }

  return data.role as UserRole;
}

/**
 * Check if current user is an admin (city_admin or super_admin)
 * @param cityId - Optional city ID to check (defaults to current city)
 * @returns True if user is admin
 */
export async function isAdmin(cityId?: string): Promise<boolean> {
  const role = await getUserRole(cityId);
  return role === 'city_admin' || role === 'super_admin';
}

/**
 * Check if current user is a super admin (global access)
 * @returns True if user has super_admin role in any city
 */
export async function isSuperAdmin(): Promise<boolean> {
  const supabase = await createClient();
  const user = await getUser();
  if (!user) return false;

  const { data, error } = await supabase
    .from('user_city_roles')
    .select('role')
    .eq('user_id', user.id)
    .eq('role', 'super_admin')
    .limit(1);

  if (error) return false;

  return (data?.length ?? 0) > 0;
}

// =============================================================================
// CITY CONTEXT
// =============================================================================

/**
 * Get the current city ID from session context
 * Note: Application should call setCityContext() to set this
 * @returns City ID or null
 */
export async function getCurrentCityId(): Promise<string | null> {
  const supabase = await createClient();

  // Call the database function to get current city
  const { data, error } = await supabase.rpc('current_city');

  if (error) {
    console.error('CoreAPI.getCurrentCityId error:', error);
    return null;
  }

  return data;
}

/**
 * Set the current city context for the session
 * IMPORTANT: Call this at the start of each request that needs city context
 * @param cityId - City ID to set as current
 */
export async function setCityContext(cityId: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase.rpc('set_city_context', { city_id: cityId });

  if (error) {
    console.error('CoreAPI.setCityContext error:', error);
  }
}

/**
 * Get the current city object
 * @returns City object or null
 */
export async function getCurrentCity(): Promise<City | null> {
  const cityId = await getCurrentCityId();
  if (!cityId) return null;

  return getCity(cityId);
}

// =============================================================================
// CITIES
// =============================================================================

/**
 * Get city by ID
 * @param cityId - City ID
 * @returns City object or null
 */
export async function getCity(cityId: string): Promise<City | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('cities')
    .select('*')
    .eq('id', cityId)
    .is('deleted_at', null)
    .single();

  if (error) {
    console.error('CoreAPI.getCity error:', error);
    return null;
  }

  return data;
}

/**
 * Get city by slug
 * @param slug - City slug (e.g., 'adelaide')
 * @returns City object or null
 */
export async function getCityBySlug(slug: string): Promise<City | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('cities')
    .select('*')
    .eq('slug', slug)
    .is('deleted_at', null)
    .single();

  if (error) {
    console.error('CoreAPI.getCityBySlug error:', error);
    return null;
  }

  return data;
}

/**
 * Get all cities user has access to
 * @returns Array of cities
 */
export async function getAllCities(): Promise<City[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('cities')
    .select('*')
    .is('deleted_at', null)
    .eq('is_active', true)
    .order('name');

  if (error) {
    console.error('CoreAPI.getAllCities error:', error);
    return [];
  }

  return data;
}

/**
 * Update city (admin only)
 * @param cityId - City ID to update
 * @param updates - City fields to update
 * @returns Updated city or null on error
 */
export async function updateCity(
  cityId: string,
  updates: Partial<Omit<City, 'id' | 'created_at' | 'updated_at'>>
): Promise<City | null> {
  const supabase = await createClient();

  // Check authorization: must be super admin
  if (!(await isSuperAdmin())) {
    console.error('CoreAPI.updateCity: Unauthorized - super admin only');
    return null;
  }

  const { data, error } = await supabase
    .from('cities')
    .update(updates)
    .eq('id', cityId)
    .select()
    .single();

  if (error) {
    console.error('CoreAPI.updateCity error:', error);
    return null;
  }

  return data;
}

/**
 * Create a new city (super admin only)
 * @param city - City data
 * @returns Created city or null on error
 */
export async function createCity(
  city: Omit<City, 'id' | 'created_at' | 'updated_at'>
): Promise<City | null> {
  const supabase = await createClient();

  // Check authorization: must be super admin
  if (!(await isSuperAdmin())) {
    console.error('CoreAPI.createCity: Unauthorized - super admin only');
    return null;
  }

  const { data, error } = await supabase
    .from('cities')
    .insert(city)
    .select()
    .single();

  if (error) {
    console.error('CoreAPI.createCity error:', error);
    return null;
  }

  return data;
}

// =============================================================================
// USER-CITY-ROLES
// =============================================================================

/**
 * Get all cities for a user
 * @param userId - Optional user ID (defaults to current user)
 * @returns Array of city IDs and roles
 */
export async function getUserCities(userId?: string): Promise<UserCityRole[]> {
  const supabase = await createClient();
  const targetUserId = userId || (await getUser())?.id;
  if (!targetUserId) return [];

  const { data, error } = await supabase
    .from('user_city_roles')
    .select('*')
    .eq('user_id', targetUserId);

  if (error) {
    console.error('CoreAPI.getUserCities error:', error);
    return [];
  }

  return data;
}

/**
 * Add a user to a city (admin only)
 * @param userId - User ID to add
 * @param cityId - City ID to add user to
 * @param role - Role to assign (defaults to 'member')
 * @returns Created user_city_role or null on error
 */
export async function addUserToCity(
  userId: string,
  cityId: string,
  role: UserRole = 'member'
): Promise<UserCityRole | null> {
  const supabase = await createClient();

  // Check authorization: must be admin of target city or super admin
  const isTargetCityAdmin = await isAdmin(cityId);
  const isSuperAdminUser = await isSuperAdmin();

  if (!isTargetCityAdmin && !isSuperAdminUser) {
    console.error('CoreAPI.addUserToCity: Unauthorized');
    return null;
  }

  const { data, error } = await supabase
    .from('user_city_roles')
    .insert({ user_id: userId, city_id: cityId, role })
    .select()
    .single();

  if (error) {
    console.error('CoreAPI.addUserToCity error:', error);
    return null;
  }

  return data;
}

// =============================================================================
// GROUPS
// =============================================================================

/**
 * Get all groups in a city
 * @param cityId - Optional city ID (defaults to current city)
 * @returns Array of groups
 */
export async function getGroups(cityId?: string): Promise<Group[]> {
  const supabase = await createClient();
  const targetCityId = cityId || await getCurrentCityId();
  if (!targetCityId) return [];

  const { data, error } = await supabase
    .from('groups')
    .select('*')
    .eq('city_id', targetCityId)
    .order('name');

  if (error) {
    console.error('CoreAPI.getGroups error:', error);
    return [];
  }

  return data;
}

/**
 * Get members of a group
 * @param groupId - Group ID
 * @returns Array of group members with profile data
 */
export async function getGroupMembers(groupId: string): Promise<(GroupMember & { profile: Profile })[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('group_members')
    .select(`
      *,
      profile:profiles(*)
    `)
    .eq('group_id', groupId);

  if (error) {
    console.error('CoreAPI.getGroupMembers error:', error);
    return [];
  }

  return data as any; // Type assertion due to nested select
}

// =============================================================================
// STATISTICS & AGGREGATIONS
// =============================================================================

export interface CityStats {
  memberCount: number;
  eventCount: number;
  projectCount: number;
  postCount: number;
}

export interface GlobalStats {
  cityCount: number;
  memberCount: number;
  eventCount: number;
  projectCount: number;
}

/**
 * Get real-time statistics for a specific city
 * Uses COUNT aggregation queries for accuracy
 *
 * @param cityId - City ID to get stats for
 * @returns Object with member, event, project, and post counts
 *
 * NOTE: These are real-time queries. For high-traffic sites, consider
 * caching these values in a separate city_stats table updated hourly.
 */
export async function getCityStats(cityId: string): Promise<CityStats> {
  const supabase = await createClient();

  // Run queries in parallel for performance
  const [members, events, projects, posts] = await Promise.all([
    supabase
      .from('user_city_roles')
      .select('*', { count: 'exact', head: true })
      .eq('city_id', cityId),
    supabase
      .from('events')
      .select('*', { count: 'exact', head: true })
      .eq('city_id', cityId),
    supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .eq('city_id', cityId),
    supabase
      .from('posts')
      .select('*', { count: 'exact', head: true })
      .eq('city_id', cityId)
      .eq('status', 'published'),
  ]);

  // Handle errors by returning 0 for failed queries
  const memberCount = members.error ? 0 : (members.count || 0);
  const eventCount = events.error ? 0 : (events.count || 0);
  const projectCount = projects.error ? 0 : (projects.count || 0);
  const postCount = posts.error ? 0 : (posts.count || 0);

  return {
    memberCount,
    eventCount,
    projectCount,
    postCount,
  };
}

/**
 * Get aggregate statistics across all active cities
 * Used for root homepage global stats display
 *
 * @returns Object with city, member, event, and project counts
 *
 * NOTE: These are real-time aggregations across entire database.
 * Consider caching for production deployments.
 */
export async function getGlobalStats(): Promise<GlobalStats> {
  const supabase = await createClient();

  // Run queries in parallel for performance
  const [cities, members, events, projects] = await Promise.all([
    supabase
      .from('cities')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true),
    supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true }),
    supabase
      .from('events')
      .select('*', { count: 'exact', head: true }),
    supabase
      .from('projects')
      .select('*', { count: 'exact', head: true }),
  ]);

  // Handle errors by returning 0 for failed queries
  const cityCount = cities.error ? 0 : (cities.count || 0);
  const memberCount = members.error ? 0 : (members.count || 0);
  const eventCount = events.error ? 0 : (events.count || 0);
  const projectCount = projects.error ? 0 : (projects.count || 0);

  return {
    cityCount,
    memberCount,
    eventCount,
    projectCount,
  };
}

// =============================================================================
// EXPORTS
// =============================================================================

export const CoreAPI = {
  // User & Auth
  getUser,
  getUserProfile,
  updateUserProfile,

  // Authorization
  getUserRole,
  isAdmin,
  isSuperAdmin,

  // City Context
  getCurrentCityId,
  setCityContext,
  getCurrentCity,

  // Cities
  getCity,
  getCityBySlug,
  getAllCities,
  updateCity,
  createCity,

  // User-City-Roles
  getUserCities,
  addUserToCity,

  // Groups
  getGroups,
  getGroupMembers,

  // Statistics
  getCityStats,
  getGlobalStats,
};

export default CoreAPI;
