import { vi } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Creates a mock Supabase client with common method implementations
 */
export function createMockSupabaseClient(overrides?: Partial<SupabaseClient>) {
  const mockClient = {
    auth: {
      getUser: vi.fn(),
      getSession: vi.fn(),
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      resetPasswordForEmail: vi.fn(),
      updateUser: vi.fn(),
    },
    from: vi.fn((table: string) => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      upsert: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      neq: vi.fn().mockReturnThis(),
      gt: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      lt: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
      like: vi.fn().mockReturnThis(),
      ilike: vi.fn().mockReturnThis(),
      is: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      contains: vi.fn().mockReturnThis(),
      containedBy: vi.fn().mockReturnThis(),
      range: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      single: vi.fn(),
      maybeSingle: vi.fn(),
    })),
    rpc: vi.fn(),
    storage: {
      from: vi.fn((bucket: string) => ({
        upload: vi.fn(),
        download: vi.fn(),
        remove: vi.fn(),
        list: vi.fn(),
        getPublicUrl: vi.fn(),
        createSignedUrl: vi.fn(),
      })),
    },
    ...overrides,
  };

  return mockClient as unknown as SupabaseClient;
}

/**
 * Creates a successful Supabase response
 */
export function createSuccessResponse<T>(data: T) {
  return { data, error: null };
}

/**
 * Creates an error Supabase response
 */
export function createErrorResponse(message: string, code?: string) {
  return {
    data: null,
    error: {
      message,
      code: code || 'PGRST000',
      details: null,
      hint: null,
    },
  };
}

/**
 * Mock user data for testing
 */
export const mockUser = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  email: 'test@example.com',
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z',
  aud: 'authenticated',
  role: 'authenticated',
  app_metadata: {},
  user_metadata: {},
};

/**
 * Mock city data for testing
 */
export const mockCity = {
  id: '123e4567-e89b-12d3-a456-426614174001',
  name: 'Adelaide',
  slug: 'adelaide',
  description: 'FaithTech Adelaide Hub',
  logo_url: null,
  website: 'https://faithtech.com/adelaide',
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z',
};

/**
 * Mock profile data for testing
 */
export const mockProfile = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  display_name: 'Test User',
  avatar_url: null,
  bio: null,
  website: null,
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z',
};

/**
 * Mock event data for testing
 */
export const mockEvent = {
  id: '123e4567-e89b-12d3-a456-426614174002',
  city_id: '123e4567-e89b-12d3-a456-426614174001',
  title: 'Community Meetup',
  slug: 'community-meetup',
  description: 'Join us for a community meetup',
  location: 'Adelaide CBD',
  start_time: '2024-12-01T18:00:00.000Z',
  end_time: '2024-12-01T20:00:00.000Z',
  capacity: 50,
  image_url: null,
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z',
};

/**
 * Mock project data for testing
 */
export const mockProject = {
  id: '123e4567-e89b-12d3-a456-426614174003',
  city_id: '123e4567-e89b-12d3-a456-426614174001',
  title: 'FaithTech Website',
  slug: 'faithtech-website',
  description: 'Building the FaithTech community website',
  tech_stack: ['Next.js', 'TypeScript', 'Supabase'],
  project_url: 'https://github.com/faithtech/website',
  image_url: null,
  is_featured: false,
  created_by: '123e4567-e89b-12d3-a456-426614174000',
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z',
};

/**
 * Mock RSVP data for testing
 */
export const mockRSVP = {
  id: '123e4567-e89b-12d3-a456-426614174004',
  event_id: '123e4567-e89b-12d3-a456-426614174002',
  user_id: '123e4567-e89b-12d3-a456-426614174000',
  status: 'yes' as const,
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z',
};

/**
 * Mock user-city-role data for testing
 */
export const mockUserCityRole = {
  id: '123e4567-e89b-12d3-a456-426614174005',
  user_id: '123e4567-e89b-12d3-a456-426614174000',
  city_id: '123e4567-e89b-12d3-a456-426614174001',
  role: 'city_admin' as const,
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z',
};
