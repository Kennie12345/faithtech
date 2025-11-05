# FaithTech Hub Documentation

**Last Updated:** 2025-11-05

This documentation provides comprehensive, modular specifications for building the FaithTech Regional Hub platform.

---

## 🎨 Start Here: Visual Architecture

**New to the project? Start with these diagrams to understand the system:**

1. **[System Architecture](diagrams/system-architecture.md)** - 5-layer architecture with dependencies
2. **[Data Model ERD](diagrams/data-model-erd.md)** - Complete entity relationships and multi-tenancy
3. **[Authentication Flow](diagrams/authentication-flow.md)** - User journey from signup to protected access
4. **[Documentation Map](diagrams/documentation-map.md)** - Role-based reading paths
5. **[Implementation Dependencies](diagrams/implementation-dependencies.md)** - Build order and phased implementation plan

---

## 📚 Documentation Structure

```
docs/
├── README.md                                    ← You are here
├── 00-START-HERE.md                             ← Quick start guide
│
├── diagrams/                                    ← Visual architecture (START HERE!)
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
├── 2-core-architecture/                         ← Stable foundation (Phase 1)
│   ├── multi-tenant-data-model.md               ← Schema + RLS helpers
│   ├── user-authentication-supabase.md          ← Auth patterns
│   ├── authorization-rls-policies.md            ← RLS templates
│   ├── database-migration-workflow.md           ← Migration best practices
│   └── core-api-event-bus.md                    ← CoreAPI + Event Bus
│
├── 3-features/                                  ← Independently buildable (Phase 2-3)
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

## 🚀 Quick Start by Role

### 🎯 Strategic Leader
**Goal:** Understand the vision and strategy

1. [Mission and Vision](1-vision/mission-and-vision.md) - Why we're building this
2. [Phased Roadmap](1-vision/phased-roadmap.md) - Phase 1-3 timeline
3. [System Architecture Diagram](diagrams/system-architecture.md) - High-level overview

---

### 👨‍💻 Software Engineer
**Goal:** Implement features end-to-end

**Phase 1 - Core Foundation:**
1. [Multi-Tenant Data Model](2-core-architecture/multi-tenant-data-model.md)
2. [User Authentication (Supabase)](2-core-architecture/user-authentication-supabase.md)
3. [Authorization (RLS Policies)](2-core-architecture/authorization-rls-policies.md)
4. [Database Migration Workflow](2-core-architecture/database-migration-workflow.md)
5. [Core API + Event Bus](2-core-architecture/core-api-event-bus.md)

**Phase 2 - Features:**
1. [Feature: Events + RSVP](3-features/feature-events-rsvp.md)
2. [Feature: Projects Showcase](3-features/feature-projects-showcase.md)
3. [Feature: Blog (SEO)](3-features/feature-blog-seo.md)

**Phase 3 - Launch:**
1. [Feature: Newsletter](3-features/feature-newsletter-subscribers.md)
2. [Implementation Guide](5-implementation/implementation-guide.md)

---

### 🗄️ Database Engineer
**Goal:** Set up multi-tenant database with RLS

1. [Multi-Tenant Data Model](2-core-architecture/multi-tenant-data-model.md)
2. [Authorization (RLS Policies)](2-core-architecture/authorization-rls-policies.md)
3. [Database Migration Workflow](2-core-architecture/database-migration-workflow.md)
4. [Data Model ERD Diagram](diagrams/data-model-erd.md)

---

### 🎨 UI/UX Designer
**Goal:** Design consistent, brand-safe interfaces

1. [Admin & UI Design Guide](4-admin-ui/admin-design-guide.md)
2. [Feature: Events + RSVP](3-features/feature-events-rsvp.md) - UI routes section
3. [Feature: Blog (SEO)](3-features/feature-blog-seo.md) - UI routes section

---

### 🚢 DevOps Engineer
**Goal:** Deploy to production

1. [Implementation Guide](5-implementation/implementation-guide.md) - Deployment section
2. [Database Migration Workflow](2-core-architecture/database-migration-workflow.md)
3. [System Architecture Diagram](diagrams/system-architecture.md)

---

### 🌍 Community Contributor
**Goal:** Get started contributing

1. [Mission and Vision](1-vision/mission-and-vision.md)
2. [Contributing Guide](7-contributing/contributing-guide.md)
3. [Implementation Guide](5-implementation/implementation-guide.md) - Local dev setup

---

## 🧠 Key Concepts

### Multi-Tenancy
Every entity belongs to a `city`. Users can be members of multiple cities with different roles.

**Enforced via:** RLS policies that filter by `auth.current_city()`

**Read:** [Multi-Tenant Data Model](2-core-architecture/multi-tenant-data-model.md), [Authorization (RLS)](2-core-architecture/authorization-rls-policies.md)

---

### "Prepared Monolith" Architecture
Features are built as clean modules NOW, extracted to runtime plugins LATER (Phase 2).

**Why:** Ship in a focused sprint without plugin SDK complexity, but maintain extensibility.

**Read:** [Architectural Principles](1-vision/architectural-principles.md)

---

### Event-Driven Communication
Features communicate via Event Bus (publish/subscribe), not direct imports.

**Why:** Loose coupling enables plugin architecture later.

**Read:** [Core API + Event Bus](2-core-architecture/core-api-event-bus.md)

---

### CoreAPI Abstraction
Features access core data (cities, users) via `CoreAPI`, not direct Supabase queries.

**Why:** Encapsulation. If core schema changes, only CoreAPI updates.

**Read:** [Core API + Event Bus](2-core-architecture/core-api-event-bus.md)

---

## ✅ Documentation Coverage

| Category | Document | Status | Purpose |
|----------|----------|--------|---------|
| **Diagrams** | [System Architecture](diagrams/system-architecture.md) | ✅ Complete | 5-layer architecture |
| | [Data Model ERD](diagrams/data-model-erd.md) | ✅ Complete | Entity relationships |
| | [Authentication Flow](diagrams/authentication-flow.md) | ✅ Complete | User journey |
| | [Documentation Map](diagrams/documentation-map.md) | ✅ Complete | Reading paths |
| | [Implementation Dependencies](diagrams/implementation-dependencies.md) | ✅ Complete | Build order |
| **Vision** | [Mission and Vision](1-vision/mission-and-vision.md) | ✅ Complete | "Stone Soup" strategy |
| | [Architectural Principles](1-vision/architectural-principles.md) | ✅ Complete | "Prepared Monolith" |
| | [Phased Roadmap](1-vision/phased-roadmap.md) | ✅ Complete | Phase 1-3 timeline |
| **Core** | [Multi-Tenant Data Model](2-core-architecture/multi-tenant-data-model.md) | ✅ Complete | Schema + helpers |
| | [User Authentication](2-core-architecture/user-authentication-supabase.md) | ✅ Complete | Supabase Auth SSR |
| | [Authorization (RLS)](2-core-architecture/authorization-rls-policies.md) | ✅ Complete | RLS templates |
| | [Database Migrations](2-core-architecture/database-migration-workflow.md) | ✅ Complete | Migration workflow |
| | [Core API + Event Bus](2-core-architecture/core-api-event-bus.md) | ✅ Complete | API contracts |
| **Features** | [Feature Template](3-features/00-feature-template.md) | ✅ Complete | Template |
| | [Events + RSVP](3-features/feature-events-rsvp.md) | ✅ Complete | Event management |
| | [Projects Showcase](3-features/feature-projects-showcase.md) | ✅ Complete | CREATE projects |
| | [Blog (SEO)](3-features/feature-blog-seo.md) | ✅ Complete | SEO-ready blog |
| | [Newsletter](3-features/feature-newsletter-subscribers.md) | ✅ Complete | Email subscribers |
| **Admin/UI** | [Admin & UI Design Guide](4-admin-ui/admin-design-guide.md) | ✅ Complete | Consolidated UI specs |
| **Implementation** | [Implementation Guide](5-implementation/implementation-guide.md) | ✅ Complete | Setup + Test + Deploy |
| **Future** | [Future Vision](6-future-roadmap/future-vision.md) | ✅ Complete | Plugin SDK + Marketplace |
| **Contributing** | [Contributing Guide](7-contributing/contributing-guide.md) | ✅ Complete | How to contribute |

---

## 🛠️ Implementation Checklist

### Phase 1: Core Foundation
- [ ] Database migrations
  - [ ] 001_initial_schema.sql (extensions, types)
  - [ ] 002_create_cities.sql
  - [ ] 003_create_profiles.sql
  - [ ] 004_create_user_city_roles.sql
  - [ ] 005_create_groups.sql
  - [ ] 006_rls_core_tables.sql
- [ ] CoreAPI implementation
  - [ ] User functions
  - [ ] City functions
  - [ ] Group functions
- [ ] Event Bus
  - [ ] EventEmitter wrapper
  - [ ] Core event emitters
- [ ] Auth flow
  - [ ] Middleware session refresh
  - [ ] Sign up/login/logout
  - [ ] Password reset

### Phase 2: Features
- [ ] Events ([docs](3-features/feature-events-rsvp.md))
  - [ ] Database schema + RLS
  - [ ] Server actions (CRUD + RSVP)
  - [ ] Admin UI
  - [ ] Public UI
  - [ ] Event emitters/listeners
- [ ] Projects ([docs](3-features/feature-projects-showcase.md))
  - [ ] Database schema + RLS
  - [ ] Server actions
  - [ ] Admin UI
  - [ ] Public UI
- [ ] Blog ([docs](3-features/feature-blog-seo.md))
  - [ ] Database schema + RLS
  - [ ] Server actions
  - [ ] Markdown editor
  - [ ] Public UI with SEO

### Phase 3: Polish & Launch
- [ ] Newsletter ([docs](3-features/feature-newsletter-subscribers.md))
  - [ ] Database schema + RLS
  - [ ] Subscribe form
  - [ ] CSV export
- [ ] Admin Dashboard
  - [ ] City settings UI
  - [ ] Member management
  - [ ] Feature toggles
- [ ] Public Homepage
  - [ ] Hero section
  - [ ] Featured events/projects
  - [ ] Subscribe form
- [ ] Deployment
  - [ ] Vercel setup
  - [ ] Supabase production instance
  - [ ] Environment variables
  - [ ] Run production migrations
- [ ] Testing
  - [ ] RLS policy tests
  - [ ] Critical user journeys
  - [ ] Multi-city isolation

---

## 🧩 Common Patterns

### Creating a New Feature

1. Copy [Feature Template](3-features/00-feature-template.md) → `3-features/feature-your-feature.md`
2. Fill in all sections (data model, RLS, actions, UI, events)
3. Implement atomic units in order:
   - Database schema (migration)
   - RLS policies
   - Server actions
   - Admin UI
   - Public UI
   - Event integration
4. Test:
   - RLS with different user roles
   - CRUD operations
   - City isolation
   - Event emission/listening
5. Deploy migration to production

---

### Adding a Core Table

1. Create migration: `supabase migration new create_[table]`
2. Define schema in migration file
3. Add RLS policies
4. Add indexes on foreign keys
5. Update [Multi-Tenant Data Model](2-core-architecture/multi-tenant-data-model.md)
6. Add helper functions if needed
7. Expose via CoreAPI if features need access

---

### Implementing an Event Listener

```typescript
// features/your-feature/listeners.ts
import { events } from '@/lib/core/events';

export function registerYourFeatureListeners() {
  events.on('some:event', async (data) => {
    try {
      // Handle event
      console.log('[YourFeature] Event received:', data);
      // ... your logic
    } catch (error) {
      console.error('[YourFeature] Error handling event:', error);
    }
  });
}

// Register in app initialization
// app/layout.tsx or dedicated init file
import { registerYourFeatureListeners } from '@/features/your-feature/listeners';
registerYourFeatureListeners();
```

---

## 🔧 Troubleshooting

### "RLS policy blocks my query"
- **Cause:** User doesn't have permission or policy is too restrictive
- **Fix:**
  1. Check policy with `SET ROLE authenticated; SET request.jwt.claims.sub TO 'user-id'; SELECT ...`
  2. Verify user has correct role in `user_city_roles`
  3. Check `auth.current_city()` returns expected city

### "Migration fails in production"
- **Cause:** Production DB has data that local doesn't
- **Fix:**
  1. Test migration with production-like seed data locally
  2. Add IF NOT EXISTS clauses
  3. Have rollback SQL ready

### "Event not firing"
- **Cause:** Listener not registered or event name mismatch
- **Fix:**
  1. Check listener is called in app initialization
  2. Verify event name matches exactly (case-sensitive)
  3. Add console.log in emit() to debug

### "Session not persisting"
- **Cause:** Missing `await cookies()` in Server Components
- **Fix:** Always `const cookieStore = await cookies()` in server-side code

---

## 🚀 Phase 2+ Roadmap

### Plugin SDK (Phase 2)
Once Phase 1 launches and proves the model:
1. Extract Events feature to runtime plugin (proof-of-concept)
2. Build `@faithtech/sdk` NPM package
3. Create `npx create-faithtech-plugin` CLI
4. Document plugin API
5. Launch vetted marketplace

**Read:** [Future Vision](6-future-roadmap/future-vision.md)

---

### Advanced Features (Phase 3)
Community-built plugins:
- Forum (integrate Circle or build custom)
- Proximity Chat (Gather.town-style)
- Social Auto-Poster (post events to Slack/X)
- Analytics Dashboard
- Member Directory with search
- Project voting/comments

**Read:** [Future Vision](6-future-roadmap/future-vision.md)

---

## 🤝 Contributing

We welcome contributions! See [Contributing Guide](7-contributing/contributing-guide.md) for:
- Two ways to contribute (improve core vs. build plugins)
- Code standards
- PR guidelines
- Product backlog

---

## 📞 Support

- **Documentation Issues:** Open issue in this repo
- **Bug Reports:** Use GitHub Issues
- **Feature Requests:** Open Discussion
- **General Questions:** FaithTech Slack (check [CLAUDE.md](/CLAUDE.md) for invite link)

---

## 📖 Summary

This documentation enables:
- ✅ Multiple developers to build features in parallel
- ✅ Clear 3-week implementation path
- ✅ Modular architecture that can evolve
- ✅ Global contributor onboarding

**Next Steps:**
1. Start with [Visual Architecture Diagrams](diagrams/)
2. Read [Mission and Vision](1-vision/mission-and-vision.md) + [Architectural Principles](1-vision/architectural-principles.md)
3. Follow [Implementation Guide](5-implementation/implementation-guide.md)
4. Launch FaithTech Australia
5. Inspire global adoption

Let's build something worthy of the global FaithTech movement. 🚀
