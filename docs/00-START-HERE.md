# Welcome to FaithTech Hub! 👋

**📍 You are here:** Getting Started
**⏱ Time to first contribution:** 5-30 minutes (you choose!)
**Last Updated:** 2025-11-05

---

## What Is This? (The 30-Second Version)

**FaithTech Regional Hub** is an open-source platform that lets any FaithTech city or region launch a powerful, brand-aligned community website in under 60 minutes.

**One Sentence:** Deploy a complete community platform (events, projects, blog, newsletter) that serves multiple cities, built with Next.js + Supabase, ready for your local FaithTech chapter.

**Current Status:** Phase 1 (Building core for FaithTech Australia), launching Q4 2025

---

## 🎯 Choose Your Journey

Pick the path that matches your available time and interest level:

### ⚡ I Have 5 Minutes (Quick Browse)
**Goal:** Understand what this is and decide if it's for you

1. ✅ You're reading this (you're here!)
2. Read [Mission & Vision](1-vision/mission-and-vision.md) (2 min) - The "Stone Soup" strategy
3. Browse [Good First Issues](https://github.com/faithtech/regional-hub/labels/good-first-issue) (2 min)
4. Star the repo ⭐ and come back when you have more time

**Next step:** Bookmark this page, join [FaithTech Slack](#) to stay updated

---

### 🚀 I Have 30 Minutes (Make a Contribution)
**Goal:** Set up locally and fix something small

1. Read [Quick Setup Guide](5-implementation/implementation-guide.md#local-development-setup) (10 min)
2. Run `npm run setup` (5 min)
3. Pick a "good first issue" and fix it (10 min)
4. Submit your first PR 🎉 (5 min)

**Next step:** Wait for feedback, explore more of the codebase

---

### 🏗️ I Have 2 Hours (Build a Feature)
**Goal:** Understand architecture and implement something substantial
1. Read [Architectural Principles](1-vision/architectural-principles.md) (20 min) - Skim mode OK
2. Read [System Architecture Diagram](diagrams/system-architecture.md) (10 min)
3. Pick a feature to understand: [Events](3-features/feature-events-rsvp.md) or [Blog](3-features/feature-blog-seo.md) (30 min)
4. Identify where you can contribute (15 min)
5. Start coding! (45 min)

**Next step:** Open a draft PR, ask for feedback early

---

### 👀 I'm Just Browsing (Exploring Options)
**Goal:** Understand if this project aligns with your interests

**Read this only:**
- [Mission & Vision](1-vision/mission-and-vision.md) (5 min) - Why we're building this
- [Phased Roadmap](1-vision/phased-roadmap.md) (5 min) - Phase 1-3 timeline
- [System Architecture Diagram](diagrams/system-architecture.md) (5 min) - Visual overview

**Don't worry about:** Core architecture, features, implementation details

**Next step:** Star the repo, come back in Q2 2026 when Phase 2 (plugin SDK) launches

---

### 🎓 I'm on the Core Team (Strategic Context)
**Goal:** Understand full architecture and lead feature development

**Read in order (2-3 hours):**
1. [Mission & Vision](1-vision/mission-and-vision.md) (10 min) - "Stone Soup" strategy
2. [Architectural Principles](1-vision/architectural-principles.md) (20 min) - "Prepared Monolith" philosophy
3. [System Architecture Diagram](diagrams/system-architecture.md) (10 min) - 5-layer visual
4. All of [Core Architecture](2-core-architecture/) (90 min):
   - Multi-Tenant Data Model
   - User Authentication (Supabase SSR)
   - Authorization (RLS Policies)
   - Database Migration Workflow
   - Core API + Event Bus
5. [Implementation Guide](5-implementation/implementation-guide.md) (30 min) - Setup, testing, deployment

**Then assign work:**
- Engineer A: Core foundation (Week 1)
- Engineer B: Features (Week 2-3)

See [Core Team Sprint Plan](#core-team-3-week-sprint) below for details

---

## 📚 Glossary: Key Terms Explained

Before diving in, here are the essential concepts you'll encounter:

### Multi-Tenancy
**What:** One database, many cities. Each city only sees their own data.
**Why:** FaithTech Australia has Adelaide, Sydney, Melbourne - all using one platform.
**Implementation:** Every table has `city_id`, RLS policies enforce isolation.

### RLS (Row-Level Security)
**What:** Database automatically filters data based on who's logged in.
**Why:** Adelaide admin shouldn't see Sydney's events. RLS enforces this at PostgreSQL level.
**Example:** `SELECT * FROM events` returns only events where `city_id = current_user_city()`

### Event Bus
**What:** Features communicate via messages, not direct function calls.
**Why:** The Blog feature can notify Newsletter feature of new posts without importing it directly.
**Example:** Blog publishes `post:created` event → Newsletter listens and sends to subscribers.

### Prepared Monolith
**What:** Features built as separate modules now, extracted to plugins later.
**Why:** Ship fast in Phase 1 without plugin SDK complexity, but maintain clean architecture for Phase 2.
**Metaphor:** Building Lego blocks that snap together now, separate into boxes later.

### CoreAPI
**What:** Official API for features to access core data (users, cities, roles).
**Why:** If core schema changes, only CoreAPI updates. Features stay unchanged.
**Example:** `await CoreAPI.getCurrentCity()` instead of `SELECT * FROM cities WHERE...`

### Server Components vs Client Components
**What:** Server Components run on server (fast, no JS sent to browser). Client Components run in browser (interactive).
**Why:** Most pages are Server Components for speed. Only use Client Components when you need `useState`, `onClick`, etc.
**Rule:** Default to Server Components unless you need interactivity.

### City Admin vs Super Admin
**What:** City Admin manages one city. Super Admin manages all cities in a region.
**Example:** Adelaide City Admin creates events for Adelaide. FaithTech Australia Super Admin creates all cities.

### Supabase Auth SSR
**What:** Authentication that works on server-side (before JavaScript loads).
**Why:** Users stay logged in even with JavaScript disabled. Faster page loads.
**How:** Session stored in cookies, refreshed automatically via middleware.

---

## 🎉 For First-Time Contributors: Your Quick Win

Never contributed to open source before? **Perfect.** Here's how to make your first contribution in 10-30 minutes.

### Prerequisites
✅ Node.js 18+ installed
✅ Git installed
✅ GitHub account
❌ No Supabase account needed (local dev uses Docker)
❌ No prior Next.js experience needed (we'll guide you)

### Step 1: Set Up Locally (10 minutes)

```bash
# Fork and clone
git clone https://github.com/YOUR_USERNAME/faithtech-regional-hub.git
cd faithtech-regional-hub

# Install dependencies
npm install

# Start local Supabase (requires Docker)
npx supabase start

# Copy environment variables
cp .env.example .env.local

# Start dev server
npm run dev
```

Visit http://localhost:3000 - you should see the app running!

**Stuck?** See [Implementation Guide](5-implementation/implementation-guide.md) for setup help

### Step 2: Pick a Good First Issue (5 minutes)

Browse [Good First Issues](https://github.com/faithtech/regional-hub/labels/good-first-issue) and look for:
- 🐛 **Bug fixes** - Something not working correctly
- 📝 **Documentation** - Typos, clarifications, examples
- 🎨 **UI polish** - Small visual improvements
- ✅ **Tests** - Add test coverage

**Pro tip:** Pick something labeled "good first issue" + "help wanted"

### Step 3: Make Your Change (10 minutes)

1. Create a branch: `git checkout -b fix/issue-123`
2. Make your change (edit one file, keep it small)
3. Test locally: `npm run dev` and verify it works
4. Commit: `git commit -m "fix: resolve button alignment issue"`

### Step 4: Submit Pull Request (5 minutes)

```bash
git push origin fix/issue-123
```

Go to GitHub, click "Create Pull Request", and fill in:
- **Title:** Brief description (e.g., "Fix RSVP button alignment")
- **Description:** What you changed and why
- **Link issue:** "Fixes #123"

**That's it!** 🎉 You just contributed to a project that will serve FaithTech communities worldwide.

### What Happens Next?

1. A maintainer will review your PR (usually within 48 hours)
2. They might request changes - totally normal!
3. Make requested changes, push again
4. Once approved, your PR gets merged 🚀
5. Your name appears in Contributors list

**Want to do more?** Pick another issue or dive deeper with the "2 Hour Journey" above.

---

## 👨‍💻 For Feature Developers: Implement a Feature

**Goal:** Build a complete feature (Events, Projects, Blog) following our architecture

### Your Task Example: "Implement the Events Feature"

#### Prerequisites
Before implementing any feature, ensure you understand:
- ✅ [Core API + Event Bus](2-core-architecture/core-api-event-bus.md) (20 min) - How features access core data
- ✅ [Multi-Tenant Data Model](2-core-architecture/multi-tenant-data-model.md) (20 min) - How city isolation works
- ❓ Optional: Other feature docs for reference patterns

#### Read Only (1 hour)
1. [Feature: Events + RSVP](3-features/feature-events-rsvp.md) (40 min) - Complete specification
2. [Authorization (RLS Policies)](2-core-architecture/authorization-rls-policies.md) (20 min) - How to write RLS policies

**Do NOT read:** Other features, future vision, admin specs (not needed for Events)

#### Implement in Order (4-6 hours)
1. **Database schema** (30 min) - Create migration from "Data Model" section
2. **RLS policies** (30 min) - Copy templates from "RLS Policies" section
3. **Server actions** (1 hour) - Implement CRUD from "Server Actions" section
4. **Admin UI** (1 hour) - Build forms/tables from "Admin UI" section
5. **Public UI** (1 hour) - Build event details/RSVP from "Public UI" section
6. **Event integration** (30 min) - Emit events from "Event Bus" section
7. **Testing** (1 hour) - Test RLS, CRUD, city isolation

#### Check Your Work
- [ ] Can Adelaide city admin create an event?
- [ ] Can Sydney city admin see Adelaide events? (Should be NO)
- [ ] Can members RSVP to events in their city?
- [ ] Does event creation emit `event:created` event?
- [ ] Are all RLS policies tested?

**Submit PR** when all checkboxes pass.

### Another Example: "Implement Blog Feature"
Same process, different docs:
1. Read [Core API + Event Bus](2-core-architecture/core-api-event-bus.md)
2. Read [Feature: Blog (SEO)](3-features/feature-blog-seo.md)
3. Implement following same order as above

---

## 👔 For Core Team: 3-Week Sprint

**Goal:** Ship FaithTech Australia regional hub in 3 weeks

### Week 1: Core Foundation (5 days)

**Goal:** Database, Auth, RLS working. Zero bugs.

**Tasks:**
- [ ] All core migrations run successfully
- [ ] RLS policies tested (Adelaide can't see Sydney data)
- [ ] CoreAPI functions work (`getCurrentCity()`, `isAdmin()`)
- [ ] Event Bus can emit/listen to events
- [ ] Auth flow (signup, login, logout, password reset) works
- [ ] Supabase local + production instances set up
- [ ] CI/CD pipeline working (migrations → build → deploy)

**Success criteria:**
```bash
# Can run this and everything passes:
npm run test:rls
npm run test:auth
npm run test:core-api
```

**Owner:** Engineer A (Core/Backend)

---

### Week 2: Features (5 days)

**Goal:** Events, Projects, Blog features complete.

**Tasks:**
- [ ] **Events:** City admin can create/edit events, members can RSVP
- [ ] **Projects:** Members can submit projects, appear on showcase page
- [ ] **Blog:** City admin can write/publish posts (markdown)
- [ ] All features city-scoped (Adelaide ≠ Sydney)
- [ ] Event Bus integration (features emit events)
- [ ] Admin UI for all features (basic, polish later)

**Success criteria:**
```bash
# Can demonstrate:
1. Create event in Adelaide → Sydney doesn't see it ✅
2. Submit project in Sydney → Appears on Sydney homepage ✅
3. Publish blog post in Melbourne → SEO metadata correct ✅
```

**Owner:** Engineer B (Features/Frontend)

---

### Week 3: Polish & Launch (5 days)

**Goal:** Production-ready, deployed, FaithTech Australia using it.

**Tasks:**
- [ ] Newsletter subscribe form + CSV export
- [ ] Homepage (hero, featured events/projects)
- [ ] Admin dashboard (city settings, member management)
- [ ] Production deployment to Vercel
- [ ] Run production migrations
- [ ] Smoke test all features in production
- [ ] Onboard Adelaide, Sydney, Melbourne city admins
- [ ] Monitor for bugs (fix critical issues immediately)

**Success criteria:**
- FaithTech Australia launches publicly
- City admins can manage their content
- No critical bugs in first 48 hours

---

### Critical Success Factors

#### 1. Multi-Tenancy is Non-Negotiable
Every table has `city_id`. RLS enforces city isolation. This is not optional - FaithTech Australia has multiple cities NOW.

**Test constantly:**
```sql
-- In Supabase Studio
SET ROLE authenticated;
SET request.jwt.claims.sub TO 'adelaide-user-id';
SELECT * FROM events; -- Should only see Adelaide events
```

#### 2. "Prepared Monolith" Strategy
Build features as clean modules now, extract to runtime plugins later. Don't build the plugin SDK before proving the model works.

**What this means:**
- Features are separate packages (clean boundaries)
- Features only depend on `core/` (not each other)
- Event Bus for cross-feature communication
- No premature optimization for Phase 2

#### 3. 3-Week Sprint Mentality
Ship > Perfect. Acceptable shortcuts in Phase 1:
- ✅ Event Bus can be in-memory (not persisted)
- ✅ Admin UI can be basic (polish in Phase 2)
- ✅ Tests focus on critical paths (not 100% coverage)

**Do NOT do in Phase 1:**
- ❌ Build plugin SDK (premature)
- ❌ Over-engineer Event Bus (YAGNI)
- ❌ Perfect UI/UX (iterate based on feedback)

#### 4. Event-Driven Communication
Features communicate via Event Bus, never direct imports.

**Example:**
```typescript
// ✅ Correct
await events.emit('event:created', { eventId, cityId });

// ❌ Wrong (creates coupling)
import { sendNotification } from '@/features/newsletter';
```

---

## 🗺️ Documentation Map

Can't find something? Here's where everything lives:

### By Topic

**Understanding the Vision** (30 min)
- [Mission & Vision](1-vision/mission-and-vision.md) - "Stone Soup" strategy
- [Architectural Principles](1-vision/architectural-principles.md) - "Prepared Monolith"
- [Phased Roadmap](1-vision/phased-roadmap.md) - Phase 1-3 timeline

**Building Features** (4-6 hours per feature)
- [Feature Template](3-features/00-feature-template.md) - Copy this for new features
- [Events + RSVP](3-features/feature-events-rsvp.md)
- [Projects Showcase](3-features/feature-projects-showcase.md)
- [Blog (SEO)](3-features/feature-blog-seo.md)
- [Newsletter](3-features/feature-newsletter-subscribers.md)

**Core Architecture** (2-3 hours)
- [Multi-Tenant Data Model](2-core-architecture/multi-tenant-data-model.md)
- [User Authentication (Supabase SSR)](2-core-architecture/user-authentication-supabase.md)
- [Authorization (RLS Policies)](2-core-architecture/authorization-rls-policies.md)
- [Database Migration Workflow](2-core-architecture/database-migration-workflow.md)
- [Core API + Event Bus](2-core-architecture/core-api-event-bus.md)

**Implementation & Deployment** (1-2 hours)
- [Implementation Guide](5-implementation/implementation-guide.md) - Setup, testing, deployment
- [Admin & UI Design](4-admin-ui/admin-design-guide.md) - Component library

**Contributing** (30 min)
- [Contributing Guide](7-contributing/contributing-guide.md) - How to contribute
- [Good First Issues](https://github.com/faithtech/regional-hub/labels/good-first-issue)

### Visual Learners Start Here

Prefer diagrams? Read these first (30 min total):
1. [System Architecture](diagrams/system-architecture.md) (10 min) - 5-layer architecture
2. [Data Model ERD](diagrams/data-model-erd.md) (10 min) - Entity relationships
3. [Authentication Flow](diagrams/authentication-flow.md) (10 min) - User journey

### Complete Documentation Structure

```
docs/
├── 00-START-HERE.md                             ← You are here
├── README.md                                    ← Complete documentation index
│
├── diagrams/                                    ← Visual architecture
│   ├── system-architecture.md
│   ├── data-model-erd.md
│   ├── authentication-flow.md
│   ├── documentation-map.md
│   └── implementation-dependencies.md
│
├── 1-vision/                                    ← Strategic context
│   ├── mission-and-vision.md                    ← "Stone Soup" strategy
│   ├── architectural-principles.md              ← "Prepared Monolith" philosophy
│   └── phased-roadmap.md                        ← Phase 1-3 timeline
│
├── 2-core-architecture/                         ← Stable foundation (Week 1)
│   ├── multi-tenant-data-model.md               ← Schema + RLS helpers
│   ├── user-authentication-supabase.md          ← Auth patterns
│   ├── authorization-rls-policies.md            ← RLS templates
│   ├── database-migration-workflow.md           ← Migration best practices
│   └── core-api-event-bus.md                    ← CoreAPI + Event Bus
│
├── 3-features/                                  ← Independently buildable (Week 2-3)
│   ├── 00-feature-template.md                   ← Template for new features
│   ├── feature-events-rsvp.md                   ← Event management
│   ├── feature-projects-showcase.md             ← CREATE projects
│   ├── feature-blog-seo.md                      ← SEO-ready blog
│   └── feature-newsletter-subscribers.md        ← Email subscribers
│
├── 4-admin-ui/                                  ← Admin panels + Design system
│   └── admin-design-guide.md                    ← Consolidated UI/admin specs
│
├── 5-implementation/                            ← Tactical guides
│   └── implementation-guide.md                  ← Setup + Testing + Deployment
│
├── 6-future-roadmap/                            ← Phase 2+ vision
│   └── future-vision.md                         ← Plugin SDK + Marketplace
│
└── 7-contributing/                              ← Community onboarding
    └── contributing-guide.md                    ← How to contribute
```

---

## 🆘 How to Get Help

Stuck? Confused? That's totally normal. Here's how to get unstuck:

### Quick Questions
**FaithTech Slack** - Join #regional-hub channel
Response time: Usually within a few hours

### Bug Reports
**GitHub Issues** - [Report a bug](https://github.com/faithtech/regional-hub/issues/new?template=bug_report.md)
Include: Steps to reproduce, expected vs actual behavior, screenshots

### Feature Ideas
**GitHub Discussions** - [Suggest a feature](https://github.com/faithtech/regional-hub/discussions/new?category=ideas)
We're open to ideas, especially for Phase 2 plugins!

### Documentation Issues
**Submit a PR** - Found a typo or confusing explanation?
Fix it directly and submit a PR. Documentation contributions are highly valued!

### Setup Problems
**Implementation Guide** - [Setup and deployment guide](5-implementation/implementation-guide.md)
Covers: Local development setup, testing, deployment

### Architectural Questions
**Re-read Principles** - [Architectural Principles](1-vision/architectural-principles.md)
Most "why" questions are answered there

### General Questions
**GitHub Discussions** - [Ask anything](https://github.com/faithtech/regional-hub/discussions/new?category=q-a)
No question is too basic!

---

## ✅ Self-Assessment: Did You Understand?

Before diving into code, check your understanding:

### Basic Concepts (Essential for all contributors)
- [ ] Can you explain what multi-tenancy means in one sentence?
- [ ] Do you know what RLS stands for and why we use it?
- [ ] Can you describe the "Stone Soup" strategy?
- [ ] Do you understand the difference between Phase 1, 2, and 3?

**Not sure?** Re-read [Glossary](#-glossary-key-terms-explained)

### Architecture (Essential for feature developers)
- [ ] Can you name the 5 core features we're building in Phase 1?
- [ ] Do you know where RLS policies are defined? (Hint: Migration files)
- [ ] Can you explain why features use Event Bus instead of direct imports?
- [ ] Do you understand what CoreAPI is and why it exists?

**Not sure?** Re-read [Architectural Principles](1-vision/architectural-principles.md)

### Implementation (Essential for core team)
- [ ] Do you know how to create a database migration?
- [ ] Can you write a basic RLS policy?
- [ ] Do you understand Server Components vs Client Components?
- [ ] Can you test city isolation locally?

**Not sure?** Re-read [Implementation Guide](5-implementation/implementation-guide.md)

---

## 🚀 Your Next Step (Right Now)

Based on your chosen journey, here's what to do next:

### If you chose "5 Minutes"
✅ You've read this doc
➡️ **Next:** Read [Mission & Vision](1-vision/mission-and-vision.md) (5 min)
➡️ **Then:** Star the repo ⭐ and join FaithTech Slack

### If you chose "30 Minutes"
✅ You understand the project
➡️ **Next:** Follow [Quick Setup Guide](#step-1-set-up-locally-10-minutes)
➡️ **Then:** Pick a [Good First Issue](https://github.com/faithtech/regional-hub/labels/good-first-issue)

### If you chose "2 Hours"
✅ You're ready to contribute substantially
➡️ **Next:** Read [Architectural Principles](1-vision/architectural-principles.md) (20 min)
➡️ **Then:** Pick a feature to implement from [3-features/](3-features/)

### If you chose "Just Browsing"
✅ You have context on the project
➡️ **Next:** Star the repo ⭐ for updates
➡️ **Then:** Come back in Q2 2026 when Phase 2 (plugin SDK) launches

### If you chose "Core Team"
✅ You understand strategic context
➡️ **Next:** Read all of [Core Architecture](2-core-architecture/) (2 hours)
➡️ **Then:** Start [Week 1 tasks](#week-1-core-foundation-5-days)

---

## 💡 Pro Tips for Success

### For All Contributors
- **Start small** - Your first PR should be tiny (fix a typo, add a comment)
- **Ask early** - Don't struggle for hours. Ask in Slack after 15 min of being stuck
- **Read code** - Best way to learn is reading existing features
- **Test locally** - Always verify your change works before submitting PR

### For Feature Developers
- **Follow the template** - [Feature Template](3-features/00-feature-template.md) has everything you need
- **Test RLS religiously** - City isolation bugs are the worst kind
- **Use CoreAPI** - Never query core tables directly
- **Emit events** - Document what events your feature emits/listens to

### For Core Team
- **Document decisions** - If you change architecture, update docs immediately
- **Ship incrementally** - Don't wait for perfect. Ship, get feedback, iterate
- **Communicate constantly** - Daily standups, async updates in Slack
- **Test multi-city** - Always test with Adelaide, Sydney, Melbourne data

---

## 🌟 Final Thoughts

You're not just building a website. You're creating a foundation that will:

1. **Prove the model** with FaithTech Australia in Phase 1
2. **Enable a thriving ecosystem** of community-built features in Phase 2
3. **Serve 100+ FaithTech cities worldwide** in Phase 3

**The "Stone Soup" Strategy:**
> Build something compelling for FaithTech Australia that proves it works, then attract global developers to add their ingredients in Phase 2.

**Your contribution matters** - whether it's fixing a typo or building a complete feature. Every ingredient makes the soup better.

**Let's build something that honors God through technical excellence and serves communities worldwide.** 🚀

---

## 📞 Questions?

**Still confused?** That's OK! Here's what to do:

1. Re-read the [Glossary](#-glossary-key-terms-explained)
2. Check [How to Get Help](#-how-to-get-help)
3. Ask in FaithTech Slack #regional-hub
4. Open a [GitHub Discussion](https://github.com/faithtech/regional-hub/discussions)

**Ready to contribute?** Pick your journey above and start building! 🎉
