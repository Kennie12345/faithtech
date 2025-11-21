/**
 * Blog Feature Types
 * TypeScript types matching the database schema
 */

// Post from database
export interface Post {
  id: string;
  city_id: string;
  title: string;
  content: string | null;
  slug: string;
  excerpt: string | null;
  published_at: string | null; // ISO 8601 timestamp, NULL = draft
  is_featured: boolean;
  featured_image_url: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

// Post with author profile (for display views)
export interface PostWithAuthor extends Post {
  author: {
    id: string;
    display_name: string | null;
    avatar_url: string | null;
    email: string | null;
  };
}

// Input types for creating/updating posts
export interface CreatePostInput {
  city_id: string;
  title: string;
  content?: string | null;
  slug: string;
  excerpt?: string | null;
  featured_image_url?: string | null;
  created_by: string;
}

export interface UpdatePostInput {
  title?: string;
  content?: string | null;
  excerpt?: string | null;
  featured_image_url?: string | null;
}

// Server action return types
export interface ActionResult<T = void> {
  data?: T;
  error?: string;
}
