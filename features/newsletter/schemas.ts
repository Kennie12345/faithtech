/**
 * Newsletter Feature Zod Schemas
 * Validation schemas for form inputs and server actions
 */

import { z } from 'zod';

// Email validation schema
export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Please enter a valid email address')
  .max(320, 'Email is too long'); // RFC 5321 limit

// Subscribe schema
export const subscribeSchema = z.object({
  email: emailSchema,
  city_id: z.string().uuid('Invalid city'),
});

// Unsubscribe schema
export const unsubscribeSchema = z.object({
  email: emailSchema,
  city_id: z.string().uuid('Invalid city'),
});

// Form data schema (for FormData parsing)
export const subscribeFormDataSchema = z.object({
  email: emailSchema,
});

// Helper to parse subscribe form data
export function parseSubscribeFormData(formData: FormData) {
  const raw = {
    email: (formData.get('email') as string)?.trim().toLowerCase(),
  };

  return subscribeFormDataSchema.parse(raw);
}
