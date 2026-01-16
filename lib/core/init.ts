/**
 * Core Application Initialization
 *
 * This module initializes all global application systems, including:
 * - Event bus listeners
 * - Future: Cache warming, metrics, etc.
 *
 * IMPORTANT: Call initialize() once at application startup.
 * In Next.js, this should be called from instrumentation.ts or similar.
 *
 * @see lib/core/events.ts - Event bus system
 */

import { registerNewsletterListeners } from '@/features/newsletter/listeners';
import { initializeEventListeners as initializeEventsListeners } from '@/features/events/listeners';

let initialized = false;

/**
 * Initialize all application systems
 * Safe to call multiple times - will only run once
 */
export function initialize() {
  if (initialized) {
    console.log('[Core] Already initialized, skipping');
    return;
  }

  console.log('[Core] Initializing application systems...');

  // Register all feature event listeners
  registerNewsletterListeners();
  initializeEventsListeners();

  // Future: Add more initialization here
  // - Blog listeners
  // - Project listeners
  // - Notification systems
  // - Cache warming

  initialized = true;
  console.log('[Core] Initialization complete');
}

/**
 * Check if application is initialized
 * Useful for debugging
 */
export function isInitialized(): boolean {
  return initialized;
}
