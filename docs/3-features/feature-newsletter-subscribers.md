# Feature: Newsletter Subscriber Management

**Priority:** Medium (Phase 1 Milestone C)
**Complexity:** Simple
**Status:** ✅ IMPLEMENTED
**Dependencies:** [core/01-data-model.md](../core/01-data-model.md)

---

## Purpose

Collect email subscribers and export for newsletter campaigns (Mailchimp, etc.).

**Scope:** Subscribe form, unsubscribe, CSV export

**Out of Scope:** Mailchimp integration, email sending, segmentation

---

## User Stories

1. **As a** visitor, **I want** to subscribe to the newsletter, **So that** I get updates about local events.
2. **As a** city admin, **I want** to export subscribers as CSV, **So that** I can import them into Mailchimp.
3. **As a** subscriber, **I want** to unsubscribe easily, **So that** I stop receiving emails.

---

## Data Model

```sql
CREATE TABLE newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id UUID NOT NULL REFERENCES cities(id) ON DELETE CASCADE,

  email TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,

  -- Metadata
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  unsubscribed_at TIMESTAMPTZ,

  UNIQUE(city_id, email)
);

CREATE INDEX newsletter_city_idx ON newsletter_subscribers(city_id);
CREATE INDEX newsletter_active_idx ON newsletter_subscribers(is_active, subscribed_at DESC);
```

---

## RLS Policies

```sql
-- SELECT: City admins only
CREATE POLICY "newsletter_select" ON newsletter_subscribers FOR SELECT USING (
  auth.user_role(city_id) IN ('city_admin', 'super_admin')
);

-- INSERT: Public (no auth required for subscribe)
-- Note: Special handling needed (use service_role for public inserts)

-- UPDATE/DELETE: City admins only
CREATE POLICY "newsletter_update" ON newsletter_subscribers FOR UPDATE USING (
  auth.user_role(city_id) IN ('city_admin', 'super_admin')
);
```

---

## Server Actions

```typescript
'use server'
export async function subscribeToNewsletter(email: string, cityId: string) {
  // Use service_role client for public access
  const supabase = createClient({ role: 'service_role' });

  const { data, error } = await supabase
    .from('newsletter_subscribers')
    .insert({ city_id: cityId, email })
    .select().single();

  if (!error) {
    await events.emit('subscriber:added', { email, cityId });
  }

  return { data, error };
}

export async function unsubscribe(email: string, cityId: string) {
  const supabase = createClient({ role: 'service_role' });

  const { data, error } = await supabase
    .from('newsletter_subscribers')
    .update({ is_active: false, unsubscribed_at: new Date() })
    .eq('city_id', cityId)
    .eq('email', email)
    .select().single();

  return { data, error };
}

export async function exportSubscribers() {
  const cityId = await CoreAPI.getCurrentCity();
  const isAdmin = await CoreAPI.isAdmin(cityId);
  if (!isAdmin) return { error: 'Unauthorized' };

  const { data } = await supabase
    .from('newsletter_subscribers')
    .select('email, subscribed_at')
    .eq('city_id', cityId)
    .eq('is_active', true);

  // Convert to CSV
  const csv = ['Email,Subscribed At', ...data.map(s => `${s.email},${s.subscribed_at}`)].join('\n');

  return { csv };
}
```

---

## UI Routes

| Route | Access | Purpose |
|-------|--------|---------|
| `/protected/admin/newsletter` | City Admin | View/export subscribers |
| `/[citySlug]/subscribe` | Public | Subscribe form |
| `/[citySlug]/unsubscribe` | Public | Unsubscribe form |

---

## Event Bus

**Emits:**
- `subscriber:added` - New subscriber

**Listens:**
- `post:published` - Could auto-send (Phase 2)
- `event:created` - Could auto-send (Phase 2)

**Example Listener:**
```typescript
// features/newsletter/listeners.ts
events.on('post:published', async (data) => {
  console.log('[Newsletter] New post published, could send to subscribers');
  // Phase 2: Trigger Mailchimp campaign
});
```

---

## Acceptance Criteria

- [x] Public subscribe form (no login required)
- [x] Email validation (client + server)
- [x] City admins can export subscribers as CSV
- [x] Unsubscribe link works
- [x] Subscribers scoped to city

---

## Summary

Newsletter feature provides:
- Collect subscriber emails via public form
- Export for Mailchimp/email tools (CSV export)
- GDPR-friendly unsubscribe with data deletion option

## Implementation

**Migration:** `supabase/migrations/024_create_newsletter_subscribers.sql`
**Feature Module:** `features/newsletter/`
**Admin UI:** `/protected/admin/newsletter`
**Public Pages:** `/[citySlug]/subscribe`, `/[citySlug]/unsubscribe`

> **Implementation Status:** ✅ Complete. All acceptance criteria met.
