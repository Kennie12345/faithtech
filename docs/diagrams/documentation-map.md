# Documentation Map: Reading Paths by Role

**Document Type:** Navigation Guide
**Purpose:** Find the right docs for your task quickly
**Last Updated:** 2025-11-05

---

## Quick Navigation by Role

### 👔 **Strategic Leader / Product Owner**

**Goal:** Understand vision, strategy, and roadmap

**Read (30 minutes total):**
1. 📖 [../1-vision/mission-and-vision.md](../1-vision/mission-and-vision.md) **(10 min)**
   - Why we're building this
   - "Stone Soup" strategy
   - Success metrics

2. 📖 [../1-vision/architectural-principles.md](../1-vision/architectural-principles.md) **(15 min)**
   - "Prepared Monolith" philosophy
   - Trade-offs we're making
   - Phase 1 vs Phase 2

3. 📖 [../1-vision/phased-roadmap.md](../1-vision/phased-roadmap.md) **(5 min)**
   - Week-by-week milestones
   - What ships when

---

### 👨‍💻 **Senior Engineer (Human)**

**Goal:** Understand architecture, assign work, review PRs

**Read (2 hours total):**

**Step 1: Visual Overview (30 min)**
1. 📊 [system-architecture.md](system-architecture.md)
2. 📊 [data-model-erd.md](data-model-erd.md)
3. 📊 [authentication-flow.md](authentication-flow.md)

**Step 2: Core Architecture (60 min)**
4. 📖 [../2-core-architecture/multi-tenant-data-model.md](../2-core-architecture/multi-tenant-data-model.md)
5. 📖 [../2-core-architecture/authorization-rls-policies.md](../2-core-architecture/authorization-rls-policies.md)
6. 📖 [../2-core-architecture/core-api-event-bus.md](../2-core-architecture/core-api-event-bus.md)

**Step 3: Implementation Plan (30 min)**
7. 📖 [../5-implementation/implementation-guide.md](../5-implementation/implementation-guide.md)

---

### 👨‍💻 **Feature Developer - Building Events Feature**

**Goal:** Implement Events feature independently

**Read (1 hour):**

1. 📊 [system-architecture.md](system-architecture.md) **(Quick scan - understand layers)**
2. 📖 [../2-core-architecture/core-api-event-bus.md](../2-core-architecture/core-api-event-bus.md) **(Learn CoreAPI interface)**
3. 📖 [../3-features/feature-events-rsvp.md](../3-features/feature-events-rsvp.md) **(Complete spec)**

**Implement in order:**
- Unit 1: Database schema (`CREATE TABLE events...`)
- Unit 2: RLS policies
- Unit 3: Server actions (createEvent, rsvpToEvent)
- Unit 4: Admin UI (EventsList, EventForm)
- Unit 5: Public UI (EventDetail, RSVP button)
- Unit 6: Event integration (emit `event:created`)

**Do NOT read:** Other features, admin specs, future vision (not needed)

---

### 🗄️ **Database Developer - Setting Up Database**

**Goal:** Create migrations for core + features

**Read:**

1. 📊 [data-model-erd.md](data-model-erd.md) **(Visual overview)**
2. 📖 [../2-core-architecture/multi-tenant-data-model.md](../2-core-architecture/multi-tenant-data-model.md) **(Core schema)**
3. 📖 [../2-core-architecture/database-migration-workflow.md](../2-core-architecture/database-migration-workflow.md) **(How to write migrations)**

**Then create migrations:**
```bash
supabase migration new 001_initial_schema
supabase migration new 002_create_cities
supabase migration new 003_create_profiles
# ... etc
```

---

### ⚙️ **DevOps / Platform Engineer**

**Goal:** Deploy to production, set up CI/CD

**Read:**

1. 📊 [system-architecture.md](system-architecture.md) **(Understand stack)**
2. 📖 [../5-implementation/local-dev-environment-setup.md](../5-implementation/local-dev-environment-setup.md) **(Local Supabase)**
3. 📖 [../5-implementation/production-deployment-guide.md](../5-implementation/production-deployment-guide.md) **(Vercel + Supabase)**

**Tasks:**
- Set up Supabase production project
- Configure Vercel deployment
- Set environment variables
- Run production migrations
- Set up monitoring (Vercel Analytics, Supabase logs)

---

### 🎨 **Frontend Developer - Building UI**

**Goal:** Create admin panels, public pages

**Read:**

1. 📊 [system-architecture.md](system-architecture.md) **(Understand layers)**
2. 📖 [../4-admin-ui/design-system-brand-guide.md](../4-admin-ui/design-system-brand-guide.md) **(Shadcn UI, brand colors)**
3. 📖 [../4-admin-ui/layout-patterns.md](../4-admin-ui/layout-patterns.md) **(Page layouts)**

**Then build:**
- Admin components using Shadcn UI
- Follow layout patterns
- Use Tailwind CSS with brand colors
- Test responsive design

---

### 🧪 **QA / Testing Engineer**

**Goal:** Write tests, verify quality

**Read:**

1. 📖 [../5-implementation/testing-strategy-examples.md](../5-implementation/testing-strategy-examples.md)
2. 📖 [../2-core-architecture/authorization-rls-policies.md](../2-core-architecture/authorization-rls-policies.md) **(Test RLS)**

**Test priorities:**
1. RLS policies (city isolation)
2. Multi-tenant separation (Adelaide ≠ Sydney)
3. Role-based access (admin vs member)
4. Critical user journeys (signup → login → RSVP)

---

### 🌍 **Community Contributor (Global FaithTech)**

**Goal:** Contribute features or fixes

**Read:**

1. 📖 [../1-vision/mission-and-vision.md](../1-vision/mission-and-vision.md) **(Understand the mission)**
2. 📖 [../7-contributing/contributor-onboarding.md](../7-contributing/contributor-onboarding.md) **(How to contribute)**
3. 📖 [../5-implementation/local-dev-environment-setup.md](../5-implementation/local-dev-environment-setup.md) **(Set up locally)**

**Then:**
- Pick an issue from backlog
- Read relevant feature doc
- Submit PR following code standards

---

## Reading Paths by Task

### Task: "Understand the entire system architecture"

```
1. Start: system-architecture.md (5-layer diagram)
2. Deep dive: data-model-erd.md (database structure)
3. Auth flow: authentication-flow.md (user journeys)
4. Read core docs: ../2-core-architecture/*.md
```

---

### Task: "Implement a new feature (e.g., Forum)"

```
1. Copy template: ../3-features/00-feature-template.md
2. Study similar feature: ../3-features/feature-events-rsvp.md
3. Understand CoreAPI: ../2-core-architecture/core-api-event-bus.md
4. Follow atomic units in template:
   - Database schema
   - RLS policies
   - Server actions
   - Admin UI
   - Public UI
   - Event integration
```

---

### Task: "Fix a bug in Events feature"

```
1. Read feature spec: ../3-features/feature-events-rsvp.md
2. Identify which layer has the bug:
   - Database? → Check ../2-core-architecture/multi-tenant-data-model.md
   - RLS? → Check ../2-core-architecture/authorization-rls-policies.md
   - UI? → Check ../4-admin-ui/design-system-brand-guide.md
3. Fix and test
4. Update docs if needed
```

---

### Task: "Deploy to production for the first time"

```
1. Read: ../5-implementation/production-deployment-guide.md
2. Follow step-by-step:
   - Create Supabase project
   - Create Vercel project
   - Link repositories
   - Set environment variables
   - Deploy
3. Run migrations via Vercel build
4. Test in production
```

---

### Task: "Onboard a new engineer"

```
Send them this reading list (in order):

📚 Day 1 (2 hours):
1. ../1-vision/mission-and-vision.md
2. ../1-vision/architectural-principles.md
3. system-architecture.md
4. data-model-erd.md

📚 Day 2 (3 hours):
5. ../2-core-architecture/multi-tenant-data-model.md
6. ../2-core-architecture/authorization-rls-policies.md
7. ../5-implementation/local-dev-environment-setup.md
   → Get local environment running

📚 Day 3 (4 hours):
8. Pick one feature to understand deeply
9. Read that feature's spec
10. Make a small contribution (fix a typo, add a test)

By Day 4: Ready to implement features independently
```

---

### Task: "Prepare for Phase 2 (Plugin Architecture)"

```
1. Finish Phase 1 first! (Ship FaithTech Australia)
2. Read: ../6-future-roadmap/plugin-system-architecture.md
3. Read: ../6-future-roadmap/vetted-plugin-marketplace.md
4. Extract Events feature as proof-of-concept plugin
5. Build @faithtech/sdk package
6. Document plugin API
```

---

## Documentation Dependency Graph

```
┌─────────────────────────────┐
│  1-vision/                  │ ← Start here
│  (Strategic context)        │
└──────────┬──────────────────┘
           │
           ▼
┌─────────────────────────────┐
│  diagrams/                  │ ← Visual overview
│  (System architecture)      │
└──────────┬──────────────────┘
           │
           ▼
┌─────────────────────────────┐
│  2-core-architecture/       │ ← Foundation (Week 1)
│  (Stable layer)             │
└──────────┬──────────────────┘
           │
           ├──────► ┌─────────────────────────────┐
           │        │  3-features/                │ ← Features (Week 2-3)
           │        │  (Build in parallel)        │
           │        └─────────────────────────────┘
           │
           ├──────► ┌─────────────────────────────┐
           │        │  4-admin-ui/                │ ← UI layer (Week 3)
           │        │  (Admin panels)             │
           │        └─────────────────────────────┘
           │
           ▼
┌─────────────────────────────┐
│  5-implementation/          │ ← How to build & deploy
│  (Tactical guides)          │
└─────────────────────────────┘

Optional (Post-launch):
┌─────────────────────────────┐
│  6-future-roadmap/          │
│  (Phase 2+ vision)          │
└─────────────────────────────┘
┌─────────────────────────────┐
│  7-contributing/            │
│  (Community guidelines)     │
└─────────────────────────────┘
```

---

## File Naming Convention

**Pattern:** `category-specific-topic.md`

**Examples:**
- ✅ `user-authentication-supabase.md` (clear what + how)
- ✅ `feature-events-rsvp.md` (clear type + name)
- ✅ `implementation-guide.md` (clear purpose)

**Avoid:**
- ❌ `01-data-model.md` (what's "01"?)
- ❌ `auth.md` (too vague)
- ❌ `implementation.md` (which aspect?)

---

## Summary: Who Reads What

| Role | Must Read | Should Read | Optional |
|------|-----------|-------------|----------|
| **Strategic Leader** | 1-vision/* | diagrams/* | 2-core-architecture/* |
| **Senior Engineer** | All of 1-vision/, 2-core-architecture/, 5-implementation/ | 3-features/*, 4-admin-ui/* | 6-future-roadmap/* |
| **Feature Developer** | Specific feature doc + core-api-event-bus.md | diagrams/ (quick scan) | Everything else |
| **DevOps** | 5-implementation/* | diagrams/system-architecture.md | Feature docs |
| **Frontend Dev** | 4-admin-ui/*, specific feature docs | 2-core-architecture/core-api-event-bus.md | 6-future-roadmap/* |
| **QA Engineer** | 5-implementation/testing-strategy-examples.md, 2-core-architecture/authorization-rls-policies.md | Feature docs | Vision docs |
| **Contributor** | 1-vision/mission-and-vision.md, 7-contributing/* | 5-implementation/local-dev-environment-setup.md | All docs (as needed) |

---

**Pro Tip:** Start with the diagrams/ folder for visual overview, then dive into relevant docs based on your role and task.
