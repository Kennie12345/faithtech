import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  EventBus,
  emitEvent,
  onEvent,
  onceEvent,
  offEvent,
  type EventPayloads,
} from '@/lib/core/events';

describe('EventBus', () => {
  beforeEach(() => {
    // Clear all event listeners before each test
    EventBus.removeAllListeners();
  });

  afterEach(() => {
    // Clean up after each test
    EventBus.removeAllListeners();
    vi.clearAllMocks();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const { EventBus: EventBusClass } = require('@/lib/core/events');
      const instance1 = EventBusClass;
      const instance2 = EventBusClass;

      expect(instance1).toBe(instance2);
    });
  });

  describe('emitEvent() and onEvent()', () => {
    it('should emit and listen to user:created event', async () => {
      const listener = vi.fn();
      const payload: EventPayloads['user:created'] = {
        userId: 'user-123',
        email: 'test@example.com',
      };

      onEvent('user:created', listener);
      emitEvent('user:created', payload);

      expect(listener).toHaveBeenCalledOnce();
      expect(listener).toHaveBeenCalledWith(payload);
    });

    it('should emit and listen to event:created event', async () => {
      const listener = vi.fn();
      const payload: EventPayloads['event:created'] = {
        eventId: 'event-123',
        cityId: 'city-123',
        createdBy: 'user-123',
      };

      onEvent('event:created', listener);
      emitEvent('event:created', payload);

      expect(listener).toHaveBeenCalledOnce();
      expect(listener).toHaveBeenCalledWith(payload);
    });

    it('should emit and listen to event:rsvp_added event', async () => {
      const listener = vi.fn();
      const payload: EventPayloads['event:rsvp_added'] = {
        eventId: 'event-123',
        userId: 'user-123',
        status: 'yes',
      };

      onEvent('event:rsvp_added', listener);
      emitEvent('event:rsvp_added', payload);

      expect(listener).toHaveBeenCalledOnce();
      expect(listener).toHaveBeenCalledWith(payload);
    });

    it('should emit and listen to project:submitted event', async () => {
      const listener = vi.fn();
      const payload: EventPayloads['project:submitted'] = {
        projectId: 'project-123',
        cityId: 'city-123',
        createdBy: 'user-123',
      };

      onEvent('project:submitted', listener);
      emitEvent('project:submitted', payload);

      expect(listener).toHaveBeenCalledOnce();
      expect(listener).toHaveBeenCalledWith(payload);
    });

    it('should emit and listen to project:featured event', async () => {
      const listener = vi.fn();
      const payload: EventPayloads['project:featured'] = {
        projectId: 'project-123',
        cityId: 'city-123',
        featuredBy: 'admin-123',
      };

      onEvent('project:featured', listener);
      emitEvent('project:featured', payload);

      expect(listener).toHaveBeenCalledOnce();
      expect(listener).toHaveBeenCalledWith(payload);
    });

    it('should support multiple listeners for same event', () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();
      const listener3 = vi.fn();
      const payload: EventPayloads['user:created'] = {
        userId: 'user-123',
        email: 'test@example.com',
      };

      onEvent('user:created', listener1);
      onEvent('user:created', listener2);
      onEvent('user:created', listener3);

      emitEvent('user:created', payload);

      expect(listener1).toHaveBeenCalledOnce();
      expect(listener2).toHaveBeenCalledOnce();
      expect(listener3).toHaveBeenCalledOnce();
      expect(listener1).toHaveBeenCalledWith(payload);
      expect(listener2).toHaveBeenCalledWith(payload);
      expect(listener3).toHaveBeenCalledWith(payload);
    });

    it('should support async listeners', async () => {
      const listener = vi.fn(async (payload: EventPayloads['user:created']) => {
        await new Promise((resolve) => setTimeout(resolve, 10));
        return payload;
      });
      const payload: EventPayloads['user:created'] = {
        userId: 'user-123',
        email: 'test@example.com',
      };

      onEvent('user:created', listener);
      emitEvent('user:created', payload);

      // Wait for async listener to complete
      await new Promise((resolve) => setTimeout(resolve, 20));

      expect(listener).toHaveBeenCalledOnce();
      expect(listener).toHaveBeenCalledWith(payload);
    });

    it('should not trigger listener for different event', () => {
      const listener = vi.fn();
      const payload: EventPayloads['user:created'] = {
        userId: 'user-123',
        email: 'test@example.com',
      };

      onEvent('event:created', listener);
      emitEvent('user:created', payload);

      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe('onceEvent()', () => {
    it('should listen to event only once', () => {
      const listener = vi.fn();
      const payload1: EventPayloads['user:created'] = {
        userId: 'user-1',
        email: 'test1@example.com',
      };
      const payload2: EventPayloads['user:created'] = {
        userId: 'user-2',
        email: 'test2@example.com',
      };

      onceEvent('user:created', listener);
      emitEvent('user:created', payload1);
      emitEvent('user:created', payload2);

      expect(listener).toHaveBeenCalledOnce();
      expect(listener).toHaveBeenCalledWith(payload1);
    });

    it('should work with multiple once listeners', () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();
      const payload: EventPayloads['user:created'] = {
        userId: 'user-123',
        email: 'test@example.com',
      };

      onceEvent('user:created', listener1);
      onceEvent('user:created', listener2);
      emitEvent('user:created', payload);

      expect(listener1).toHaveBeenCalledOnce();
      expect(listener2).toHaveBeenCalledOnce();

      // Emit again
      emitEvent('user:created', payload);

      // Should still be called only once
      expect(listener1).toHaveBeenCalledOnce();
      expect(listener2).toHaveBeenCalledOnce();
    });
  });

  describe('offEvent()', () => {
    it('should remove listener', () => {
      const listener = vi.fn();
      const payload: EventPayloads['user:created'] = {
        userId: 'user-123',
        email: 'test@example.com',
      };

      onEvent('user:created', listener);
      offEvent('user:created', listener);
      emitEvent('user:created', payload);

      expect(listener).not.toHaveBeenCalled();
    });

    it('should remove only specified listener', () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();
      const payload: EventPayloads['user:created'] = {
        userId: 'user-123',
        email: 'test@example.com',
      };

      onEvent('user:created', listener1);
      onEvent('user:created', listener2);
      offEvent('user:created', listener1);
      emitEvent('user:created', payload);

      expect(listener1).not.toHaveBeenCalled();
      expect(listener2).toHaveBeenCalledOnce();
    });

    it('should not affect other events', () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();

      onEvent('user:created', listener1);
      onEvent('event:created', listener2);
      offEvent('user:created', listener1);

      emitEvent('user:created', { userId: 'user-123', email: 'test@example.com' });
      emitEvent('event:created', {
        eventId: 'event-123',
        cityId: 'city-123',
        createdBy: 'user-123',
      });

      expect(listener1).not.toHaveBeenCalled();
      expect(listener2).toHaveBeenCalledOnce();
    });
  });

  describe('removeAllListenersForEvent()', () => {
    it('should remove all listeners for specific event', () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();
      const listener3 = vi.fn();

      onEvent('user:created', listener1);
      onEvent('user:created', listener2);
      onEvent('event:created', listener3);

      EventBus.removeAllListenersForEvent('user:created');

      emitEvent('user:created', { userId: 'user-123', email: 'test@example.com' });
      emitEvent('event:created', {
        eventId: 'event-123',
        cityId: 'city-123',
        createdBy: 'user-123',
      });

      expect(listener1).not.toHaveBeenCalled();
      expect(listener2).not.toHaveBeenCalled();
      expect(listener3).toHaveBeenCalledOnce();
    });
  });

  describe('getListenerCount()', () => {
    it('should return correct listener count', () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();
      const listener3 = vi.fn();

      expect(EventBus.getListenerCount('user:created')).toBe(0);

      onEvent('user:created', listener1);
      expect(EventBus.getListenerCount('user:created')).toBe(1);

      onEvent('user:created', listener2);
      expect(EventBus.getListenerCount('user:created')).toBe(2);

      onEvent('user:created', listener3);
      expect(EventBus.getListenerCount('user:created')).toBe(3);

      offEvent('user:created', listener1);
      expect(EventBus.getListenerCount('user:created')).toBe(2);

      EventBus.removeAllListenersForEvent('user:created');
      expect(EventBus.getListenerCount('user:created')).toBe(0);
    });

    it('should return 0 for events with no listeners', () => {
      expect(EventBus.getListenerCount('event:created')).toBe(0);
      expect(EventBus.getListenerCount('project:submitted')).toBe(0);
    });
  });

  describe('Type Safety', () => {
    it('should enforce correct payload types for user:created', () => {
      const listener = vi.fn((payload: EventPayloads['user:created']) => {
        // TypeScript ensures payload has userId and email
        expect(payload.userId).toBeDefined();
        expect(payload.email).toBeDefined();
      });

      onEvent('user:created', listener);
      emitEvent('user:created', { userId: 'user-123', email: 'test@example.com' });

      expect(listener).toHaveBeenCalled();
    });

    it('should enforce correct payload types for event:rsvp_added', () => {
      const listener = vi.fn((payload: EventPayloads['event:rsvp_added']) => {
        // TypeScript ensures payload has correct structure
        expect(payload.eventId).toBeDefined();
        expect(payload.userId).toBeDefined();
        expect(payload.status).toBeDefined();
        expect(['yes', 'no', 'maybe']).toContain(payload.status);
      });

      onEvent('event:rsvp_added', listener);
      emitEvent('event:rsvp_added', {
        eventId: 'event-123',
        userId: 'user-123',
        status: 'yes',
      });

      expect(listener).toHaveBeenCalled();
    });

    it('should enforce correct payload types for project:featured', () => {
      const listener = vi.fn((payload: EventPayloads['project:featured']) => {
        expect(payload.projectId).toBeDefined();
        expect(payload.cityId).toBeDefined();
        expect(payload.featuredBy).toBeDefined();
      });

      onEvent('project:featured', listener);
      emitEvent('project:featured', {
        projectId: 'project-123',
        cityId: 'city-123',
        featuredBy: 'admin-123',
      });

      expect(listener).toHaveBeenCalled();
    });
  });

  describe('Real-world Feature Scenarios', () => {
    it('should handle event creation workflow', () => {
      const eventCreatedListener = vi.fn();
      const newsletterListener = vi.fn();

      // Newsletter feature listens to event:created
      onEvent('event:created', newsletterListener);

      // Analytics feature listens to event:created
      onEvent('event:created', eventCreatedListener);

      // Events feature emits event:created
      const payload: EventPayloads['event:created'] = {
        eventId: 'event-123',
        cityId: 'adelaide-city',
        createdBy: 'admin-123',
      };
      emitEvent('event:created', payload);

      expect(eventCreatedListener).toHaveBeenCalledWith(payload);
      expect(newsletterListener).toHaveBeenCalledWith(payload);
    });

    it('should handle RSVP workflow', () => {
      const rsvpListener = vi.fn();
      const notificationListener = vi.fn();

      onEvent('event:rsvp_added', rsvpListener);
      onEvent('event:rsvp_added', notificationListener);

      const payload: EventPayloads['event:rsvp_added'] = {
        eventId: 'event-123',
        userId: 'user-123',
        status: 'yes',
      };
      emitEvent('event:rsvp_added', payload);

      expect(rsvpListener).toHaveBeenCalledWith(payload);
      expect(notificationListener).toHaveBeenCalledWith(payload);
    });

    it('should handle project submission workflow', () => {
      const submissionListener = vi.fn();
      const adminNotificationListener = vi.fn();

      onEvent('project:submitted', submissionListener);
      onEvent('project:submitted', adminNotificationListener);

      const payload: EventPayloads['project:submitted'] = {
        projectId: 'project-123',
        cityId: 'adelaide-city',
        createdBy: 'member-123',
      };
      emitEvent('project:submitted', payload);

      expect(submissionListener).toHaveBeenCalledWith(payload);
      expect(adminNotificationListener).toHaveBeenCalledWith(payload);
    });

    it('should handle project featured workflow', () => {
      const featuredListener = vi.fn();

      onEvent('project:featured', featuredListener);

      const payload: EventPayloads['project:featured'] = {
        projectId: 'project-123',
        cityId: 'adelaide-city',
        featuredBy: 'admin-123',
      };
      emitEvent('project:featured', payload);

      expect(featuredListener).toHaveBeenCalledWith(payload);
    });

    it('should handle user signup workflow', () => {
      const profileCreationListener = vi.fn();
      const welcomeEmailListener = vi.fn();

      onEvent('user:created', profileCreationListener);
      onEvent('user:created', welcomeEmailListener);

      const payload: EventPayloads['user:created'] = {
        userId: 'user-123',
        email: 'newuser@example.com',
      };
      emitEvent('user:created', payload);

      expect(profileCreationListener).toHaveBeenCalledWith(payload);
      expect(welcomeEmailListener).toHaveBeenCalledWith(payload);
    });
  });

  describe('Edge Cases', () => {
    it('should handle emitting event with no listeners', () => {
      expect(() => {
        emitEvent('user:created', { userId: 'user-123', email: 'test@example.com' });
      }).not.toThrow();
    });

    it('should handle removing listener that was never added', () => {
      const listener = vi.fn();

      expect(() => {
        offEvent('user:created', listener);
      }).not.toThrow();
    });

    it('should handle removing all listeners when there are none', () => {
      expect(() => {
        EventBus.removeAllListenersForEvent('user:created');
      }).not.toThrow();
    });

    it('should handle rapid successive events', () => {
      const listener = vi.fn();
      onEvent('user:created', listener);

      for (let i = 0; i < 100; i++) {
        emitEvent('user:created', {
          userId: `user-${i}`,
          email: `user${i}@example.com`,
        });
      }

      expect(listener).toHaveBeenCalledTimes(100);
    });
  });
});
