# System Architecture: Layered Overview

**Document Type:** Visual Architecture
**Audience:** All stakeholders
**Purpose:** Understand the high-level system structure
**Last Updated:** 2025-11-05

---

## 5-Layer Architecture

The FaithTech Hub is built with a **layered architecture** where dependencies flow downward only (outer layers depend on inner layers, never the reverse).

```
┌─────────────────────────────────────────────────────────────────┐
│                    LAYER 1: PUBLIC WEBSITE                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  Homepage    │  │  Events List │  │  Blog Posts  │          │
│  │  Hero, CTAs  │  │  Event Detail│  │  Post Detail │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│  ┌──────────────┐  ┌──────────────┐                            │
│  │  Projects    │  │  About Pages │                            │
│  │  Gallery     │  │  (City info) │                            │
│  └──────────────┘  └──────────────┘                            │
│                                                                 │
│  Technology: Next.js Server Components, SSR for SEO            │
│  URL Pattern: /[citySlug]/events, /[citySlug]/blog            │
└─────────────────────────────────────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│               LAYER 2: PROTECTED/ADMIN AREA                     │
│  ┌────────────────────┐  ┌────────────────────┐                │
│  │  Member Dashboard  │  │  City Admin Panel  │                │
│  │  - My RSVPs        │  │  - Manage Events   │                │
│  │  - My Projects     │  │  - Write Blog      │                │
│  └────────────────────┘  │  - Manage Members  │                │
│                          └────────────────────┘                │
│  ┌────────────────────┐                                        │
│  │ Regional Admin     │                                        │
│  │ - Create Cities    │                                        │
│  │ - Assign Admins    │                                        │
│  └────────────────────┘                                        │
│                                                                 │
│  Technology: Next.js Client Components, Auth-protected routes  │
│  URL Pattern: /protected/admin/*, /protected/dashboard         │
└─────────────────────────────────────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                  LAYER 3: FEATURE MODULES                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │  Events  │  │ Projects │  │   Blog   │  │Newsletter│       │
│  │  Module  │  │  Module  │  │  Module  │  │  Module  │       │
│  ├──────────┤  ├──────────┤  ├──────────┤  ├──────────┤       │
│  │• Actions │  │• Actions │  │• Actions │  │• Actions │       │
│  │• UI      │  │• UI      │  │• UI      │  │• UI      │       │
│  │• RLS     │  │• RLS     │  │• RLS     │  │• RLS     │       │
│  │• Events  │  │• Events  │  │• Events  │  │• Events  │       │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘       │
│                                                                 │
│  Technology: Modular packages (prepared for plugin extraction) │
│  Communication: Event Bus only (no direct imports)             │
└─────────────────────────────────────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    LAYER 4: CORE API                            │
│  ┌────────────────────────────────────────────────────────┐    │
│  │                   CoreAPI                              │    │
│  │  - getUser()           Get current user                │    │
│  │  - getCity()           Get current city                │    │
│  │  - getAllCities()      List all cities (super admin)   │    │
│  │  - getUserRole()       Get user's role in city         │    │
│  │  - isAdmin()           Check if user is admin          │    │
│  │  - getGroups()         Get city's groups               │    │
│  └────────────────────────────────────────────────────────┘    │
│  ┌────────────────────────────────────────────────────────┐    │
│  │                   Event Bus                            │    │
│  │  - emit(event, data)   Publish event                   │    │
│  │  - on(event, handler)  Subscribe to event              │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                 │
│  Technology: TypeScript interfaces, EventEmitter              │
│  Purpose: Stable contracts between core and features          │
└─────────────────────────────────────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              LAYER 5: DATABASE (SUPABASE)                       │
│  ┌────────────────────────────────────────────────────────┐    │
│  │                PostgreSQL Database                     │    │
│  │                                                        │    │
│  │  Core Tables:                                         │    │
│  │  • cities         (Adelaide, Sydney, Melbourne)       │    │
│  │  • users          (Supabase Auth)                     │    │
│  │  • profiles       (display names, avatars)            │    │
│  │  • user_city_roles (multi-tenant membership)          │    │
│  │  • groups         (Tech Industry, Students, etc.)     │    │
│  │                                                        │    │
│  │  Feature Tables (city-scoped):                        │    │
│  │  • events         (city_id FK)                        │    │
│  │  • event_rsvps    (city_id FK)                        │    │
│  │  • projects       (city_id FK)                        │    │
│  │  • posts          (city_id FK)                        │    │
│  │  • newsletter_subscribers (city_id FK)                │    │
│  │                                                        │    │
│  │  Security: Row-Level Security (RLS) policies          │    │
│  │  • City isolation enforced at database level          │    │
│  │  • Role-based access (super_admin, city_admin, member)│    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                 │
│  Technology: Supabase (PostgreSQL + Auth + Storage + Realtime) │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Flow: Example User Journey

**Scenario:** A member RSVPs to an event

```
1. User clicks "RSVP" button
   ↓
2. RSVPButton.tsx (Client Component, Layer 1)
   ↓
3. Calls server action: rsvpToEvent(eventId, 'yes')
   ↓
4. features/events/actions.ts (Layer 3)
   ├─► Calls CoreAPI.getUser() (Layer 4) to get current user
   ├─► Inserts into event_rsvps table (Layer 5)
   └─► Emits event: events.emit('event:rsvp_added', { eventId, userId })
   ↓
5. Newsletter module listens (Layer 3)
   └─► events.on('event:rsvp_added', ...)
       └─► Could send confirmation email (future)
   ↓
6. Database returns success
   ↓
7. UI updates, shows "You're going!"
```

**Key Points:**
- ✅ Feature (Events) never directly imported Newsletter
- ✅ Communication via Event Bus (loose coupling)
- ✅ CoreAPI abstracted database queries
- ✅ RLS ensured user can only RSVP to their city's events

---

## Dependency Rules

### ✅ **Allowed Dependencies:**
- Layer 1 (Public) → Layer 3 (Features)
- Layer 2 (Protected) → Layer 3 (Features)
- Layer 3 (Features) → Layer 4 (Core API)
- Layer 3 (Features) → Layer 5 (Database) via RLS
- Layer 4 (Core API) → Layer 5 (Database)

### ❌ **Forbidden Dependencies:**
- Features → Features (use Event Bus instead)
- Core API → Features (never depend on outer layers)
- Database → anything (data layer is innermost)

---

## Technology Stack by Layer

| Layer | Primary Technology | Secondary |
|-------|-------------------|-----------|
| Public/Protected UI | Next.js 15 App Router | React Server Components |
| Feature Modules | TypeScript Server Actions | React Client Components |
| Core API | TypeScript Functions | EventEmitter (Node.js) |
| Database | Supabase PostgreSQL | RLS Policies, Triggers |
| Auth | Supabase Auth | SSR Cookies |
| Storage | Supabase Storage | Image uploads |
| Hosting | Vercel | Auto-deploy from Git |

---

## Multi-Tenancy Enforcement

**Every layer respects city isolation:**

1. **Layer 5 (Database):** RLS policies filter by `city_id`
2. **Layer 4 (Core API):** `getCurrentCity()` returns active city
3. **Layer 3 (Features):** All queries include `city_id = getCurrentCity()`
4. **Layer 2 (Admin UI):** City admin sees only their city's data
5. **Layer 1 (Public UI):** URL includes city slug `/adelaide/events`

**Result:** Adelaide admin cannot see Sydney's events (enforced at every layer)

---

## Next Steps

- **For detailed data model:** See [../2-core-architecture/multi-tenant-data-model.md](../2-core-architecture/multi-tenant-data-model.md)
- **For authentication flow:** See [authentication-flow.md](authentication-flow.md)
- **For feature specifications:** See [../3-features/](../3-features/) folder for all feature docs
- **For implementation order:** See [implementation-dependencies.md](implementation-dependencies.md)
