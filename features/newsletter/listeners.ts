/**
 * Newsletter Feature Event Listeners
 *
 * Listens to events from other features to enable cross-feature functionality.
 *
 * Current: Logging only
 * Future Phase 2: Mailchimp integration for automated campaigns
 */

import { onEvent } from '@/lib/core/events';

/**
 * Register all newsletter event listeners
 * Call this once on application startup
 */
export function registerNewsletterListeners() {
  // When a blog post is published, log for future email campaign
  onEvent('post:published', async (payload) => {
    console.log(
      `[Newsletter] Post published: "${payload.title}" in city ${payload.cityId}`
    );
    // TODO Phase 2: Queue for weekly digest or trigger Mailchimp campaign
  });

  // When an event is created, log for event digest
  onEvent('event:created', async (payload) => {
    console.log(
      `[Newsletter] Event created: ${payload.eventId} in city ${payload.cityId}`
    );
    // TODO Phase 2: Add to weekly event digest email
  });

  // When a new subscriber is added
  onEvent('subscriber:added', async (payload) => {
    console.log(
      `[Newsletter] New subscriber: ${payload.email} for city ${payload.cityId}`
    );
    // TODO Phase 2: Send welcome email via Mailchimp
  });

  // When a subscriber is removed
  onEvent('subscriber:removed', async (payload) => {
    console.log(
      `[Newsletter] Unsubscribed: ${payload.email} from city ${payload.cityId}`
    );
    // TODO Phase 2: Remove from Mailchimp list
  });
}
