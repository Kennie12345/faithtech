/**
 * Blog Feature Zod Schemas
 * Validation schemas for form inputs and server actions
 */

import { z } from 'zod';

// Create post schema (for member and admin forms)
export const createPostSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters'),

  content: z
    .string()
    .max(100000, 'Content must be less than 100,000 characters')
    .optional()
    .nullable(),

  excerpt: z
    .string()
    .max(500, 'Excerpt must be less than 500 characters')
    .optional()
    .nullable(),

  featured_image_url: z
    .string()
    .url('Image URL must be a valid URL')
    .optional()
    .nullable()
    .or(z.literal('')),
});

// Update post schema (partial of create schema)
export const updatePostSchema = createPostSchema.partial();

// Form data schema (for FormData parsing)
export const postFormDataSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().optional(),
  excerpt: z.string().optional(),
  featured_image_url: z.string().optional(),
});

// Helper to convert FormData to typed object
export function parsePostFormData(formData: FormData) {
  const raw = {
    title: formData.get('title') as string,
    content: (formData.get('content') as string) || null,
    excerpt: (formData.get('excerpt') as string) || null,
    featured_image_url: (formData.get('featured_image_url') as string) || null,
  };

  return createPostSchema.parse(raw);
}
