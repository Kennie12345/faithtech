# Admin & UI Design Guide

**Last Updated:** 2025-11-05

This document consolidates UI design system, admin panel specifications, and layout patterns.

---

## Design System (Shadcn UI + Brand)

### Core Components
- **Framework:** Shadcn UI (built on Radix UI)
- **Styling:** Tailwind CSS 3.4
- **Theme:** next-themes for dark/light mode
- **Icons:** Lucide React

### Brand Colors
```css
/* FaithTech Brand (locked) */
--primary: #3B82F6;     /* Blue-500 */
--background: #FFFFFF;   /* White */
--foreground: #1F2937;   /* Gray-800 */

/* City Customization (from curated list) */
--accent: [city.accent_color]  /* City admin can choose from: */
  /* Blue (#3B82F6), Green (#10B981), Purple (#8B5CF6) */
```

### Typography
- **Headings:** Inter (locked)
- **Body:** Inter (locked)

---

## Admin Panels

### Regional Admin (Super Admin)

**Capabilities:**
- Create new cities
- Assign city admins
- View all cities (read-only)
- Manage global settings

**UI Location:** `/protected/admin/regional`

**Key Components:**
1. City creation form
2. City list with admin assignments
3. Global settings panel

---

### City Admin

**Capabilities:**
- Manage city profile (name, logo, hero image)
- Enable/disable features (Events, Blog, Newsletter)
- Create/manage events, projects, blog posts
- Manage members (approve, remove)
- Export newsletter subscribers

**UI Location:** `/protected/admin/[feature]`

**Navigation Structure:**
```
Dashboard
├── Events
├── Projects
├── Blog
├── Newsletter
└── Settings
    ├── City Profile
    ├── Feature Toggles
    └── Members
```

---

## Layout Patterns

### Public Layout
- **Route:** `/[citySlug]/*`
- **Header:** City logo, navigation (Events, Projects, Blog)
- **Footer:** About, Contact, Social links

### Protected Layout
- **Route:** `/protected/*`
- **Sidebar:** Feature navigation
- **Header:** User menu, logout

### Admin Layout
- **Route:** `/protected/admin/*`
- **Sidebar:** Admin navigation
- **Breadcrumbs:** Show current location

---

## Feature Toggles

Cities can enable/disable features via admin dashboard:

**Implementation:**
```typescript
// Database
CREATE TABLE city_features (
  city_id UUID REFERENCES cities(id),
  feature_slug TEXT, -- 'events', 'blog', etc.
  is_enabled BOOLEAN DEFAULT TRUE
);

// UI
<FeatureToggle feature="events" />
```

**Read More:** See feature specs for integration details.
