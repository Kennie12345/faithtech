# Implementation Dependencies: Build Order

**Document Type:** Visual Guide
**Purpose:** Understand what to build first and dependencies between components
**Last Updated:** 2025-11-05

---

## Build Order (Critical Path)

```
PHASE 1: CORE FOUNDATION
═══════════════════════════════════════════════════════════════

Foundation Layer 1: Database Schema
┌────────────────────────────────────────────────────────────┐
│ 1. Initial Schema                                          │
│    File: supabase/migrations/001_initial_schema.sql        │
│    - CREATE EXTENSION uuid-ossp                            │
│    - CREATE TYPE user_role                                 │
│    Dependencies: None                                      │
└────────────┬───────────────────────────────────────────────┘
             │
             ▼
┌────────────────────────────────────────────────────────────┐
│ 2. Cities Table                                            │
│    File: supabase/migrations/002_create_cities.sql         │
│    - CREATE TABLE cities                                   │
│    - Indexes on slug                                       │
│    Dependencies: 001                                       │
└────────────┬───────────────────────────────────────────────┘
             │
             ▼
┌────────────────────────────────────────────────────────────┐
│ 3. Profiles Table                                          │
│    File: supabase/migrations/003_create_profiles.sql       │
│    - CREATE TABLE profiles                                 │
│    - Links to auth.users                                   │
│    Dependencies: None (auth.users exists)                  │
└────────────┬───────────────────────────────────────────────┘
             │
             ▼
┌────────────────────────────────────────────────────────────┐
│ 4. User-City-Roles Table                                   │
│    File: supabase/migrations/004_create_user_city_roles.sql│
│    - CREATE TABLE user_city_roles                          │
│    - UNIQUE(user_id, city_id)                              │
│    Dependencies: 002 (cities), 003 (profiles)              │
└────────────┬───────────────────────────────────────────────┘
             │
             ▼
┌────────────────────────────────────────────────────────────┐
│ 5. Groups Tables                                           │
│    File: supabase/migrations/005_create_groups.sql         │
│    - CREATE TABLE groups                                   │
│    - CREATE TABLE group_members                            │
│    Dependencies: 002 (cities)                              │
└────────────┬───────────────────────────────────────────────┘
             │
             ▼

Foundation Layer 2: Authorization & Security
┌────────────────────────────────────────────────────────────┐
│ 6. RLS Policies (Core Tables)                              │
│    File: supabase/migrations/006_rls_core_tables.sql       │
│    - Enable RLS on all core tables                         │
│    - City isolation policies                               │
│    - Role-based policies                                   │
│    Dependencies: 002-005 (all core tables)                 │
└────────────┬───────────────────────────────────────────────┘
             │
             ▼
┌────────────────────────────────────────────────────────────┐
│ 7. Helper Functions                                        │
│    File: supabase/migrations/007_helper_functions.sql      │
│    - auth.current_city()                                   │
│    - auth.user_role()                                      │
│    Dependencies: 004 (user_city_roles)                     │
└────────────┬───────────────────────────────────────────────┘
             │
             ▼

Foundation Layer 3: Core API & Authentication
┌────────────────────────────────────────────────────────────┐
│ 8. CoreAPI Implementation                                  │
│    File: lib/core/api.ts                                   │
│    - getUser(), getCity(), getUserRole()                   │
│    - isAdmin(), getGroups()                                │
│    Dependencies: Database schema (001-007)                 │
└────────────┬───────────────────────────────────────────────┘
             │
             ▼
┌────────────────────────────────────────────────────────────┐
│ 9. Event Bus                                               │
│    File: lib/core/events.ts                                │
│    - EventEmitter wrapper                                  │
│    - emit(), on(), off()                                   │
│    Dependencies: None (pure TypeScript)                    │
└────────────┬───────────────────────────────────────────────┘
             │
             ▼
┌────────────────────────────────────────────────────────────┐
│ 10. Auth Flow (Supabase SSR)                               │
│     Files:                                                 │
│     - lib/supabase/client.ts                               │
│     - lib/supabase/server.ts                               │
│     - lib/supabase/middleware.ts                           │
│     - middleware.ts                                        │
│     Dependencies: Database (profiles table)                │
└────────────┬───────────────────────────────────────────────┘
             │
             ▼
┌────────────────────────────────────────────────────────────┐
│ 11. Auth UI                                                │
│     Files: app/auth/*                                      │
│     - sign-up, login, forgot-password                      │
│     - confirm route                                        │
│     Dependencies: Auth flow (10)                           │
└────────────┬───────────────────────────────────────────────┘
             │
             ✅ PHASE 1 COMPLETE: Core foundation working


PHASE 2: FEATURES (Can build in parallel)
═══════════════════════════════════════════════════════════════

┌────────────────────────┐  ┌────────────────────────┐  ┌────────────────────────┐
│ EVENTS FEATURE         │  │ PROJECTS FEATURE       │  │ BLOG FEATURE           │
│ ────────────────────── │  │ ────────────────────── │  │ ────────────────────── │
│ Feature Development    │  │ Feature Development    │  │ Feature Development    │
└────────────────────────┘  └────────────────────────┘  └────────────────────────┘

Events Feature (Engineer A + Agent 1):
┌────────────────────────────────────────────────────────────┐
│ 12. Events Database                                        │
│     File: supabase/migrations/020_create_events.sql        │
│     - CREATE TABLE events                                  │
│     - CREATE TABLE event_rsvps                             │
│     Dependencies: Core tables (002)                        │
└────────────┬───────────────────────────────────────────────┘
             │
             ▼
┌────────────────────────────────────────────────────────────┐
│ 13. Events RLS Policies                                    │
│     File: supabase/migrations/021_rls_events.sql           │
│     - City isolation                                       │
│     - Members can RSVP                                     │
│     Dependencies: 020 (events tables), 007 (helper funcs)  │
└────────────┬───────────────────────────────────────────────┘
             │
             ▼
┌────────────────────────────────────────────────────────────┐
│ 14. Events Server Actions                                  │
│     File: features/events/actions.ts                       │
│     - createEvent(), updateEvent(), rsvpToEvent()          │
│     Dependencies: CoreAPI (8), Event Bus (9)               │
└────────────┬───────────────────────────────────────────────┘
             │
             ▼
┌────────────────────────────────────────────────────────────┐
│ 15. Events Admin UI                                        │
│     Files: app/protected/admin/events/*                    │
│     - EventsList, EventForm                                │
│     Dependencies: Server actions (14)                      │
└────────────┬───────────────────────────────────────────────┘
             │
             ▼
┌────────────────────────────────────────────────────────────┐
│ 16. Events Public UI                                       │
│     Files: app/[citySlug]/events/*                         │
│     - Public event list, detail, RSVP button               │
│     Dependencies: Server actions (14)                      │
└────────────┬───────────────────────────────────────────────┘
             │
             ▼
┌────────────────────────────────────────────────────────────┐
│ 17. Events Integration                                     │
│     File: features/events/listeners.ts                     │
│     - Emit: event:created, event:rsvp_added                │
│     - Listen: user:joined_city                             │
│     Dependencies: Event Bus (9)                            │
└────────────────────────────────────────────────────────────┘

Projects Feature (Engineer B + Agent 2):
[Similar structure: 022-027]

Blog Feature (Agent 3):
[Similar structure: 028-033]

✅ PHASE 2 COMPLETE: Events, Projects, Blog working


PHASE 3: POLISH & DEPLOY
═══════════════════════════════════════════════════════════════

Final Features: Newsletter
┌────────────────────────────────────────────────────────────┐
│ 34. Newsletter Database + RLS                              │
│     File: supabase/migrations/034_create_newsletter.sql    │
│     Dependencies: Core tables                              │
└────────────┬───────────────────────────────────────────────┘
             │
             ▼
┌────────────────────────────────────────────────────────────┐
│ 35. Newsletter Actions + UI                                │
│     - Subscribe form, CSV export                           │
│     Dependencies: CoreAPI                                  │
└────────────┬───────────────────────────────────────────────┘
             │
             ▼
┌────────────────────────────────────────────────────────────┐
│ 36. Newsletter Listeners                                   │
│     - Listen to: post:published, event:created             │
│     Dependencies: Event Bus                                │
└────────────┬───────────────────────────────────────────────┘
             │
             ▼

Admin Layer: Admin Dashboard
┌────────────────────────────────────────────────────────────┐
│ 37. Regional Admin Panel                                   │
│     - Create cities, assign admins                         │
│     Dependencies: CoreAPI                                  │
└────────────┬───────────────────────────────────────────────┘
             │
             ▼
┌────────────────────────────────────────────────────────────┐
│ 38. City Admin Panel                                       │
│     - Manage city settings, feature toggles                │
│     Dependencies: All features                             │
└────────────┬───────────────────────────────────────────────┘
             │
             ▼

Content Layer: Public Homepage
┌────────────────────────────────────────────────────────────┐
│ 39. Homepage UI                                            │
│     - Hero, featured events/projects, subscribe            │
│     Dependencies: Events (12-17), Projects, Newsletter     │
└────────────┬───────────────────────────────────────────────┘
             │
             ▼

Launch Phase: Deploy
┌────────────────────────────────────────────────────────────┐
│ 40. Production Deployment                                  │
│     - Vercel setup                                         │
│     - Supabase production instance                         │
│     - Run migrations                                       │
│     - Environment variables                                │
│     Dependencies: ALL above components                     │
└────────────────────────────────────────────────────────────┘

✅ PHASE 3 COMPLETE: FaithTech Australia launches! 🚀
```

---

## Parallel Work Streams

### Phase 1: Sequential (Dependencies)

**Can't parallelize** - Core must be built in order

```
Foundation Layer 1: Database schema (001-005)
   ↓
Foundation Layer 2: RLS + helper functions (006-007)
   ↓
Foundation Layer 3: CoreAPI + Auth (008-011)
```

---

### Phase 2: Fully Parallel

**Can parallelize** - Features are independent

```
Engineer A + Agent 1: Events (012-017)
Engineer B + Agent 2: Projects (018-023)
Agent 3: Blog (024-029)

All work simultaneously, no blocking!
```

**Why parallel works:**
- Features only depend on CoreAPI (built in Phase 1)
- Features don't import from each other
- Separate database tables
- Separate UI routes

---

### Phase 3: Partially Parallel

**Some parallelization possible**

```
Initial Build:
  ├─► Engineer A: Newsletter feature
  └─► Engineer B: Admin dashboard (depends on features existing)

Polish Phase:
  ├─► Engineer A: Homepage
  └─► Engineer B: Polish admin UI

Launch Phase:
  └─► DevOps: Deploy (everyone helps test)
```

---

## Dependency Matrix

| Component | Depends On | Blocks |
|-----------|------------|--------|
| **Database schema** | Nothing | RLS policies, All features |
| **RLS policies** | Schema, Helper functions | Features (can query safely) |
| **CoreAPI** | Schema | All features |
| **Event Bus** | Nothing | Feature listeners |
| **Auth flow** | Schema (profiles) | Protected routes |
| **Events feature** | CoreAPI | Homepage (featured events) |
| **Projects feature** | CoreAPI | Homepage (featured projects) |
| **Blog feature** | CoreAPI | Homepage (latest posts) |
| **Newsletter** | CoreAPI, Event Bus | Nothing (optional) |
| **Admin dashboard** | All features | Nothing (UI only) |
| **Homepage** | Events, Projects, Newsletter | Deployment |
| **Deployment** | EVERYTHING | Launch! |

---

## Critical Path (Longest Dependency Chain)

```
Database schema (Foundation Layer 1)
  ↓
RLS policies (Foundation Layer 2)
  ↓
CoreAPI (Foundation Layer 3)
  ↓
Auth flow (Foundation Layer 3)
  ↓
Events feature (Phase 2)
  ↓
Homepage (Phase 3)
  ↓
Deployment (Phase 3)

Spans 3 phases with buffer for iteration
```

**Optimization:** Features in Phase 2 run in parallel, significant time savings

---

## Testing Dependencies

**Test in this order:**

1. **Phase 1 Complete:** Test core
   ```
   - Migrations run without errors
   - RLS policies work (set role test)
   - Auth signup → login → access protected route
   ```

2. **Phase 2 Complete:** Test each feature
   ```
   - Events: Create event, RSVP, view
   - Projects: Submit, display
   - Blog: Write post, publish, SEO metadata
   ```

3. **Phase 3 Complete:** Integration testing
   ```
   - Homepage shows featured content
   - Admin can manage all features
   - Multi-city isolation (Adelaide ≠ Sydney)
   ```

---

## Rollback Dependencies

**If something fails, what else is affected?**

| If this fails | Impact |
|---------------|--------|
| **Core schema** | EVERYTHING stops |
| **RLS policies** | Security risk, don't proceed |
| **CoreAPI** | Features can't be built |
| **Events feature** | Homepage missing featured events (can launch without) |
| **Blog feature** | Homepage missing posts (can launch without) |
| **Newsletter** | No email collection (can launch without) |
| **Homepage** | Can use temporary landing page |

**Decision:** Core + Events + Projects = MVP. Blog + Newsletter = nice-to-have.

---

## Resource Allocation

### Optimal Team Split

**Phase 1 (Sequential):**
- **Both engineers:** Work together on core (pair programming)
- **3 agents:** Write boilerplate migrations, tests

**Phase 2 (Parallel):**
- **Engineer A + Agent 1:** Events feature
- **Engineer B + Agent 2:** Projects feature
- **Agent 3:** Blog feature

**Phase 3 (Polish):**
- **Engineer A:** Newsletter + Homepage
- **Engineer B:** Admin dashboard
- **DevOps (if available):** Deployment setup
- **Agents:** UI polish, bug fixes

---

## Next Steps

- **For phased implementation:** See [../5-implementation/implementation-guide.md](../5-implementation/implementation-guide.md)
- **For deployment:** See [../5-implementation/implementation-guide.md](../5-implementation/implementation-guide.md#production-deployment)
- **For testing:** See [../5-implementation/implementation-guide.md](../5-implementation/implementation-guide.md#testing-strategy)
