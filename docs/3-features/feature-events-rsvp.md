# Feature: Events Management

**Document Type:** Feature Specification
**Stability Level:** Stable
**Priority:** Critical (Phase 2)
**Estimated Complexity:** Medium
**Dependencies:** [core/01-data-model.md](../core/01-data-model.md), [core/05-api-contracts.md](../core/05-api-contracts.md)
**Last Updated:** 2025-11-05

---

## Purpose

Enable city admins to create and manage community events, and allow members to RSVP.

**Scope:** Event CRUD, RSVP tracking, basic list/detail views

**Out of Scope (Phase 2+):** Calendar view, recurring events, email reminders, iCal export

---

## User Stories

### Primary User Story

**As a** city admin,
**I want** to create events and track RSVPs,
**So that** I can organize community gatherings and know attendance.

### Additional Stories

1. **As a** member, **I want** to RSVP to events, **So that** I can attend and the organizer knows I'm coming.
2. **As a** visitor, **I want** to see upcoming events, **So that** I know what's happening in my local FaithTech community.
3. **As a** city admin, **I want** to see who RSVP'd, **So that** I can plan logistics (venue size, food, etc.).

---

## Data Model

### Tables

```sql
-- Main events table
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id UUID NOT NULL REFERENCES cities(id) ON DELETE CASCADE,

  -- Event details
  title TEXT NOT NULL,
  description TEXT,
  slug TEXT NOT NULL,  -- URL-friendly (e.g., "april-meetup-2025")

  -- Date & Location
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ,
  location_name TEXT,  -- "WeWork Adelaide CBD"
  location_address TEXT,
  location_url TEXT,   -- Google Maps link

  -- Capacity
  max_attendees INT,  -- NULL = unlimited

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),

  UNIQUE(city_id, slug)  -- Slugs unique per city
);

CREATE INDEX events_city_idx ON events(city_id);
CREATE INDEX events_starts_at_idx ON events(starts_at DESC);

-- RSVPs
CREATE TABLE event_rsvps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- RSVP status
  status TEXT DEFAULT 'yes' CHECK (status IN ('yes', 'no', 'maybe')),

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(event_id, user_id)  -- One RSVP per user per event
);

CREATE INDEX event_rsvps_event_idx ON event_rsvps(event_id);
CREATE INDEX event_rsvps_user_idx ON event_rsvps(user_id);
```

---

## RLS Policies

```sql
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_rsvps ENABLE ROW LEVEL SECURITY;

-- EVENTS: SELECT (city isolation)
CREATE POLICY "events_select" ON events
  FOR SELECT
  USING (city_id = auth.current_city());

-- EVENTS: INSERT (city admins only)
CREATE POLICY "events_insert" ON events
  FOR INSERT
  WITH CHECK (
    city_id = auth.current_city()
    AND auth.user_role(city_id) IN ('city_admin', 'super_admin')
  );

-- EVENTS: UPDATE (city admins only)
CREATE POLICY "events_update" ON events
  FOR UPDATE
  USING (
    city_id = auth.current_city()
    AND auth.user_role(city_id) IN ('city_admin', 'super_admin')
  );

-- EVENTS: DELETE (city admins only)
CREATE POLICY "events_delete" ON events
  FOR DELETE
  USING (
    city_id = auth.current_city()
    AND auth.user_role(city_id) IN ('city_admin', 'super_admin')
  );

-- RSVPs: SELECT (everyone can see RSVPs)
CREATE POLICY "rsvps_select" ON event_rsvps
  FOR SELECT
  USING (TRUE);

-- RSVPs: INSERT (members can RSVP)
CREATE POLICY "rsvps_insert" ON event_rsvps
  FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM events WHERE id = event_id AND city_id = auth.current_city()
    )
  );

-- RSVPs: UPDATE (users can update their own RSVP)
CREATE POLICY "rsvps_update" ON event_rsvps
  FOR UPDATE
  USING (user_id = auth.uid());

-- RSVPs: DELETE (users can delete their own RSVP)
CREATE POLICY "rsvps_delete" ON event_rsvps
  FOR DELETE
  USING (user_id = auth.uid());
```

---

## API Routes (Server Actions)

**File:** `features/events/actions.ts`

```typescript
'use server'
import { createClient } from '@/lib/supabase/server';
import { CoreAPI, events } from '@/lib/core';
import { revalidatePath } from 'next/cache';

export async function createEvent(formData: FormData) {
  const supabase = await createClient();
  const cityId = await CoreAPI.getCurrentCity();

  // Verify permission
  const isAdmin = await CoreAPI.isAdmin(cityId);
  if (!isAdmin) return { error: 'Unauthorized' };

  // Generate slug
  const title = formData.get('title') as string;
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  // Insert event
  const { data, error } = await supabase
    .from('events')
    .insert({
      city_id: cityId,
      title,
      description: formData.get('description'),
      slug,
      starts_at: formData.get('starts_at'),
      ends_at: formData.get('ends_at'),
      location_name: formData.get('location_name'),
      location_address: formData.get('location_address'),
      max_attendees: formData.get('max_attendees') ? parseInt(formData.get('max_attendees') as string) : null,
      created_by: (await CoreAPI.getUser()).id,
    })
    .select()
    .single();

  if (error) return { error: error.message };

  // Emit event
  await events.emit('event:created', {
    eventId: data.id,
    cityId,
    title: data.title,
  });

  revalidatePath('/protected/admin/events');
  return { data };
}

export async function updateEvent(id: string, formData: FormData) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('events')
    .update({
      title: formData.get('title'),
      description: formData.get('description'),
      starts_at: formData.get('starts_at'),
      ends_at: formData.get('ends_at'),
      location_name: formData.get('location_name'),
      location_address: formData.get('location_address'),
      max_attendees: formData.get('max_attendees') ? parseInt(formData.get('max_attendees') as string) : null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) return { error: error.message };

  await events.emit('event:updated', { eventId: id });
  revalidatePath('/protected/admin/events');
  return { data };
}

export async function deleteEvent(id: string) {
  const supabase = await createClient();

  const { error } = await supabase.from('events').delete().eq('id', id);

  if (error) return { error: error.message };

  await events.emit('event:deleted', { eventId: id });
  revalidatePath('/protected/admin/events');
  return { success: true };
}

export async function rsvpToEvent(eventId: string, status: 'yes' | 'no' | 'maybe') {
  const supabase = await createClient();
  const user = await CoreAPI.getUser();

  const { data, error } = await supabase
    .from('event_rsvps')
    .upsert({
      event_id: eventId,
      user_id: user.id,
      status,
    })
    .select()
    .single();

  if (error) return { error: error.message };

  await events.emit('event:rsvp_added', { eventId, userId: user.id, status });
  revalidatePath(`/events/${eventId}`);
  return { data };
}
```

---

## UI Components

### Admin UI

**Location:** `app/protected/admin/events/`

**`page.tsx`** - Event list
```typescript
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default async function EventsAdminPage() {
  const supabase = await createClient();
  const { data: events } = await supabase
    .from('events')
    .select('*')
    .order('starts_at', { ascending: false });

  return (
    <div>
      <div className="flex justify-between mb-4">
        <h1>Events</h1>
        <Button asChild>
          <Link href="/protected/admin/events/new">Create Event</Link>
        </Button>
      </div>

      {events?.map(event => (
        <div key={event.id} className="border p-4 mb-2">
          <h3>{event.title}</h3>
          <p>{new Date(event.starts_at).toLocaleDateString()}</p>
          <Link href={`/protected/admin/events/${event.id}`}>Edit</Link>
        </div>
      ))}
    </div>
  );
}
```

**`new/page.tsx`** - Create event form
```typescript
import { EventForm } from '../EventForm';

export default function NewEventPage() {
  return (
    <div>
      <h1>Create Event</h1>
      <EventForm />
    </div>
  );
}
```

**`[id]/page.tsx`** - Edit event + RSVP list
```typescript
import { createClient } from '@/lib/supabase/server';
import { EventForm } from '../EventForm';

export default async function EditEventPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();

  const { data: event } = await supabase
    .from('events')
    .select('*')
    .eq('id', params.id)
    .single();

  const { data: rsvps } = await supabase
    .from('event_rsvps')
    .select('*, profiles(display_name, avatar_url)')
    .eq('event_id', params.id)
    .eq('status', 'yes');

  return (
    <div>
      <h1>Edit Event</h1>
      <EventForm event={event} />

      <hr className="my-8" />

      <h2>RSVPs ({rsvps?.length || 0})</h2>
      {rsvps?.map(rsvp => (
        <div key={rsvp.id}>
          {rsvp.profiles.display_name}
        </div>
      ))}
    </div>
  );
}
```

---

### Public UI

**Location:** `app/[citySlug]/events/`

**`page.tsx`** - Public event list
```typescript
import { createClient } from '@/lib/supabase/server';

export default async function CityEventsPage({ params }: { params: { citySlug: string } }) {
  const supabase = await createClient();

  // Get city by slug
  const { data: city } = await supabase
    .from('cities')
    .select('id, name')
    .eq('slug', params.citySlug)
    .single();

  if (!city) return <div>City not found</div>;

  // Get upcoming events
  const { data: events } = await supabase
    .from('events')
    .select('*')
    .eq('city_id', city.id)
    .gte('starts_at', new Date().toISOString())
    .order('starts_at');

  return (
    <div>
      <h1>Events - {city.name}</h1>
      {events?.map(event => (
        <div key={event.id} className="border p-4 mb-4">
          <h2>{event.title}</h2>
          <p>{new Date(event.starts_at).toLocaleDateString()}</p>
          <a href={`/${params.citySlug}/events/${event.slug}`}>View Details</a>
        </div>
      ))}
    </div>
  );
}
```

**`[slug]/page.tsx`** - Event detail + RSVP button
```typescript
import { createClient } from '@/lib/supabase/server';
import { RSVPButton } from './RSVPButton';

export default async function EventDetailPage({ params }: { params: { citySlug: string; slug: string } }) {
  const supabase = await createClient();

  const { data: event } = await supabase
    .from('events')
    .select('*, cities(name)')
    .eq('slug', params.slug)
    .single();

  const { data: rsvps } = await supabase
    .from('event_rsvps')
    .select('count')
    .eq('event_id', event.id)
    .eq('status', 'yes')
    .single();

  return (
    <div>
      <h1>{event.title}</h1>
      <p>{event.description}</p>
      <p><strong>When:</strong> {new Date(event.starts_at).toLocaleString()}</p>
      <p><strong>Where:</strong> {event.location_name}</p>
      <p><strong>RSVPs:</strong> {rsvps?.count || 0}</p>

      <RSVPButton eventId={event.id} />
    </div>
  );
}

export async function generateMetadata({ params }) {
  // ... SEO metadata
}
```

---

## Event Bus Integration

### Events Emitted

| Event | Data | When |
|-------|------|------|
| `event:created` | `{ eventId, cityId, title }` | Event created by admin |
| `event:updated` | `{ eventId }` | Event updated |
| `event:deleted` | `{ eventId }` | Event deleted |
| `event:rsvp_added` | `{ eventId, userId, status }` | User RSVPs |

---

### Events Listened To

| Event | Handler | Purpose |
|-------|---------|---------|
| `user:joined_city` | `send_welcome_events` | Show new members upcoming events |

**Implementation:**
```typescript
// features/events/listeners.ts
import { events } from '@/lib/core/events';

export function registerEventsListeners() {
  events.on('user:joined_city', async (data) => {
    console.log(`[Events] New user joined ${data.cityId}, could send welcome email with upcoming events`);
    // Phase 2: Send email with upcoming events
  });
}
```

---

## Page Routes

| Route | Access | Purpose |
|-------|--------|---------|
| `/protected/admin/events` | City Admin | Manage events |
| `/protected/admin/events/new` | City Admin | Create event |
| `/protected/admin/events/[id]` | City Admin | Edit event + view RSVPs |
| `/[citySlug]/events` | Public | View upcoming events |
| `/[citySlug]/events/[slug]` | Public | Event detail + RSVP |

---

## Acceptance Criteria

### Data Layer
- [x] `events` table created with city_id, slug unique per city
- [x] `event_rsvps` table created with unique constraint (one RSVP per user per event)
- [x] RLS: Admins CRUD events, members can RSVP
- [x] Indexes on city_id, starts_at, event_id

### Business Logic
- [x] City admins create/edit/delete events
- [x] Slug auto-generated from title
- [x] Members can RSVP (yes/no/maybe)
- [x] RSVP count visible on event detail
- [x] Events scoped to city (Adelaide events ≠ Sydney events)

### UI
- [x] Admin: List all events, create new, edit existing
- [x] Admin: View RSVP list for each event
- [x] Public: View upcoming events for city
- [x] Public: RSVP button (requires login)
- [x] Forms validate required fields (title, starts_at)

### Integration
- [x] Uses CoreAPI.getCurrentCity() (not direct query)
- [x] Emits `event:created` event
- [x] No direct imports from other features

---

## Atomic Implementation Units

### Unit 1: Database Schema
- **File:** `supabase/migrations/020_create_events.sql`
- **Acceptance Criteria:** Tables created, RLS enabled

### Unit 2: Server Actions
- **File:** `features/events/actions.ts`
- **Acceptance Criteria:** CRUD actions work

### Unit 3: Admin UI
- **Files:** `app/protected/admin/events/**/*.tsx`
- **Acceptance Criteria:** Admins can manage events

### Unit 4: Public UI
- **Files:** `app/[citySlug]/events/**/*.tsx`
- **Acceptance Criteria:** Public can view + RSVP

---

## Future Enhancements (Phase 2+)

- Calendar view (month/week grid)
- Recurring events (e.g., "Monthly meetup, first Thursday")
- Email reminders (24h before event)
- iCal export (.ics file for calendar apps)
- Event categories/tags
- Waitlist (when max_attendees reached)
- Check-in QR codes

---

## Summary

Events feature provides:
- ✅ City admins can organize community gatherings
- ✅ Members can RSVP and see attendance
- ✅ Public can discover upcoming events
- ✅ Multi-tenant (each city's events are isolated)
