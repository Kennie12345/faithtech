# FaithTech Regional Hub - Implementation TODO

**Status**: Phase 1 Complete ✅ | Phase 2 Ready to Start

---

## Phase 1: Foundation (Week 1) ✅ COMPLETE

### Block 1A: Core Schema (Days 1-2) ✅
- [x] **Task 1**: Create migration `001_initial_schema.sql` - Extensions + user_role enum
- [x] **Task 2**: Create migration `002_create_cities.sql` - Cities table + unique slug index
- [x] **Task 3**: Create migration `003_create_profiles.sql` - User profiles (FK to auth.users)
- [x] **Task 4**: Create migration `004_create_user_city_roles.sql` - Multi-tenant membership
- [x] **Task 5**: Create migration `005_create_groups.sql` - Groups + group_members

### Block 1B: Authorization Layer (Day 3) ✅
- [x] **Task 6**: Create migration `006_helper_functions.sql` - auth.current_city() & auth.user_role()
- [x] **Task 7**: Create migration `007_rls_core_tables.sql` - RLS policies for core tables

### Block 1C: API & Infrastructure (Days 4-5) ✅
- [x] **Task 8**: Build `lib/core/api.ts` - CoreAPI functions (25+ functions, 13KB)
- [x] **Task 9**: Build `lib/core/events.ts` - Event Bus (pub/sub, type-safe)
- [x] **Task 10**: Validate auth flow - middleware, email confirmation, profile creation

### Block 1D: Development Setup (Day 5) ✅
- [x] **Task 11**: Create `supabase/seed.sql` - Test users + cities (Adelaide/Sydney/Melbourne)
- [x] **Task 12**: Build `lib/utils/slugify.ts` - Shared slug utility (5 functions)
- [x] **Task 13**: Create migration `008_create_storage_buckets.sql` - 6 storage buckets with RLS

**Phase 1 Checkpoint**: Foundation ready for features! 🎉
- ✅ 8 migrations (001-008) created
- ✅ CoreAPI, Event Bus, Slugify utilities built
- ✅ Auth flow enhanced with profile creation + events
- ✅ Seed data ready for 3 test cities

---

## Phase 2: Features (Week 2) 🚧 IN PROGRESS

### Track A: Events Feature (Can parallelize)
- [ ] **Task 14**: Create migration `020_create_events.sql` - events + event_rsvps tables
- [ ] **Task 15**: Create migration `021_rls_events.sql` - RLS policies (city isolation)
- [ ] **Task 16**: Build Events schemas + actions
  - [ ] Create `features/events/schemas.ts` (Zod validation)
  - [ ] Create `features/events/types.ts` (generated types)
  - [ ] Create `features/events/actions.ts` (server actions with Zod)
- [ ] **Task 17**: Build `features/events/listeners.ts` - Event bus listeners
- [ ] **Task 18**: Build Events admin UI
  - [ ] `app/protected/admin/events/page.tsx` (list)
  - [ ] `app/protected/admin/events/new/page.tsx` (create)
  - [ ] `app/protected/admin/events/[id]/page.tsx` (edit + RSVP management)
- [ ] **Task 19**: Build Events public UI
  - [ ] `app/[citySlug]/events/page.tsx` (list with filters)
  - [ ] `app/[citySlug]/events/[slug]/page.tsx` (detail with RSVP button)

### Track B: Projects Feature (Can parallelize)
- [ ] **Task 20**: Create migration `022_create_projects.sql` - projects + project_members tables
- [ ] **Task 21**: Create migration `023_rls_projects.sql` - RLS policies
- [ ] **Task 22**: Build Projects schemas + actions
  - [ ] Create `features/projects/schemas.ts`
  - [ ] Create `features/projects/types.ts`
  - [ ] Create `features/projects/actions.ts`
- [ ] **Task 23**: Build `features/projects/listeners.ts` - Event bus listeners
- [ ] **Task 24**: Build Projects admin UI
  - [ ] `app/protected/admin/projects/page.tsx` (list with feature toggle)
  - [ ] `app/protected/admin/projects/new/page.tsx` (create)
- [ ] **Task 25**: Build Projects public UI
  - [ ] `app/[citySlug]/projects/page.tsx` (gallery grid)
  - [ ] `app/[citySlug]/projects/[slug]/page.tsx` (detail with team members)

### Track C: Blog Feature (Can parallelize)
- [ ] **Task 26**: Create migration `024_create_posts.sql` - posts table with markdown support
- [ ] **Task 27**: Create migration `025_rls_posts.sql` - RLS policies (published vs draft)
- [ ] **Task 28**: Build Blog schemas + actions
  - [ ] Create `features/blog/schemas.ts`
  - [ ] Create `features/blog/types.ts`
  - [ ] Create `features/blog/actions.ts`
- [ ] **Task 29**: Build `features/blog/listeners.ts` - Event bus listeners
- [ ] **Task 30**: Build Blog admin UI
  - [ ] `app/protected/admin/blog/page.tsx` (list drafts + published)
  - [ ] `app/protected/admin/blog/new/page.tsx` (Markdown editor)
  - [ ] `app/protected/admin/blog/[id]/page.tsx` (edit + publish)
- [ ] **Task 31**: Build Blog public UI
  - [ ] `app/[citySlug]/blog/page.tsx` (list with pagination)
  - [ ] `app/[citySlug]/blog/[slug]/page.tsx` (detail with SEO metadata)

**Phase 2 Checkpoint**: All 3 features working, city isolation tested ✅

---

## Phase 3: Polish & Launch (Week 3) 📅 PLANNED

### Newsletter Feature
- [ ] **Task 32**: Create migration `030_create_newsletter.sql` - newsletter_subscribers table
- [ ] **Task 33**: Create migration `031_rls_newsletter.sql` - RLS policies (special public INSERT)
- [ ] **Task 34**: Build Newsletter schemas + actions
  - [ ] Create `features/newsletter/schemas.ts`
  - [ ] Create `features/newsletter/types.ts`
  - [ ] Create `features/newsletter/actions.ts` (subscribeToNewsletter with service_role)
- [ ] **Task 35**: Build `features/newsletter/listeners.ts` - Listen to post:published, event:created
- [ ] **Task 36**: Build Newsletter admin UI
  - [ ] `app/protected/admin/newsletter/page.tsx` (subscriber list + CSV export)
- [ ] **Task 37**: Build Newsletter public UI
  - [ ] `app/[citySlug]/subscribe/page.tsx` (subscribe form)
  - [ ] `app/[citySlug]/unsubscribe/page.tsx` (unsubscribe form)

### Admin Dashboard
- [ ] **Task 38**: Create migration `032_create_city_features.sql` - Feature toggle table
- [ ] **Task 39**: Build Regional admin panel
  - [ ] `app/protected/admin/regional/page.tsx` (create cities)
  - [ ] `app/protected/admin/regional/cities/page.tsx` (list cities, assign admins)
- [ ] **Task 40**: Build City admin settings
  - [ ] `app/protected/admin/settings/page.tsx` (city profile)
  - [ ] `app/protected/admin/settings/features/page.tsx` (feature toggles)
  - [ ] `app/protected/admin/settings/members/page.tsx` (member management)
- [ ] **Task 41**: Build city switcher component - Dropdown for users in multiple cities

### Homepage & Public Routes
- [ ] **Task 42**: Build `app/[citySlug]/page.tsx` - Homepage (hero, featured events/projects/posts, subscribe)
- [ ] **Task 43**: Build `app/[citySlug]/about/page.tsx` - About page for each city
- [ ] **Task 44**: Build `/setup` route - One-time setup wizard (create first super admin + city)

### Deployment
- [ ] **Task 45**: Create Supabase production project - Run all migrations, configure auth
- [ ] **Task 46**: Deploy to Vercel - Set env vars, connect GitHub, configure build
- [ ] **Task 47**: Run `/setup` wizard - Create Adelaide city + initial super admin
- [ ] **Task 48**: E2E testing - Test complete user journeys (signup→RSVP, admin→create event, city isolation)
- [ ] **Task 49**: Load seed data - Add real Adelaide/Sydney/Melbourne data
- [ ] **Task 50**: Go live! 🚀

**Phase 3 Checkpoint**: FaithTech Australia launched! 🎉

---

## Architecture Decisions Locked In ✅

- ✅ **Multi-Tenancy**: Every table has `city_id` + RLS policies enforce isolation
- ✅ **Per-Request Clients**: All Supabase clients created fresh (serverless-ready)
- ✅ **Type Safety**: Zod schemas + TypeScript types throughout
- ✅ **Event-Driven**: Features communicate via Event Bus (no direct imports)
- ✅ **Security-First**: RLS policies at database level (not app code)
- ✅ **Server Components**: Default to Server Components, Client only when needed
- ✅ **Prepared Monolith**: Clean feature modules now, extract to plugins later

---

## Testing Requirements

### Phase 1 Tests (Foundation)
- [ ] All migrations run successfully (`supabase db reset`)
- [ ] Cities table has 3 cities (Adelaide, Sydney, Melbourne)
- [ ] Can sign up new user via UI
- [ ] Profile created automatically on email confirmation
- [ ] RLS policies prevent cross-city data access

### Phase 2 Tests (Features)
- [ ] Adelaide admin cannot see Sydney events/projects/posts
- [ ] Sydney member can RSVP to Sydney events only
- [ ] Melbourne member cannot edit Adelaide projects
- [ ] Blog posts respect draft vs published status
- [ ] Featured projects show on homepage

### Phase 3 Tests (Production)
- [ ] /setup wizard creates first city + super admin
- [ ] City switcher works for multi-city users
- [ ] Newsletter subscribe/unsubscribe flows work
- [ ] SEO metadata generates correctly for blog posts
- [ ] Images upload to correct storage buckets

---

## Files Created So Far

```
Phase 1 Complete (13 files):

supabase/
  migrations/
    ✅ 001_initial_schema.sql           (852B)
    ✅ 002_create_cities.sql            (1.8KB)
    ✅ 003_create_profiles.sql          (1.7KB)
    ✅ 004_create_user_city_roles.sql   (2.2KB)
    ✅ 005_create_groups.sql            (2.5KB)
    ✅ 006_helper_functions.sql         (4.1KB)
    ✅ 007_rls_core_tables.sql          (8.2KB)
    ✅ 008_create_storage_buckets.sql   (10KB)
  ✅ seed.sql                           (4.5KB)

lib/
  core/
    ✅ api.ts                           (13KB - 25+ functions)
    ✅ events.ts                        (9KB - type-safe event bus)
  utils/
    ✅ slugify.ts                       (5.5KB - 5 utility functions)

app/
  auth/
    confirm/
      ✅ route.ts                       (Enhanced - profile creation + events)
```

**Total**: ~1,200 lines of production code (migrations + infrastructure)

---

## Next Action

**Ready to start Phase 2!** Pick a track (or work on all 3 in parallel):
- 🎉 **Track A**: Events (tasks 14-19)
- 🎨 **Track B**: Projects (tasks 20-25)
- ✍️ **Track C**: Blog (tasks 26-31)

---

**Last Updated**: 2025-11-05 (Phase 1 Complete)
