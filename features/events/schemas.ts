/**
 * Events Feature Zod Schemas
 * Validation schemas for form inputs and server actions
 */

import { z } from 'zod';

// RSVP status enum
export const rsvpStatusSchema = z.enum(['yes', 'no', 'maybe']);

// Base event schema (without refinements)
const baseEventSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters'),

  description: z
    .string()
    .max(10000, 'Description must be less than 10,000 characters')
    .optional()
    .nullable(),

  starts_at: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: 'Start date must be a valid date',
    })
    .refine(
      (val) => new Date(val) > new Date(),
      {
        message: 'Start date must be in the future',
      }
    ),

  ends_at: z
    .string()
    .refine((val) => !val || !isNaN(Date.parse(val)), {
      message: 'End date must be a valid date',
    })
    .optional()
    .nullable(),

  location_name: z
    .string()
    .max(200, 'Location name must be less than 200 characters')
    .optional()
    .nullable(),

  location_address: z
    .string()
    .max(500, 'Address must be less than 500 characters')
    .optional()
    .nullable(),

  location_url: z
    .string()
    .url('Location URL must be a valid URL')
    .optional()
    .nullable()
    .or(z.literal('')),

  max_attendees: z
    .number()
    .int('Max attendees must be a whole number')
    .positive('Max attendees must be greater than 0')
    .optional()
    .nullable(),
});

// Create event schema (for admin forms) - adds cross-field validation
export const createEventSchema = baseEventSchema.refine(
  (data) => {
    // If ends_at is provided, it must be after starts_at
    if (data.ends_at && data.starts_at) {
      return new Date(data.ends_at) > new Date(data.starts_at);
    }
    return true;
  },
  {
    message: 'End date must be after start date',
    path: ['ends_at'],
  }
);

// Update event schema (partial of base schema)
export const updateEventSchema = baseEventSchema.partial();

// RSVP schema
export const createRSVPSchema = z.object({
  event_id: z.string().uuid('Invalid event ID'),
  status: rsvpStatusSchema,
});

// Form data schema (for FormData parsing)
export const eventFormDataSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  starts_at: z.string().min(1, 'Start date is required'),
  ends_at: z.string().optional(),
  location_name: z.string().optional(),
  location_address: z.string().optional(),
  location_url: z.string().optional(),
  max_attendees: z.string().optional(),
});

// Helper to convert FormData to typed object
export function parseEventFormData(formData: FormData) {
  const raw = {
    title: formData.get('title') as string,
    description: formData.get('description') as string || null,
    starts_at: formData.get('starts_at') as string,
    ends_at: formData.get('ends_at') as string || null,
    location_name: formData.get('location_name') as string || null,
    location_address: formData.get('location_address') as string || null,
    location_url: formData.get('location_url') as string || null,
    max_attendees: formData.get('max_attendees')
      ? parseInt(formData.get('max_attendees') as string)
      : null,
  };

  return createEventSchema.parse(raw);
}
