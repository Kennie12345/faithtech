# Architectural Principles: The "Prepared Monolith" Strategy

**Document Type:** Strategic
**Stability Level:** Stable
**Audience:** Engineers
**Last Updated:** 2025-11-05
**Dependencies:** Read [mission-and-vision.md](mission-and-vision.md) first

---

## Core Philosophy

This project balances **pragmatism** (ship in a focused sprint) with **extensibility** (enable global contributions). We achieve this through the **"Prepared Monolith"** strategy:

> Build features as clean, modular packages NOW. Extract to runtime plugins LATER (when we prove the model works).

This avoids two failure modes:
1. **Pure Monolith**: Ships fast but impossible to extend safely → limits community contributions
2. **Premature Plugin Architecture**: Builds complex SDK before proving value → never ships

---

## The Nine Commandments

### 1. Multi-Tenancy By Default

**Principle:** Every piece of data belongs to a city. Multi-tenancy is not optional.

**Why:** FaithTech Australia has multiple cities NOW (not theoretical future). Single-tenant architecture would require painful refactoring.

**Implementation:**
- Every table has `city_id` foreign key (enforced at database level)
- Row-Level Security (RLS) policies enforce city isolation
- Users can belong to multiple cities with different roles

**Example:**
```sql
-- ✅ Correct: Every entity is city-scoped
CREATE TABLE events (
  id UUID PRIMARY KEY,
  city_id UUID NOT NULL REFERENCES cities(id),
  title TEXT NOT NULL,
  ...
);

-- ❌ Wrong: Global entities break multi-tenancy
CREATE TABLE events (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,  -- Missing city_id!
  ...
);
```

**Implementation Note:** When creating any new table, ask "Which city does this belong to?" If the answer is "all cities," it belongs in the `public` schema and needs RLS.

---

### 2. Feature Independence

**Principle:** Features must not directly depend on each other. They communicate via events.

**Why:** Developers should be able to implement the Blog feature without understanding how Events works. This enables parallel development.

**Implementation:**
- Features are separate packages in a monorepo
- Features only depend on `core/` (not on each other)
- Cross-feature communication uses Event Bus

**Example:**
```typescript
// ✅ Correct: Blog emits event, Newsletter listens
// In features/blog/actions.ts
await core.events.emit('post:published', { postId, cityId });

// In features/newsletter/listeners.ts
core.events.on('post:published', async (data) => {
  await sendNewsletterToSubscribers(data);
});

// ❌ Wrong: Direct import creates coupling
import { sendNewsletterToSubscribers } from '@/features/newsletter';
await sendNewsletterToSubscribers({ postId }); // BAD!
```

**Implementation Note:** If you need data from another feature, emit an event or use CoreAPI. Never import directly from another feature.

---

### 3. Stable Core, Flexible Periphery

**Principle:** The `core/` layer changes rarely. Features change often.

**Why:** A stable foundation lets us iterate on features without breaking existing code.

**What's in Core:**
- Authentication (Supabase Auth SSR)
- Multi-tenant data model (`cities`, `users`, `roles`)
- Authorization (RLS policies for city isolation)
- API contracts (CoreAPI, Event Bus)

**What's in Features:**
- Events, Projects, Blog, Newsletter (Phase 1)
- Future plugins (Forum, Proximity Chat, etc.)

**Implementation Note:** Before adding something to `core/`, ask "Will every feature need this?" If no, it belongs in a feature package.

---

### 4. Pragmatic Security

**Principle:** Security is critical, but we use proven patterns (RLS) over experimental ones (schema-per-plugin).

**Why:** Row-Level Security is battle-tested by thousands of Supabase apps. Schema-per-plugin is theoretically better but adds complexity we don't need for Phase 1.

**Phase 1 Approach:**
- Use PostgreSQL RLS for city isolation
- Use role-based policies (`city_admin`, `super_admin`, `member`)
- Trust Supabase's proven auth + RLS stack

**Phase 2 Approach (if needed):**
- Migrate to schema-per-plugin when we have runtime plugin loading
- Only if security audits reveal RLS isn't sufficient

**Implementation Note:** When implementing a feature, define RLS policies in the migration. Test them by querying as different users.

---

### 5. Event-Driven Extensibility

**Principle:** Features communicate through events, not function calls.

**Why:** Events allow features to extend each other without coupling. A new plugin can listen to existing events without modifying core code.

**Core Events:**
- `user:created` - Fired when new user signs up
- `user:joined_city` - User becomes member of a city
- `city:created` - Regional admin creates new city

**Feature Events:**
- `event:created`, `event:rsvp_added` (from Events feature)
- `post:published` (from Blog feature)
- `project:submitted` (from Projects feature)

**Implementation Note:** When building a feature, document what events it emits and what it listens to. Make this visible in the feature's spec doc.

---

### 6. Brand-Safe Flexibility

**Principle:** Cities can customize content and priority, but NOT design or branding.

**Why:** Maintain global FaithTech brand consistency while allowing local relevance.

**Cities CAN customize:**
- ✅ City name, logo, hero image, about text
- ✅ Which features are enabled (toggle Events, Blog, etc.)
- ✅ Content priority (which events to feature on homepage)
- ✅ Accent color (from curated list: blue, green, purple)

**Cities CANNOT customize:**
- ❌ Core brand colors (FaithTech blue/white)
- ❌ Typography (locked to brand fonts)
- ❌ Component design (buttons, cards, forms use Shadcn UI)
- ❌ Layout structure (navigation, footer are fixed)

**Implementation Note:** When building UI, always use components from `@/components/ui` (Shadcn). Never allow custom CSS in city settings.

---

### 7. Fail-Safe Features

**Principle:** A broken feature should never crash the entire site.

**Why:** If a community-built plugin has a bug, it shouldn't take down the Events page.

**Phase 1 Implementation:**
- Wrap feature routes in React Error Boundaries
- Display error UI for broken feature, but nav/footer still work

**Phase 2 Implementation:**
- Full runtime plugin sandboxing (iframes + CSP)
- Plugins load with `next/dynamic` and Error Boundaries

**Example:**
```typescript
// Phase 1: Simple error boundary per feature
<ErrorBoundary fallback={<FeatureErrorUI featureName="Events" />}>
  <EventsPage />
</ErrorBoundary>

// Phase 2: Runtime plugin loader
<PluginShell pluginId="events" />
```

**Implementation Note:** When implementing a feature page, ensure it's wrapped in an Error Boundary. Test by throwing an error intentionally.

---

### 8. Ship Incrementally, Refactor Regularly

**Principle:** Velocity matters. Ship features incrementally. Refactor architecture periodically.

**Why:** We need to prove value fast in a focused sprint. Perfect architecture can wait.

**Acceptable Shortcuts in Phase 1:**
- ✅ Features can be built as monolithic routes (not extracted plugins yet)
- ✅ Event Bus can be simple in-memory emitter (not Supabase Realtime)
- ✅ Admin UI can be basic (polish later)
- ✅ Tests can focus on critical paths (not 100% coverage)

**Required Refactoring in Phase 2:**
- 🔄 Extract features to runtime plugins with `@faithtech/sdk`
- 🔄 Move Event Bus to Supabase Edge Functions (for persistence)
- 🔄 Polish admin UI based on user feedback
- 🔄 Increase test coverage based on bug patterns

**Implementation Note:** If you see a TODO comment saying "Phase 2: Refactor this," don't fix it now. Ship the feature first.

---

### 9. Document Decisions, Not Implementations

**Principle:** Documentation explains WHAT and WHY, not step-by-step HOW.

**Why:** Implementation details belong in code comments. Docs should clarify intent.

**Good Documentation:**
```markdown
## Authorization Model

We use Row-Level Security (RLS) to enforce city isolation.
Every user query is scoped to `auth.current_city()`.

**Why RLS:** Proven, performant, Supabase-native.
**Alternative considered:** Schema-per-plugin (deferred to Phase 2).
```

**Bad Documentation:**
```markdown
## Authorization Model

Step 1: Open Supabase Dashboard
Step 2: Click "SQL Editor"
Step 3: Paste this policy...
```

**Implementation Note:** Read the "Why" sections to understand intent. Implement based on examples in code, not step-by-step instructions.

---

## Decision Framework

When faced with architectural choices, ask:

1. **Does this enable the sprint timeline?** If no, defer to Phase 2.
2. **Does this maintain multi-tenancy?** If no, it's not acceptable.
3. **Does this couple features together?** If yes, use events instead.
4. **Does this break brand consistency?** If yes, restrict the customization.
5. **Is this well-documented and understandable?** If no, simplify or document better.

---

## Trade-Offs We're Making

### ✅ Choosing Pragmatism Over Perfection
- **Accepting:** Some refactoring will be needed in Phase 2
- **Gaining:** Ship in a focused sprint, prove value, attract contributors

### ✅ Choosing RLS Over Schema-Per-Plugin
- **Accepting:** Slightly less security isolation than ideal
- **Gaining:** Proven pattern, simpler development, faster iteration

### ✅ Choosing Monorepo Modules Over Runtime Plugins
- **Accepting:** Features aren't "installable" by users yet
- **Gaining:** Can build features without SDK complexity, extract later

### ✅ Choosing Brand Lock-Down Over Full Customization
- **Accepting:** Cities can't fully customize design
- **Gaining:** Global brand consistency, no "ugly" FaithTech sites

---

## Anti-Patterns to Avoid

❌ **Over-Engineering**: Don't build the perfect plugin SDK when a simple event emitter works
❌ **Premature Optimization**: Don't optimize RLS queries before measuring performance
❌ **Feature Coupling**: Don't let Blog import from Events directly
❌ **Scope Creep**: Don't add "nice to have" features in initial phases
❌ **Documentation Drift**: Don't let docs become stale (update when architecture changes)

---

## Summary

The "Prepared Monolith" strategy gives us:
- ✅ **Speed:** Ship features without plugin SDK complexity
- ✅ **Extensibility:** Clean modules can become plugins later
- ✅ **Safety:** Multi-tenant RLS + Error Boundaries prevent disasters
- ✅ **Community:** Event-driven architecture lets contributors add features
- ✅ **Brand:** Lock-down prevents "rogue" city designs

We're building a **strong foundation** that looks good enough to attract contributors, while staying **pragmatic** enough to ship in a focused sprint.

This is the path to inspiring global collaboration.
