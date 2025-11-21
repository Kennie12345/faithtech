# Functional Programming Enforcer

## Purpose
Enforce functional programming patterns appropriate for React/Next.js applications. This skill ensures code is written in a declarative, composable, and side-effect-free style using vanilla JavaScript/TypeScript FP patterns.

## When to Activate
This skill is **ALWAYS ACTIVE** when:
- Writing any JavaScript/TypeScript code
- Creating functions or components
- Refactoring existing code
- Reviewing code before presenting to user

## Core Principles

### 1. Pure Functions Over Impure Functions
**Rule**: Prefer pure functions that:
- Return the same output for the same input (deterministic)
- Have no side effects (no mutations, no I/O, no external state changes)
- Don't depend on external mutable state

**Auto-Fix Strategy**:
- Move side effects to the edges (useEffect, server actions, event handlers)
- Extract pure logic from impure contexts
- Make dependencies explicit through parameters

**Examples**:

❌ **WRONG** (Impure):
```typescript
let total = 0;

function addToTotal(value: number) {
  total += value;
  return total;
}
```

✅ **AUTO-FIX TO** (Pure):
```typescript
function add(a: number, b: number): number {
  return a + b;
}

// If you need accumulation, use reduce:
const total = values.reduce((sum, value) => add(sum, value), 0);
```

### 2. NO Classes (Except React Components)
**Rule**: Do NOT use classes. Use functions and closures instead.

**Exceptions**:
- React class components (only if absolutely necessary - prefer functional components)
- Extending built-in Error classes for custom errors

**Auto-Fix Strategy**:
- Convert classes to factory functions
- Use closures for encapsulation
- Use object literals for grouping related functions

**Examples**:

❌ **WRONG**:
```typescript
class EventManager {
  private events: Event[] = [];

  addEvent(event: Event) {
    this.events.push(event);
  }

  getEvents() {
    return this.events;
  }
}
```

✅ **AUTO-FIX TO**:
```typescript
interface EventManager {
  addEvent: (event: Event) => EventManager;
  getEvents: () => readonly Event[];
}

function createEventManager(initialEvents: Event[] = []): EventManager {
  let events = [...initialEvents];

  return {
    addEvent: (event) => createEventManager([...events, event]),
    getEvents: () => events as readonly Event[],
  };
}
```

### 3. Immutability Over Mutation
**Rule**: Never mutate data. Create new data structures instead.

**`let` is Acceptable**: Use `let` when necessary for reassignment, but prefer `const`.

**Auto-Fix Strategy**:
- Use spread operator for objects/arrays
- Use array methods that return new arrays (map, filter, reduce)
- Avoid push, pop, splice, etc.
- Avoid direct property assignment

**Examples**:

❌ **WRONG**:
```typescript
function updateEvent(event: Event, title: string): void {
  event.title = title;
  event.updated_at = new Date();
}

const events = [];
events.push(newEvent);
```

✅ **AUTO-FIX TO**:
```typescript
function updateEvent(event: Event, title: string): Event {
  return {
    ...event,
    title,
    updated_at: new Date(),
  };
}

const events = [...previousEvents, newEvent];
// or
const events = previousEvents.concat(newEvent);
```

### 4. Declarative Over Imperative
**Rule**: Express WHAT you want, not HOW to get it.

**Auto-Fix Strategy**:
- Replace for-loops with map/filter/reduce
- Replace if-else chains with expressions or lookup tables
- Use early returns instead of nested conditionals
- Use ternary operators for simple conditionals

**Examples**:

❌ **WRONG** (Imperative):
```typescript
function getActiveEvents(events: Event[]): Event[] {
  const active = [];
  for (let i = 0; i < events.length; i++) {
    if (events[i].status === 'active') {
      active.push(events[i]);
    }
  }
  return active;
}
```

✅ **AUTO-FIX TO** (Declarative):
```typescript
function getActiveEvents(events: Event[]): Event[] {
  return events.filter(event => event.status === 'active');
}
```

❌ **WRONG** (Nested conditionals):
```typescript
function getUserRole(user: User, cityId: string): string {
  if (user) {
    if (user.roles) {
      const role = user.roles.find(r => r.city_id === cityId);
      if (role) {
        return role.role;
      } else {
        return 'member';
      }
    } else {
      return 'member';
    }
  } else {
    return 'guest';
  }
}
```

✅ **AUTO-FIX TO** (Early returns):
```typescript
function getUserRole(user: User | null, cityId: string): string {
  if (!user) return 'guest';
  if (!user.roles) return 'member';

  const role = user.roles.find(r => r.city_id === cityId);
  return role?.role ?? 'member';
}
```

### 5. Function Composition
**Rule**: Build complex behavior by composing simple functions.

**Auto-Fix Strategy**:
- Break large functions into smaller, single-purpose functions
- Chain operations using array methods
- Use pipe-like patterns for data transformations

**Examples**:

❌ **WRONG** (Monolithic):
```typescript
function processEvents(events: Event[]): string[] {
  const active = events.filter(e => e.status === 'active');
  const sorted = active.sort((a, b) => a.starts_at.getTime() - b.starts_at.getTime());
  const titles = sorted.map(e => e.title.toUpperCase());
  return titles;
}
```

✅ **BETTER** (Composed):
```typescript
const isActive = (event: Event): boolean =>
  event.status === 'active';

const byStartDate = (a: Event, b: Event): number =>
  a.starts_at.getTime() - b.starts_at.getTime();

const toUpperTitle = (event: Event): string =>
  event.title.toUpperCase();

function processEvents(events: Event[]): string[] {
  return events
    .filter(isActive)
    .sort(byStartDate)
    .map(toUpperTitle);
}
```

### 6. Avoid Side Effects in Business Logic
**Rule**: Keep side effects at the boundaries. Pure logic in the center.

**Side Effects Include**:
- Database calls
- API requests
- File system operations
- Console logging
- DOM manipulation
- Throwing errors (in business logic - prefer error values)

**Auto-Fix Strategy**:
- Separate "what to do" (pure) from "how to do it" (impure)
- Pass dependencies explicitly
- Return values instead of performing effects

**Examples**:

❌ **WRONG** (Side effects mixed in):
```typescript
function calculateEventCapacity(event: Event): void {
  const { data } = await supabase
    .from('event_rsvps')
    .select('*')
    .eq('event_id', event.id);

  const capacity = event.max_attendees - data.length;
  console.log(`Capacity: ${capacity}`);

  if (capacity <= 0) {
    throw new Error('Event is full');
  }
}
```

✅ **AUTO-FIX TO** (Pure logic, side effects separated):
```typescript
// Pure logic
function calculateRemainingCapacity(
  maxAttendees: number,
  currentAttendees: number
): number {
  return maxAttendees - currentAttendees;
}

function isEventFull(capacity: number): boolean {
  return capacity <= 0;
}

// Side effects at the boundary (server action)
export async function checkEventCapacity(eventId: string): Promise<{ capacity: number; isFull: boolean }> {
  const supabase = await createClient();

  const event = await getEvent(eventId);
  const rsvps = await getEventRSVPs(eventId);

  const capacity = calculateRemainingCapacity(event.max_attendees, rsvps.length);
  const isFull = isEventFull(capacity);

  return { capacity, isFull };
}
```

### 7. Use Standard Array Methods
**Rule**: Prefer built-in array methods over manual loops.

**Preferred Methods**:
- `map` - transform each element
- `filter` - select elements matching predicate
- `reduce` - aggregate into single value
- `find` / `findIndex` - locate element
- `some` / `every` - test conditions
- `flatMap` - map + flatten
- `sort` - order elements (returns new array with spread)

**Examples**:

❌ **WRONG**:
```typescript
const titles = [];
for (const event of events) {
  titles.push(event.title);
}
```

✅ **AUTO-FIX TO**:
```typescript
const titles = events.map(event => event.title);
```

### 8. Vanilla FP Only - No External Libraries
**Rule**: Do NOT use FP libraries like fp-ts, Ramda, Lodash/fp.

**Rationale**:
- Keep dependencies minimal
- Vanilla patterns are sufficient for React/Next.js
- Built-in methods are well-understood and performant

**Use native JS/TS instead**:
- Array methods (map, filter, reduce)
- Optional chaining (`?.`)
- Nullish coalescing (`??`)
- Spread operator (`...`)
- Destructuring

## React/Next.js Specific Patterns

### Functional Components Only
**Rule**: Always use functional components, never class components.

```typescript
// ✅ Functional component
export function EventCard({ event }: { event: Event }) {
  return <div>{event.title}</div>;
}
```

### Pure Rendering Logic
**Rule**: Component render functions should be pure. Side effects go in useEffect.

```typescript
// ❌ WRONG
export function EventList() {
  const events = fetchEvents(); // Side effect in render!
  return <div>{events.map(e => <EventCard key={e.id} event={e} />)}</div>;
}

// ✅ CORRECT
export function EventList({ events }: { events: Event[] }) {
  return <div>{events.map(e => <EventCard key={e.id} event={e} />)}</div>;
}
```

### Server Components = Pure Functions
**Rule**: Server Components should be pure functions that receive props and return JSX.

```typescript
export async function EventPage({ params }: { params: { slug: string } }) {
  const event = await getEvent(params.slug);

  return <EventDetail event={event} />;
}
```

### Data Fetching at the Edge
**Rule**: Fetch data in Server Components or Server Actions, pass down as props.

```typescript
// ✅ Server Component fetches, Client Component consumes
export async function EventPageWrapper() {
  const events = await getEvents();
  return <EventListClient events={events} />;
}
```

## Enforcement Process

### Before Presenting Code
1. **Scan for classes** - auto-convert to functions
2. **Check for mutations** - auto-fix to immutable operations
3. **Replace for-loops** with declarative array methods
4. **Identify side effects** - move to boundaries
5. **Verify purity** - ensure functions are deterministic

### Common Auto-Fixes
- `array.push()` → `[...array, item]`
- `for` loop → `map` / `filter` / `reduce`
- `class` → factory function or object literal
- Direct mutation → spread operator
- Nested if-else → early returns or ternary

## Success Criteria
- Zero classes (except Error extensions)
- No array mutations (push, pop, splice, sort in-place)
- No object mutations (direct property assignment)
- No for-loops (use array methods)
- Side effects isolated to Server Actions, useEffect, event handlers
- Business logic is pure and testable
