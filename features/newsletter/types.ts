/**
 * Newsletter Feature Types
 * TypeScript types matching the database schema
 */

// Subscriber from database
export interface NewsletterSubscriber {
  id: string;
  city_id: string;
  email: string;
  is_active: boolean;
  subscribed_at: string; // ISO 8601 timestamp
  unsubscribed_at: string | null;
}

// Input types for subscribing
export interface SubscribeInput {
  email: string;
  city_id: string;
}

// Server action return types
export interface ActionResult<T = void> {
  data?: T;
  error?: string;
}

// Export result
export interface ExportResult {
  csv?: string;
  count?: number;
  error?: string;
}
