/**
 * Event Bus Module
 *
 * Provides a centralized event system for cross-feature communication.
 * Enables loose coupling between features without direct dependencies.
 *
 * Pattern: Pub/Sub (Publish/Subscribe)
 * - Features EMIT events when actions occur
 * - Features LISTEN to events from other features
 * - No direct imports between features required
 *
 * Example Events:
 * - 'user:created' - Emitted when user signs up
 * - 'user:joined_city' - Emitted when user joins a city
 * - 'event:created' - Emitted when event is created
 * - 'event:rsvp_added' - Emitted when user RSVPs to event
 * - 'post:published' - Emitted when blog post is published
 * - 'project:submitted' - Emitted when project is submitted
 * - 'subscriber:added' - Emitted when newsletter subscriber added
 */

import { EventEmitter } from 'events';

// =============================================================================
// EVENT TYPES
// =============================================================================

/**
 * All possible event names in the system
 * Add new events here as features are added
 */
export type EventName =
  // User events
  | 'user:created'
  | 'user:updated'
  | 'user:joined_city'
  | 'user:left_city'
  // Event events
  | 'event:created'
  | 'event:updated'
  | 'event:deleted'
  | 'event:rsvp_added'
  | 'event:rsvp_updated'
  | 'event:rsvp_removed'
  // Project events
  | 'project:submitted'
  | 'project:approved'
  | 'project:updated'
  | 'project:deleted'
  | 'project:featured'
  | 'project:unfeatured'
  // Blog events
  | 'post:published'
  | 'post:unpublished'
  | 'post:updated'
  | 'post:deleted'
  // Newsletter events
  | 'subscriber:added'
  | 'subscriber:removed'
  // City events
  | 'city:created'
  | 'city:updated'
  | 'city:deactivated';

/**
 * Event payload types
 * Define the data structure for each event
 */
export interface EventPayloads {
  // User events
  'user:created': { userId: string; email: string };
  'user:updated': { userId: string };
  'user:joined_city': { userId: string; cityId: string; role: string };
  'user:left_city': { userId: string; cityId: string };

  // Event events
  'event:created': { eventId: string; cityId: string; createdBy: string };
  'event:updated': { eventId: string; cityId: string; updatedBy: string };
  'event:deleted': { eventId: string; cityId: string; deletedBy: string };
  'event:rsvp_added': { eventId: string; userId: string; status: 'yes' | 'no' | 'maybe' };
  'event:rsvp_updated': { eventId: string; userId: string; status: 'yes' | 'no' | 'maybe' };
  'event:rsvp_removed': { eventId: string; userId: string };

  // Project events
  'project:submitted': { projectId: string; cityId: string; createdBy: string };
  'project:approved': { projectId: string; cityId: string; approvedBy: string };
  'project:updated': { projectId: string; cityId: string; updatedBy: string };
  'project:deleted': { projectId: string; cityId: string; deletedBy: string };
  'project:featured': { projectId: string; cityId: string; featuredBy: string };
  'project:unfeatured': { projectId: string; cityId: string };

  // Blog events
  'post:published': { postId: string; cityId: string; authorId: string; title: string };
  'post:unpublished': { postId: string; cityId: string };
  'post:updated': { postId: string; cityId: string; updatedBy: string };
  'post:deleted': { postId: string; cityId: string; deletedBy: string };

  // Newsletter events
  'subscriber:added': { email: string; cityId: string };
  'subscriber:removed': { email: string; cityId: string };

  // City events
  'city:created': { cityId: string; name: string; createdBy: string };
  'city:updated': { cityId: string; updatedBy: string };
  'city:deactivated': { cityId: string; deactivatedBy: string };
}

// =============================================================================
// EVENT BUS CLASS
// =============================================================================

/**
 * EventBus class - Singleton instance for global event system
 */
class EventBusClass extends EventEmitter {
  private static instance: EventBusClass;

  private constructor() {
    super();
    // Increase max listeners to accommodate multiple features
    this.setMaxListeners(50);

    // Enable logging in development
    if (process.env.NODE_ENV === 'development') {
      this.onAny((event, payload) => {
        console.log('[EventBus]', event, payload);
      });
    }
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): EventBusClass {
    if (!EventBusClass.instance) {
      EventBusClass.instance = new EventBusClass();
    }
    return EventBusClass.instance;
  }

  /**
   * Emit an event with type-safe payload
   */
  public emitEvent<K extends EventName>(
    event: K,
    payload: EventPayloads[K]
  ): void {
    this.emit(event, payload);
  }

  /**
   * Listen to an event with type-safe payload
   */
  public onEvent<K extends EventName>(
    event: K,
    listener: (payload: EventPayloads[K]) => void | Promise<void>
  ): void {
    this.on(event, listener);
  }

  /**
   * Listen to an event once with type-safe payload
   */
  public onceEvent<K extends EventName>(
    event: K,
    listener: (payload: EventPayloads[K]) => void | Promise<void>
  ): void {
    this.once(event, listener);
  }

  /**
   * Remove listener
   */
  public offEvent<K extends EventName>(
    event: K,
    listener: (payload: EventPayloads[K]) => void | Promise<void>
  ): void {
    this.off(event, listener);
  }

  /**
   * Listen to all events (for logging/debugging)
   */
  private onAny(listener: (event: string, payload: any) => void): void {
    const originalEmit = this.emit;
    this.emit = function (event: string, ...args: any[]) {
      listener(event, args[0]);
      return originalEmit.apply(this, [event, ...args]);
    };
  }

  /**
   * Remove all listeners for an event
   */
  public removeAllListenersForEvent(event: EventName): void {
    this.removeAllListeners(event);
  }

  /**
   * Get number of listeners for an event
   */
  public getListenerCount(event: EventName): number {
    return this.listenerCount(event);
  }
}

// =============================================================================
// SINGLETON INSTANCE
// =============================================================================

/**
 * Global EventBus instance
 * Import this in features to emit/listen to events
 */
export const EventBus = EventBusClass.getInstance();

// =============================================================================
// CONVENIENCE FUNCTIONS
// =============================================================================

/**
 * Emit an event (convenience wrapper)
 */
export function emitEvent<K extends EventName>(
  event: K,
  payload: EventPayloads[K]
): void {
  EventBus.emitEvent(event, payload);
}

/**
 * Listen to an event (convenience wrapper)
 */
export function onEvent<K extends EventName>(
  event: K,
  listener: (payload: EventPayloads[K]) => void | Promise<void>
): void {
  EventBus.onEvent(event, listener);
}

/**
 * Listen to an event once (convenience wrapper)
 */
export function onceEvent<K extends EventName>(
  event: K,
  listener: (payload: EventPayloads[K]) => void | Promise<void>
): void {
  EventBus.onceEvent(event, listener);
}

/**
 * Remove listener (convenience wrapper)
 */
export function offEvent<K extends EventName>(
  event: K,
  listener: (payload: EventPayloads[K]) => void | Promise<void>
): void {
  EventBus.offEvent(event, listener);
}

// =============================================================================
// USAGE EXAMPLES
// =============================================================================

/*
Example: Emitting an event from a feature

// In features/events/actions.ts
import { emitEvent } from '@/lib/core/events';

export async function createEvent(formData: FormData) {
  // ... create event logic ...

  emitEvent('event:created', {
    eventId: newEvent.id,
    cityId: newEvent.city_id,
    createdBy: user.id
  });
}

Example: Listening to events from another feature

// In features/newsletter/listeners.ts
import { onEvent } from '@/lib/core/events';

export function registerNewsletterListeners() {
  // When a blog post is published, log for future email campaign
  onEvent('post:published', async (payload) => {
    console.log(`New post published: ${payload.title} in city ${payload.cityId}`);
    // TODO Phase 2: Trigger Mailchimp campaign
  });

  // When an event is created, log for event digest
  onEvent('event:created', async (payload) => {
    console.log(`New event created in city ${payload.cityId}`);
    // TODO Phase 2: Add to weekly event digest email
  });
}

Example: Registering listeners in app initialization

// In app/layout.tsx or a dedicated lib/core/init.ts
import { registerNewsletterListeners } from '@/features/newsletter/listeners';
import { registerEventsListeners } from '@/features/events/listeners';

export function initializeEventListeners() {
  registerNewsletterListeners();
  registerEventsListeners();
  // Register other feature listeners...
}

// Call once on app startup
initializeEventListeners();
*/

// =============================================================================
// EXPORTS
// =============================================================================

export default EventBus;
