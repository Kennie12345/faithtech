/**
 * Events Feature Event Bus Listeners
 * Registers listeners for events emitted by other features
 */

import { onEvent } from '@/lib/core/events';

/**
 * Initialize all event listeners for the events feature
 * Call this once at application startup
 */
export function initializeEventListeners() {
  // Example: When a user joins a city, we could send them a welcome email
  // with upcoming events (requires email feature to be implemented)
  onEvent('user:joined_city', async (payload) => {
    console.log('Events feature: User joined city', payload);
    // TODO: Send welcome email with upcoming events when newsletter feature is ready
  });

  // Example: When a city is created, we could create a default welcome event
  onEvent('city:created', async (payload) => {
    console.log('Events feature: City created', payload);
    // TODO: Create default welcome event for new cities
  });
}

// Note: In a production app, you would call initializeEventListeners()
// in your app's root layout or a global initialization file.
// For now, this is a placeholder for future cross-feature integrations.
