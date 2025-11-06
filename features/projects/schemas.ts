/**
 * Projects Feature Zod Schemas
 * Validation schemas for form inputs and server actions
 */

import { z } from 'zod';

// Team member role enum
export const projectMemberRoleSchema = z.enum(['lead', 'contributor']);

// Create project schema (for member and admin forms)
export const createProjectSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters'),

  description: z
    .string()
    .max(10000, 'Description must be less than 10,000 characters')
    .optional()
    .nullable(),

  problem_statement: z
    .string()
    .max(2000, 'Problem statement must be less than 2,000 characters')
    .optional()
    .nullable(),

  solution: z
    .string()
    .max(2000, 'Solution must be less than 2,000 characters')
    .optional()
    .nullable(),

  github_url: z
    .string()
    .url('GitHub URL must be a valid URL')
    .optional()
    .nullable()
    .or(z.literal('')),

  demo_url: z
    .string()
    .url('Demo URL must be a valid URL')
    .optional()
    .nullable()
    .or(z.literal('')),

  image_url: z
    .string()
    .url('Image URL must be a valid URL')
    .optional()
    .nullable()
    .or(z.literal('')),
});

// Update project schema (partial of create schema)
export const updateProjectSchema = createProjectSchema.partial();

// Add team member schema
export const addMemberSchema = z.object({
  user_id: z.string().uuid('Invalid user ID'),
  role: projectMemberRoleSchema,
});

// Form data schema (for FormData parsing)
export const projectFormDataSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  problem_statement: z.string().optional(),
  solution: z.string().optional(),
  github_url: z.string().optional(),
  demo_url: z.string().optional(),
  image_url: z.string().optional(),
});

// Helper to convert FormData to typed object
export function parseProjectFormData(formData: FormData) {
  const raw = {
    title: formData.get('title') as string,
    description: (formData.get('description') as string) || null,
    problem_statement: (formData.get('problem_statement') as string) || null,
    solution: (formData.get('solution') as string) || null,
    github_url: (formData.get('github_url') as string) || null,
    demo_url: (formData.get('demo_url') as string) || null,
    image_url: (formData.get('image_url') as string) || null,
  };

  return createProjectSchema.parse(raw);
}
