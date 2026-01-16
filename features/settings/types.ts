/**
 * Settings Feature Types
 * TypeScript types for city settings and feature toggles
 */

// Feature toggle from database
export interface CityFeature {
  id: string;
  city_id: string;
  feature_slug: FeatureSlug;
  is_enabled: boolean;
  created_at: string;
  updated_at: string;
}

// Available features that can be toggled
export type FeatureSlug = 'events' | 'blog' | 'projects' | 'newsletter';

// Feature with display metadata
export interface FeatureConfig {
  slug: FeatureSlug;
  name: string;
  description: string;
  icon: string; // Lucide icon name
}

// City profile for editing
export interface CityProfile {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  hero_image_url: string | null;
  accent_color: string;
  is_active: boolean;
}

// Input for updating city profile
export interface UpdateCityProfileInput {
  name?: string;
  logo_url?: string | null;
  hero_image_url?: string | null;
  accent_color?: string;
}

// Server action return types
export interface ActionResult<T = void> {
  data?: T;
  error?: string;
}

// Available accent colors for city branding
export const ACCENT_COLORS = [
  { value: '#3B82F6', name: 'Blue', class: 'bg-blue-500' },
  { value: '#10B981', name: 'Green', class: 'bg-emerald-500' },
  { value: '#8B5CF6', name: 'Purple', class: 'bg-violet-500' },
  { value: '#F59E0B', name: 'Amber', class: 'bg-amber-500' },
  { value: '#EF4444', name: 'Red', class: 'bg-red-500' },
  { value: '#06B6D4', name: 'Cyan', class: 'bg-cyan-500' },
] as const;

// Feature configuration with metadata
export const FEATURE_CONFIGS: FeatureConfig[] = [
  {
    slug: 'events',
    name: 'Events',
    description: 'Allow creating and managing community events with RSVPs',
    icon: 'CalendarDays',
  },
  {
    slug: 'projects',
    name: 'Projects',
    description: 'Showcase CREATE projects and team collaborations',
    icon: 'Rocket',
  },
  {
    slug: 'blog',
    name: 'Blog',
    description: 'Publish articles and updates for the community',
    icon: 'BookOpen',
  },
  {
    slug: 'newsletter',
    name: 'Newsletter',
    description: 'Collect email subscribers for newsletters',
    icon: 'Mail',
  },
];
