/**
 * Newsletter Feature
 *
 * Email subscriber collection for city newsletters.
 * Supports export to external email tools (Mailchimp, etc.)
 *
 * Features:
 * - Public subscribe/unsubscribe (no auth required)
 * - Admin subscriber management and CSV export
 * - GDPR-compliant unsubscribe and data deletion
 *
 * @see docs/3-features/feature-newsletter-subscribers.md
 */

// Types
export type { NewsletterSubscriber, SubscribeInput, ActionResult, ExportResult } from './types';

// Schemas
export { subscribeSchema, unsubscribeSchema, emailSchema, parseSubscribeFormData } from './schemas';

// Actions
export {
  // Public actions
  subscribeToNewsletter,
  unsubscribeFromNewsletter,
  // Admin actions
  getSubscribers,
  getActiveSubscriberCount,
  exportSubscribersCSV,
  deleteSubscriber,
  reactivateSubscriber,
} from './actions';

// Listeners
export { registerNewsletterListeners } from './listeners';
