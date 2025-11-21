# Code Quality Guardian

## Purpose
Automatically review and improve code quality before presenting to the user. This skill ensures code is DRY (Don't Repeat Yourself), orthogonal (separation of concerns), modular (single responsibility), and maintainable for future developers.

## When to Activate
This skill is **ALWAYS ACTIVE** when:
- After writing any code (before presenting to user)
- During refactoring tasks
- When reviewing existing code
- After making changes to existing files

## Core Philosophy

**Prevent quality issues before they reach the user.** Auto-fix violations when possible, explain improvements made.

## Quality Principles

### 1. DRY (Don't Repeat Yourself)
**Rule**: No duplicated code. Extract repeated logic into reusable functions.

**Common Violations**:
- Duplicated functions after refactoring (old version not deleted)
- Copy-pasted logic with minor variations
- Repeated validation logic
- Repeated formatting/transformation logic

**Auto-Fix Strategy**:
1. **Identify duplication**: Look for similar code blocks
2. **Extract to function**: Create shared utility function
3. **Parameterize differences**: Use parameters for variations
4. **Import and reuse**: Replace duplicates with function calls

**Examples**:

❌ **VIOLATION** (Duplicated after refactoring):
```typescript
// features/events/actions.ts
export async function createEvent(formData: FormData) {
  const supabase = await createClient();
  const user = await supabase.auth.getUser();
  const cityId = getCityId(); // Old pattern
  // ... implementation
}

export async function updateEvent(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const cityId = await getCurrentCityId(); // New pattern
  // ... implementation
}

// DEPRECATED - but not deleted!
export async function createEventOld(formData: FormData) {
  // Old implementation
}
```

✅ **AUTO-FIX TO**:
```typescript
// Extract common logic
async function getAuthContext(): Promise<{ user: User; cityId: string } | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const cityId = await getCurrentCityId();
  if (!cityId) return null;

  return { user, cityId };
}

export async function createEvent(formData: FormData) {
  const context = await getAuthContext();
  if (!context) return { error: 'Not authenticated' };

  // ... implementation using context
}

export async function updateEvent(formData: FormData) {
  const context = await getAuthContext();
  if (!context) return { error: 'Not authenticated' };

  // ... implementation using context
}

// DELETE deprecated function entirely
```

❌ **VIOLATION** (Copy-pasted validation):
```typescript
// features/events/actions.ts
export async function createEvent(formData: FormData) {
  const title = formData.get('title') as string;
  if (!title || title.length === 0) {
    return { error: 'Title is required' };
  }
  if (title.length > 200) {
    return { error: 'Title must be 200 characters or less' };
  }
  // ...
}

// features/projects/actions.ts
export async function createProject(formData: FormData) {
  const title = formData.get('title') as string;
  if (!title || title.length === 0) {
    return { error: 'Title is required' };
  }
  if (title.length > 200) {
    return { error: 'Title must be 200 characters or less' };
  }
  // ...
}
```

✅ **AUTO-FIX TO**:
```typescript
// lib/utils/validation.ts
export function validateTitle(title: unknown): { valid: true; value: string } | { valid: false; error: string } {
  if (typeof title !== 'string' || title.length === 0) {
    return { valid: false, error: 'Title is required' };
  }
  if (title.length > 200) {
    return { valid: false, error: 'Title must be 200 characters or less' };
  }
  return { valid: true, value: title };
}

// features/events/actions.ts
export async function createEvent(formData: FormData) {
  const titleValidation = validateTitle(formData.get('title'));
  if (!titleValidation.valid) {
    return { error: titleValidation.error };
  }

  const title = titleValidation.value;
  // ...
}

// features/projects/actions.ts (same pattern)
```

### 2. Orthogonality (Separation of Concerns)
**Rule**: Different concerns should be in different modules. Changes to one concern shouldn't require changes to unrelated code.

**Common Violations**:
- Database logic mixed with business logic
- Validation mixed with data transformation
- UI logic in server actions
- Authorization logic scattered across multiple files

**Auto-Fix Strategy**:
1. **Identify concerns**: Auth, validation, business logic, data access, presentation
2. **Separate into layers**: Extract each concern into its own function/module
3. **Clear boundaries**: Each function has one responsibility
4. **Compose**: Combine separated concerns at the edges

**Examples**:

❌ **VIOLATION** (Multiple concerns mixed):
```typescript
export async function createEvent(formData: FormData) {
  // Concern 1: Auth
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  // Concern 2: Validation
  const title = formData.get('title') as string;
  if (!title) return { error: 'Title required' };

  // Concern 3: Business logic
  const slug = slugify(title);

  // Concern 4: Data access
  const { data: existing } = await supabase
    .from('events')
    .select('id')
    .eq('slug', slug)
    .single();

  // Concern 5: More business logic
  if (existing) {
    const slug = `${slugify(title)}-${Date.now()}`;
  }

  // Concern 6: Data access
  const { data, error } = await supabase
    .from('events')
    .insert({ title, slug })
    .select()
    .single();

  // Concern 7: Side effects
  revalidatePath('/events');

  return { data };
}
```

✅ **AUTO-FIX TO**:
```typescript
// Layer 1: Auth (lib/core/api.ts - already exists)
export async function getAuthContext() { /* ... */ }

// Layer 2: Validation (features/events/schemas.ts - already exists)
export const CreateEventSchema = z.object({
  title: z.string().min(1).max(200),
  // ...
}).strict();

// Layer 3: Business logic (features/events/utils.ts - create)
export async function prepareEventData(
  input: z.infer<typeof CreateEventSchema>,
  cityId: string
): Promise<EventInsert> {
  const slug = await generateUniqueSlug(
    slugify(input.title),
    async (testSlug) => {
      const exists = await checkSlugExists('events', testSlug, cityId);
      return exists;
    }
  );

  return {
    ...input,
    slug,
    city_id: cityId,
  };
}

// Layer 4: Data access (features/events/db.ts - create)
export async function insertEvent(data: EventInsert): Promise<Event> {
  const supabase = await createClient();

  const { data: event, error } = await supabase
    .from('events')
    .insert(data)
    .select()
    .single();

  if (error) throw error;

  return EventSchema.parse(event);
}

// Layer 5: Orchestration (features/events/actions.ts)
export async function createEvent(formData: FormData): Promise<{ data?: Event; error?: string }> {
  try {
    // Auth
    const context = await getAuthContext();
    if (!context) return { error: 'Not authenticated' };

    // Validation
    const input = CreateEventSchema.parse(Object.fromEntries(formData));

    // Business logic
    const eventData = await prepareEventData(input, context.cityId);

    // Data access
    const event = await insertEvent(eventData);

    // Side effects
    revalidatePath('/events');
    emitEvent('event:created', { eventId: event.id, cityId: context.cityId });

    return { data: event };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
```

### 3. Modularity (Single Responsibility)
**Rule**: Each module/function should have ONE clear purpose. A function should do one thing well.

**Auto-Fix Strategy**:
1. **Identify responsibilities**: What are the distinct tasks?
2. **Extract functions**: One function per responsibility
3. **Name descriptively**: Function name = what it does
4. **Compose**: Main function orchestrates smaller functions

**Examples**:

❌ **VIOLATION** (God function):
```typescript
export async function handleEventRSVP(eventId: string, userId: string) {
  const supabase = await createClient();

  // Get event
  const { data: event } = await supabase
    .from('events')
    .select('*')
    .eq('id', eventId)
    .single();

  // Check capacity
  const { data: rsvps } = await supabase
    .from('event_rsvps')
    .select('id')
    .eq('event_id', eventId);

  const remaining = event.max_attendees - rsvps.length;

  if (remaining <= 0) {
    return { error: 'Event is full' };
  }

  // Check existing RSVP
  const { data: existing } = await supabase
    .from('event_rsvps')
    .select('id')
    .eq('event_id', eventId)
    .eq('user_id', userId)
    .single();

  if (existing) {
    return { error: 'Already registered' };
  }

  // Create RSVP
  const { data: rsvp, error } = await supabase
    .from('event_rsvps')
    .insert({ event_id: eventId, user_id: userId })
    .select()
    .single();

  // Send email notification
  await sendEmail(user.email, `You're registered for ${event.title}`);

  // Update cache
  revalidatePath(`/events/${event.slug}`);

  return { data: rsvp };
}
```

✅ **AUTO-FIX TO**:
```typescript
// Each function has ONE responsibility

async function getEvent(eventId: string): Promise<Event | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('events')
    .select('*')
    .eq('id', eventId)
    .single();

  return data ? EventSchema.parse(data) : null;
}

async function getEventRSVPCount(eventId: string): Promise<number> {
  const supabase = await createClient();
  const { count } = await supabase
    .from('event_rsvps')
    .select('*', { count: 'exact', head: true })
    .eq('event_id', eventId);

  return count ?? 0;
}

function hasCapacity(event: Event, currentRSVPs: number): boolean {
  if (!event.max_attendees) return true; // Unlimited
  return currentRSVPs < event.max_attendees;
}

async function checkExistingRSVP(eventId: string, userId: string): Promise<boolean> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('event_rsvps')
    .select('id')
    .eq('event_id', eventId)
    .eq('user_id', userId)
    .maybeSingle();

  return !!data;
}

async function createRSVP(eventId: string, userId: string): Promise<EventRSVP> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('event_rsvps')
    .insert({ event_id: eventId, user_id: userId })
    .select()
    .single();

  if (error) throw error;

  return EventRSVPSchema.parse(data);
}

// Main function orchestrates
export async function handleEventRSVP(
  eventId: string,
  userId: string
): Promise<{ data?: EventRSVP; error?: string }> {
  try {
    const event = await getEvent(eventId);
    if (!event) return { error: 'Event not found' };

    const rsvpCount = await getEventRSVPCount(eventId);
    if (!hasCapacity(event, rsvpCount)) {
      return { error: 'Event is full' };
    }

    const alreadyRegistered = await checkExistingRSVP(eventId, userId);
    if (alreadyRegistered) {
      return { error: 'Already registered' };
    }

    const rsvp = await createRSVP(eventId, userId);

    // Side effects
    emitEvent('event:rsvp_created', { eventId, userId });
    revalidatePath(`/events/${event.slug}`);

    return { data: rsvp };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
```

### 4. Delete Deprecated Code
**Rule**: When refactoring, ALWAYS delete the old code. Never leave deprecated functions.

**Auto-Fix Strategy**:
1. **Identify deprecated code**: Old implementations, unused functions, commented-out code
2. **Verify no references**: Check if anything still uses it
3. **Delete completely**: Remove the code and any related comments
4. **Update exports**: Remove from export statements

**Examples**:

❌ **VIOLATION**:
```typescript
// New implementation
export async function getCurrentCityId(): Promise<string | null> {
  const supabase = await createClient();
  // ... new logic
}

// DEPRECATED - Use getCurrentCityId instead
export function getCityId(): string | null {
  // ... old logic
}

// Old version - keeping for reference
/*
export async function getCurrentCity() {
  const cookies = await getCookies();
  return cookies.get('city');
}
*/
```

✅ **AUTO-FIX TO**:
```typescript
// New implementation only
export async function getCurrentCityId(): Promise<string | null> {
  const supabase = await createClient();
  // ... new logic
}

// Old code DELETED entirely
```

### 5. Avoid Tight Coupling
**Rule**: Modules should depend on abstractions, not concrete implementations. Changes to one module shouldn't break unrelated modules.

**Common Violations**:
- Direct imports between features (should use Event Bus)
- Hardcoded dependencies
- No interfaces/abstractions

**Auto-Fix Strategy**:
1. **Identify coupling**: Where do modules directly depend on each other?
2. **Introduce abstraction**: Event Bus, CoreAPI, or interface
3. **Invert dependency**: Depend on abstraction, not concrete module
4. **Communicate via events**: Features emit events, others listen

**Examples**:

❌ **VIOLATION** (Tight coupling):
```typescript
// features/events/actions.ts
import { createNotification } from '@/features/notifications/actions';

export async function createEvent(formData: FormData) {
  // ... create event

  // Tightly coupled to notifications feature!
  await createNotification({
    type: 'event_created',
    event_id: event.id,
  });

  return { data: event };
}
```

✅ **AUTO-FIX TO** (Loose coupling via Event Bus):
```typescript
// features/events/actions.ts
import { emitEvent } from '@/lib/core/events';

export async function createEvent(formData: FormData) {
  // ... create event

  // Emit event - don't care who listens
  emitEvent('event:created', {
    eventId: event.id,
    cityId: event.city_id,
  });

  return { data: event };
}

// features/notifications/listeners.ts (separate file)
import { registerEventListener } from '@/lib/core/events';
import { createNotification } from './actions';

registerEventListener('event:created', async (payload) => {
  await createNotification({
    type: 'event_created',
    event_id: payload.eventId,
  });
});
```

## Enforcement Process

### After Writing Code (Before Presenting)
1. **Scan for duplication**
   - Look for repeated code blocks (3+ lines)
   - Check for deprecated functions not deleted
   - Identify copy-pasted logic

2. **Check separation of concerns**
   - Are auth, validation, business logic, data access separated?
   - Is any function doing too many things?

3. **Verify single responsibility**
   - Does each function have one clear purpose?
   - Are function names descriptive of their one job?

4. **Find coupling violations**
   - Are features importing from other features directly?
   - Should Event Bus be used instead?

5. **Auto-fix violations**
   - Extract duplicated code to shared utilities
   - Separate concerns into layers
   - Break large functions into smaller ones
   - Delete deprecated code
   - Replace direct imports with Event Bus

6. **Explain improvements**
   - Briefly mention what was refactored
   - Highlight quality improvements made

### When Refactoring
**ALWAYS check**:
1. Did I delete the old implementation?
2. Did I remove all references to the old code?
3. Did I update all call sites to use new implementation?
4. Are there any other duplicates of this pattern to fix?

## Success Criteria
- Zero code duplication (functions, validation, transformations)
- Clear separation of concerns (auth, validation, logic, data access)
- Each function has single responsibility
- No deprecated code remains after refactoring
- Features are loosely coupled (Event Bus, not direct imports)
- Code is self-documenting through good structure
- Future developers can understand and modify easily
