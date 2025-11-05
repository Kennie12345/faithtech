# Feature: [Feature Name]

**Document Type:** Feature Specification
**Stability Level:** [Stable/Volatile]
**Priority:** [Critical/High/Medium/Low]
**Estimated Complexity:** [Simple/Medium/Complex]
**Dependencies:** [List other docs or features required]
**Last Updated:** YYYY-MM-DD

---

## Purpose

[One-sentence description of what this feature does and why it exists]

**Scope:** [What IS included in this feature]

**Out of Scope (Phase 2+):** [What is NOT included in V1]

---

## User Stories

### Primary User Story

**As a** [role],
**I want** [capability],
**So that** [benefit].

### Additional Stories

1. **As a** [role], **I want** [capability], **So that** [benefit].
2. **As a** [role], **I want** [capability], **So that** [benefit].

---

## Data Model

### Tables

```sql
CREATE TABLE [table_name] (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id UUID NOT NULL REFERENCES cities(id) ON DELETE CASCADE,

  -- Feature-specific columns
  [column_name] [type] [constraints],

  -- Audit trail
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Indexes
CREATE INDEX [table]_city_idx ON [table_name](city_id);
CREATE INDEX [table]_created_at_idx ON [table_name](created_at DESC);
```

### Relationships

[Describe foreign keys, many-to-many tables, etc.]

---

## RLS Policies

```sql
ALTER TABLE [table_name] ENABLE ROW LEVEL SECURITY;

-- SELECT: City isolation
CREATE POLICY "[table]_select" ON [table_name]
  FOR SELECT
  USING (city_id = auth.current_city());

-- INSERT: Only city admins
CREATE POLICY "[table]_insert" ON [table_name]
  FOR INSERT
  WITH CHECK (
    city_id = auth.current_city()
    AND auth.user_role(city_id) IN ('city_admin', 'super_admin')
  );

-- UPDATE: Only city admins
CREATE POLICY "[table]_update" ON [table_name]
  FOR UPDATE
  USING (
    city_id = auth.current_city()
    AND auth.user_role(city_id) IN ('city_admin', 'super_admin')
  );

-- DELETE: Only city admins
CREATE POLICY "[table]_delete" ON [table_name]
  FOR DELETE
  USING (
    city_id = auth.current_city()
    AND auth.user_role(city_id) IN ('city_admin', 'super_admin')
  );
```

**Variations:**
- [Note any special cases, e.g., "Members can INSERT RSVPs"]

---

## API Routes (Server Actions)

### Create [Entity]

**File:** `features/[feature]/actions.ts`

```typescript
'use server'
import { createClient } from '@/lib/supabase/server';
import { CoreAPI, events } from '@/lib/core';

export async function create[Entity](formData: FormData) {
  const supabase = await createClient();

  // Get current city
  const cityId = await CoreAPI.getCurrentCity();

  // Verify permission
  const isAdmin = await CoreAPI.isAdmin(cityId);
  if (!isAdmin) {
    return { error: 'Unauthorized' };
  }

  // Insert entity
  const { data, error } = await supabase
    .from('[table_name]')
    .insert({
      city_id: cityId,
      [field]: formData.get('[field]'),
      created_by: (await CoreAPI.getUser()).id,
    })
    .select()
    .single();

  if (error) return { error: error.message };

  // Emit event
  await events.emit('[feature]:[entity]:created', {
    [entity]Id: data.id,
    cityId,
  });

  return { data };
}
```

### Update [Entity]

```typescript
export async function update[Entity](id: string, updates: Partial<Entity>) {
  // Similar pattern...
}
```

### Delete [Entity]

```typescript
export async function delete[Entity](id: string) {
  // Similar pattern...
}
```

---

## UI Components

### Admin UI

**Location:** `features/[feature]/admin/`

Components for city admins to manage feature:

1. **[Entity]List** - Display all entities
2. **[Entity]Form** - Create/edit entity
3. **[Entity]Detail** - View single entity

**Example:**
```typescript
// features/[feature]/admin/[Entity]List.tsx
import { createClient } from '@/lib/supabase/server';

export default async function [Entity]List() {
  const supabase = await createClient();

  const { data: entities } = await supabase
    .from('[table_name]')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div>
      {entities?.map(entity => (
        <[Entity]Card key={entity.id} entity={entity} />
      ))}
    </div>
  );
}
```

---

### Public UI

**Location:** `features/[feature]/public/`

Components visible to all visitors (no auth required):

1. **[Entity]List** - Public listing
2. **[Entity]Detail** - Public detail view

**Example:**
```typescript
// features/[feature]/public/[Entity]List.tsx
export default async function Public[Entity]List({ citySlug }: { citySlug: string }) {
  // Fetch entities for specific city (via slug)
  // No auth required, but city_id scoped via slug lookup
}
```

---

## Page Routes

| Route | Component | Access | Purpose |
|-------|-----------|--------|---------|
| `/protected/admin/[feature]` | [Entity]List | City Admin | Manage entities |
| `/protected/admin/[feature]/new` | [Entity]Form | City Admin | Create entity |
| `/protected/admin/[feature]/[id]` | [Entity]Form | City Admin | Edit entity |
| `/[citySlug]/[feature]` | Public[Entity]List | Public | View entities |
| `/[citySlug]/[feature]/[slug]` | Public[Entity]Detail | Public | View single entity |

---

## Event Bus Integration

### Events Emitted

| Event | Data | When |
|-------|------|------|
| `[feature]:[entity]:created` | `{ [entity]Id, cityId }` | Entity created |
| `[feature]:[entity]:updated` | `{ [entity]Id, updates }` | Entity updated |
| `[feature]:[entity]:deleted` | `{ [entity]Id }` | Entity deleted |

**Implementation:**
```typescript
// In server actions
await events.emit('[feature]:[entity]:created', { [entity]Id, cityId });
```

---

### Events Listened To

| Event | Handler | Purpose |
|-------|---------|---------|
| `[core_event]` | [handler_name] | [What it does] |

**Implementation:**
```typescript
// features/[feature]/listeners.ts
import { events } from '@/lib/core/events';

export function register[Feature]Listeners() {
  events.on('[core_event]', async (data) => {
    // Handle event...
  });
}
```

---

## SEO & Metadata

[If applicable, describe meta tags, Open Graph, structured data]

**Example:**
```typescript
// features/[feature]/public/[Entity]Detail.tsx
export async function generateMetadata({ params }): Promise<Metadata> {
  const entity = await fetch[Entity](params.slug);

  return {
    title: entity.title,
    description: entity.description,
    openGraph: {
      title: entity.title,
      description: entity.description,
      images: [entity.image_url],
    },
  };
}
```

---

## Acceptance Criteria

### Data Layer
- [ ] Migration creates table with correct schema
- [ ] RLS policies applied and tested
- [ ] Indexes created on `city_id` and `created_at`

### Business Logic
- [ ] City admins can create/edit/delete entities
- [ ] Members cannot create/edit/delete (RLS enforced)
- [ ] Events emitted on create/update/delete

### UI
- [ ] Admin UI: List, create, edit, delete entities
- [ ] Public UI: View entities (city-scoped)
- [ ] Forms validate input (client + server-side)

### Integration
- [ ] Feature uses CoreAPI (not direct Supabase queries to core tables)
- [ ] Event listeners registered and working
- [ ] No direct imports from other features

### Testing
- [ ] RLS policies tested (members vs. admins)
- [ ] Server actions tested (success + error cases)
- [ ] Public pages render correctly

---

## Atomic Implementation Units

Break feature into small, independent tasks:

### Unit 1: Database Schema
- **Files:** `supabase/migrations/0XX_create_[table].sql`
- **Tasks:**
  - Create table with columns
  - Add indexes
  - Enable RLS
- **Acceptance Criteria:** Migration runs, table queryable

### Unit 2: RLS Policies
- **Files:** `supabase/migrations/0XX_rls_[table].sql`
- **Tasks:**
  - Add SELECT, INSERT, UPDATE, DELETE policies
- **Acceptance Criteria:** Test with different user roles

### Unit 3: Server Actions
- **Files:** `features/[feature]/actions.ts`
- **Tasks:**
  - Implement create/update/delete functions
- **Acceptance Criteria:** Actions work in admin UI

### Unit 4: Admin UI
- **Files:** `features/[feature]/admin/*.tsx`
- **Tasks:**
  - Build list, form, detail components
- **Acceptance Criteria:** City admin can CRUD entities

### Unit 5: Public UI
- **Files:** `features/[feature]/public/*.tsx`
- **Tasks:**
  - Build public-facing pages
- **Acceptance Criteria:** Visitors can view entities

### Unit 6: Event Integration
- **Files:** `features/[feature]/listeners.ts`
- **Tasks:**
  - Register event listeners
  - Emit events in actions
- **Acceptance Criteria:** Cross-feature integration works

---

## Testing Checklist

**Database:**
- [ ] Table created with correct schema
- [ ] Foreign keys enforce referential integrity
- [ ] RLS allows city admins, blocks members

**Server Actions:**
- [ ] Create: Success case returns entity
- [ ] Create: Error case returns error message
- [ ] Update: Only own city's entities
- [ ] Delete: RLS prevents cross-city deletion

**UI:**
- [ ] Admin list shows all city entities
- [ ] Admin form validates required fields
- [ ] Public list is city-scoped via slug
- [ ] Public detail page has correct SEO metadata

**Events:**
- [ ] Create emits `[entity]:created` event
- [ ] Listeners receive events and react correctly

---

## Future Enhancements (Phase 2+)

[List features deferred to later phases]

Examples:
- Advanced filtering/search
- Pagination
- Export to CSV
- Email notifications
- Comments/reactions
- Analytics dashboard

---

## Open Questions

[Items that need decisions before implementation]

Examples:
- Should entities support draft/published states?
- What's the default sort order (newest first? alphabetical)?
- Should deleted entities be soft-deleted or hard-deleted?

---

## Summary

This feature provides:
- ✅ [Key benefit 1]
- ✅ [Key benefit 2]
- ✅ [Key benefit 3]

**Dependencies:**
- Requires CoreAPI for city/user data
- Emits events for other features to consume

**Next Steps:**
- Implement Unit 1 (database schema)
- Follow template for remaining units
