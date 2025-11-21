/**
 * Blog Feature Event Bus Listeners
 * Registers listeners for events emitted by other features
 */

import { onEvent } from '@/lib/core/events';

/**
 * Initialize all event listeners for the blog feature
 * Call this once at application startup
 */
export function initializeBlogListeners() {
  // Example: When a city is created, we could create a welcome post
  onEvent('city:created', async (payload) => {
    console.log('Blog feature: City created', payload);
    // TODO: Create default welcome post for new cities when auto-initialization is ready
  });

  // Example: When a user joins a city, we could send them featured posts
  onEvent('user:joined_city', async (payload) => {
    console.log('Blog feature: User joined city', payload);
    // TODO: Send onboarding email with featured posts when newsletter feature is ready
  });
}

// Note: In a production app, you would call initializeBlogListeners()
// in your app's root layout or a global initialization file.
// For now, this is a placeholder for future cross-feature integrations.
//
// IMPORTANT: The Newsletter feature (Phase 3) will listen to 'post:published'
// event to send notifications to subscribers. This is implemented in the
// Newsletter feature's listeners.ts, not here.
