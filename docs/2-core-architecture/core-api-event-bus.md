# API Contracts: CoreAPI & Event Bus

**Document Type:** Core (Stable)
**Stability Level:** Semi-Stable (event types may expand)
**Audience:** Feature developers
**Last Updated:** 2025-11-05
**Dependencies:** [multi-tenant-data-model.md](multi-tenant-data-model.md), [architectural-principles.md](../1-vision/architectural-principles.md)

---

## Purpose

This document defines how **features communicate with core** and **with each other** without direct coupling.

**Two mechanisms:**
1. **CoreAPI** - Functions features call to access core data (cities, users)
2. **Event Bus** - Publish/subscribe system for cross-feature communication

---

## CoreAPI: Core-to-Feature Interface

### Overview

CoreAPI is a set of functions that features use to access core entities (cities, users, groups).

**Why not direct Supabase queries?**
- Encapsulation (if we change core schema, only CoreAPI updates)
- Consistent error handling
- Easier mocking for tests

**Location:** `lib/core/api.ts`

---

### CoreAPI Functions

#### 1. User Functions

```typescript
// lib/core/api.ts

import { createClient } from '@/lib/supabase/server';

export const CoreAPI = {
  /**
   * Get currently authenticated user
   */
  async getUser() {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      throw new Error('Not authenticated');
    }

    return user;
  },

  /**
   * Get user's profile (display name, avatar, etc.)
   */
  async getUserProfile(userId?: string) {
    const supabase = await createClient();
    const id = userId || (await this.getUser()).id;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Get user's role in specific city
   */
  async getUserRole(cityId: string, userId?: string) {
    const supabase = await createClient();
    const id = userId || (await this.getUser()).id;

    const { data, error } = await supabase
      .from('user_city_roles')
      .select('role')
      .eq('user_id', id)
      .eq('city_id', cityId)
      .single();

    if (error) return null;
    return data.role as 'super_admin' | 'city_admin' | 'member';
  },

  /**
   * Check if user is admin of current city
   */
  async isAdmin(cityId: string) {
    const role = await this.getUserRole(cityId);
    return role === 'city_admin' || role === 'super_admin';
  },
};
```

---

#### 2. City Functions

```typescript
export const CoreAPI = {
  // ... user functions

  /**
   * Get current city from context
   * (In Phase 1: Read from cookie/session)
   */
  async getCurrentCity(): Promise<string> {
    const supabase = await createClient();
    const user = await this.getUser();

    // Get user's first city (for multi-city users, app sets preference)
    const { data } = await supabase
      .from('user_city_roles')
      .select('city_id')
      .eq('user_id', user.id)
      .limit(1)
      .single();

    if (!data) throw new Error('User not member of any city');
    return data.city_id;
  },

  /**
   * Get city details
   */
  async getCity(cityId?: string) {
    const supabase = await createClient();
    const id = cityId || await this.getCurrentCity();

    const { data, error } = await supabase
      .from('cities')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Get all cities (super admin only)
   */
  async getAllCities() {
    const supabase = await createClient();

    // RLS will filter based on user role
    const { data, error } = await supabase
      .from('cities')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) throw error;
    return data;
  },

  /**
   * Update city settings (city admin only)
   */
  async updateCity(cityId: string, updates: Partial<City>) {
    const supabase = await createClient();

    // RLS ensures only city admin can update
    const { data, error } = await supabase
      .from('cities')
      .update(updates)
      .eq('id', cityId)
      .select()
      .single();

    if (error) throw error;

    // Emit event for other features to react
    await events.emit('city:updated', { cityId, updates });

    return data;
  },
};
```

---

#### 3. Group Functions

```typescript
export const CoreAPI = {
  // ... user and city functions

  /**
   * Get groups for current city
   */
  async getGroups(cityId?: string) {
    const supabase = await createClient();
    const id = cityId || await this.getCurrentCity();

    const { data, error } = await supabase
      .from('groups')
      .select('*')
      .eq('city_id', id)
      .order('name');

    if (error) throw error;
    return data;
  },

  /**
   * Get group members
   */
  async getGroupMembers(groupId: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('group_members')
      .select(`
        *,
        profiles (display_name, avatar_url)
      `)
      .eq('group_id', groupId);

    if (error) throw error;
    return data;
  },
};
```

---

### Usage in Features

```typescript
// features/events/actions.ts
import { CoreAPI } from '@/lib/core/api';

export async function createEvent(formData: FormData) {
  // Get current city via CoreAPI (don't query directly)
  const city = await CoreAPI.getCity();

  // Verify user is admin
  const isAdmin = await CoreAPI.isAdmin(city.id);
  if (!isAdmin) {
    throw new Error('Unauthorized');
  }

  // Create event...
}
```

---

## Event Bus: Feature-to-Feature Communication

### Overview

The Event Bus allows features to communicate without direct dependencies.

**Pattern:**
- Feature A emits event: `events.emit('post:published', { postId })`
- Feature B listens: `events.on('post:published', async (data) => { ... })`

**Phase 1 Implementation:** Simple TypeScript EventEmitter
**Phase 2 Implementation:** Supabase Realtime or Edge Functions (for persistence)

---

### Event Bus API

**Location:** `lib/core/events.ts`

```typescript
// lib/core/events.ts
import { EventEmitter } from 'events';

class EventBus extends EventEmitter {
  /**
   * Emit an event with typed data
   */
  async emit(event: string, data: any): Promise<boolean> {
    console.log(`[EventBus] Emitting: ${event}`, data);
    return super.emit(event, data);
  }

  /**
   * Listen to an event
   */
  on(event: string, handler: (data: any) => void | Promise<void>): this {
    console.log(`[EventBus] Listener added: ${event}`);
    return super.on(event, handler);
  }

  /**
   * Listen once
   */
  once(event: string, handler: (data: any) => void | Promise<void>): this {
    return super.once(event, handler);
  }

  /**
   * Remove listener
   */
  off(event: string, handler: (data: any) => void | Promise<void>): this {
    return super.off(event, handler);
  }
}

export const events = new EventBus();

// Increase max listeners (features may have multiple handlers)
events.setMaxListeners(50);
```

---

### Core Events

These events are emitted by the Core layer:

| Event | Data | When Emitted |
|-------|------|--------------|
| `user:created` | `{ userId, email }` | User signs up |
| `user:joined_city` | `{ userId, cityId, role }` | User added to city |
| `city:created` | `{ cityId, name, slug }` | Super admin creates city |
| `city:updated` | `{ cityId, updates }` | City settings changed |
| `group:created` | `{ groupId, cityId, name }` | New group created |

**Example:**
```typescript
// In auth confirmation route (app/auth/confirm/route.ts)
import { events } from '@/lib/core/events';

// After user confirms email
await events.emit('user:created', {
  userId: user.id,
  email: user.email,
});
```

---

### Feature Events

Features emit their own events for other features to consume:

| Feature | Event | Data |
|---------|-------|------|
| Events | `event:created` | `{ eventId, cityId, title }` |
| Events | `event:rsvp_added` | `{ eventId, userId }` |
| Blog | `post:published` | `{ postId, cityId, title, authorId }` |
| Blog | `post:unpublished` | `{ postId }` |
| Projects | `project:submitted` | `{ projectId, cityId, title }` |
| Projects | `project:approved` | `{ projectId }` |
| Newsletter | `subscriber:added` | `{ email, cityId }` |

**Example:**
```typescript
// features/events/actions.ts
import { events } from '@/lib/core/events';

export async function createEvent(data: EventData) {
  // Insert event into database
  const event = await supabase.from('events').insert(data).select().single();

  // Emit event for other features
  await events.emit('event:created', {
    eventId: event.id,
    cityId: event.city_id,
    title: event.title,
  });

  return event;
}
```

---

### Event Listeners

**Location:** Each feature registers listeners in its initialization file.

```typescript
// features/newsletter/listeners.ts
import { events } from '@/lib/core/events';
import { sendNewsletterToSubscribers } from './actions';

export function registerNewsletterListeners() {
  // When blog post published, notify subscribers
  events.on('post:published', async (data) => {
    console.log('[Newsletter] New post published, sending to subscribers...');

    await sendNewsletterToSubscribers({
      cityId: data.cityId,
      subject: `New Post: ${data.title}`,
      content: `Check out our latest post: ${data.title}`,
    });
  });

  // When event created, notify event subscribers
  events.on('event:created', async (data) => {
    console.log('[Newsletter] New event created, notifying subscribers...');

    await sendNewsletterToSubscribers({
      cityId: data.cityId,
      subject: `New Event: ${data.title}`,
      content: `Don't miss: ${data.title}`,
    });
  });
}
```

**Registration in app initialization:**
```typescript
// app/layout.tsx (or dedicated init file)
import { registerNewsletterListeners } from '@/features/newsletter/listeners';

// Initialize all feature listeners
registerNewsletterListeners();
// ... other features
```

---

### Event Bus Best Practices

#### 1. Events are Fire-and-Forget

```typescript
// ✅ Good: Emit and continue
await events.emit('event:created', { eventId });
return event; // Don't wait for listeners

// ❌ Bad: Don't wait for listeners to finish
await events.emit('event:created', { eventId });
await waitForListenersToComplete(); // Not possible, not needed
```

**Why:** Listeners run asynchronously. Emitter doesn't block.

---

#### 2. Listeners Must Handle Errors

```typescript
// ✅ Good: Wrap in try/catch
events.on('post:published', async (data) => {
  try {
    await sendNewsletterToSubscribers(data);
  } catch (error) {
    console.error('[Newsletter] Failed to send newsletter:', error);
    // Log to monitoring service (e.g., Sentry)
  }
});

// ❌ Bad: Unhandled errors crash event bus
events.on('post:published', async (data) => {
  await sendNewsletterToSubscribers(data); // If this throws, event bus breaks
});
```

---

#### 3. Event Data is Minimal

```typescript
// ✅ Good: IDs only, let listener fetch full data
await events.emit('event:created', {
  eventId: event.id,
  cityId: event.city_id,
});

// ❌ Bad: Sending entire object
await events.emit('event:created', {
  ...event,  // Full event object (wasteful, may have sensitive data)
});
```

**Why:** Listeners can fetch what they need via CoreAPI.

---

#### 4. Document Events in Feature Specs

Each feature doc (e.g., `docs/features/events.md`) lists:
- **Events it emits**
- **Events it listens to**

---

## Type Safety (Phase 2)

**Phase 1:** Event data is `any`
**Phase 2:** Use TypeScript for type-safe events

```typescript
// lib/core/events.types.ts
export type EventMap = {
  'user:created': { userId: string; email: string };
  'event:created': { eventId: string; cityId: string; title: string };
  'post:published': { postId: string; cityId: string; title: string; authorId: string };
};

// Typed event bus
class TypedEventBus {
  emit<K extends keyof EventMap>(event: K, data: EventMap[K]): boolean { ... }
  on<K extends keyof EventMap>(event: K, handler: (data: EventMap[K]) => void): this { ... }
}
```

---

## Testing Event Bus

```typescript
// test/core/events.test.ts
import { events } from '@/lib/core/events';

test('event:created emits and listeners receive', async () => {
  const received: any[] = [];

  events.on('event:created', (data) => {
    received.push(data);
  });

  await events.emit('event:created', { eventId: '123', cityId: 'abc', title: 'Test' });

  expect(received).toHaveLength(1);
  expect(received[0].eventId).toBe('123');
});

test('multiple listeners receive same event', async () => {
  let listener1Called = false;
  let listener2Called = false;

  events.on('test:event', () => { listener1Called = true; });
  events.on('test:event', () => { listener2Called = true; });

  await events.emit('test:event', {});

  expect(listener1Called).toBe(true);
  expect(listener2Called).toBe(true);
});
```

---

## Atomic Implementation Units

### Unit 1: CoreAPI
- **File:** `lib/core/api.ts`
- **Acceptance Criteria:**
  - ✅ User, city, group functions implemented
  - ✅ Used in at least one feature (e.g., Events)

### Unit 2: Event Bus
- **File:** `lib/core/events.ts`
- **Acceptance Criteria:**
  - ✅ EventEmitter wrapped
  - ✅ Logging added for debugging

### Unit 3: Core Event Emitters
- **Files:** `app/auth/confirm/route.ts`, admin actions
- **Acceptance Criteria:**
  - ✅ `user:created`, `city:created` emitted

### Unit 4: Feature Listeners
- **Files:** `features/*/listeners.ts`
- **Acceptance Criteria:**
  - ✅ At least one cross-feature integration (e.g., Blog → Newsletter)

---

## Summary

**CoreAPI** provides:
- ✅ Encapsulated access to core data
- ✅ Consistent error handling
- ✅ Easy mocking for tests

**Event Bus** provides:
- ✅ Loose coupling between features
- ✅ Extensibility (new features can listen to existing events)
- ✅ Clear audit trail (all events logged)

**Next Steps:**
- Start building features (see `docs/features/*.md`)
- Implement event listeners as features are built
- Read [docs/implementation/testing.md](../implementation/testing.md) for testing patterns
