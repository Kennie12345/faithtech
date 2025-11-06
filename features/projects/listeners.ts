/**
 * Projects Feature Event Bus Listeners
 * Registers listeners for events emitted by other features
 */

import { onEvent } from '@/lib/core/events';

/**
 * Initialize all event listeners for the projects feature
 * Call this once at application startup
 */
export function initializeProjectListeners() {
  // Example: When a user joins a city, we could show them a guide
  // on how to submit their first project
  onEvent('user:joined_city', async (payload) => {
    console.log('Projects feature: User joined city', payload);
    // TODO: Send onboarding email about submitting projects when newsletter feature is ready
  });

  // Example: When a city is created, we could create a default example project
  onEvent('city:created', async (payload) => {
    console.log('Projects feature: City created', payload);
    // TODO: Create example project for new cities to demonstrate the feature
  });
}

// Note: In a production app, you would call initializeProjectListeners()
// in your app's root layout or a global initialization file.
// For now, this is a placeholder for future cross-feature integrations.
