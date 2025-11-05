# Future Vision: Phase 2+ Plugin Ecosystem

**Last Updated:** 2025-11-05

This document outlines the Phase 2+ vision for runtime plugins, marketplace, and advanced features.

---

## Phase 2: Plugin Architecture (Post-Launch)

### Runtime Plugin Loader

**Goal:** Features become true runtime plugins that can be installed/uninstalled

**Implementation:**
```typescript
// Plugin manifest
export default {
  name: "Awesome Forum",
  version: "1.0.0",
  permissions: ["read_users", "read_groups"],
  routes: [{ path: "/forum", component: ForumPage }],
  events: {
    emits: ["post:created"],
    listens: ["user:joined_city"]
  }
};

// Core loads plugin dynamically
import dynamic from 'next/dynamic';
const ForumPlugin = dynamic(() => import('url-to-plugin-cdn'));
```

**Security:**
- Each plugin runs in React Error Boundary
- RLS enforced at database level
- CSP restricts external API calls

---

## Plugin SDK (@faithtech/sdk)

**NPM Package:** `npm install @faithtech/sdk`

**Provides:**
```typescript
import { useUser, useCity, events } from '@faithtech/sdk';

export default function MyPlugin() {
  const { user } = useUser();
  const { city } = useCity();

  // Emit events
  events.emit('my-plugin:action', { data });

  return <div>Hello {user.name} from {city.name}!</div>;
}
```

---

## Plugin CLI

**Scaffold new plugin:**
```bash
npx create-faithtech-plugin
# Name: Awesome Forum
# Creates: ./awesome-forum/ with boilerplate
```

**Generated structure:**
```
awesome-forum/
├── plugin.json         # Manifest
├── src/
│   ├── pages/         # UI components
│   ├── actions.ts     # Server actions
│   └── listeners.ts   # Event listeners
├── migrations/        # Database schema
└── tests/            # Plugin tests
```

---

## Vetted Plugin Marketplace

**Repo:** `github.com/faithtech/faithtech-marketplace`

**Structure:**
```json
{
  "plugins": [
    {
      "id": "awesome-forum",
      "name": "Awesome Forum",
      "author": "FaithTech Community",
      "version": "1.0.0",
      "cdn_url": "https://cdn.faithtech.com/plugins/awesome-forum/1.0.0/bundle.js",
      "hash": "sha256-...",
      "permissions_requested": ["read_users", "read_groups"],
      "external_domains": []
    }
  ]
}
```

**Vetting Process:**
1. Developer submits PR to marketplace repo
2. Automated linting + security checks
3. Manual code review by core team
4. If approved: Build plugin, host on CDN, add to marketplace JSON

---

## Advanced Feature Ideas (Phase 3)

### Community-Built Plugins

**Forum Plugin:**
- Discourse-style discussion forum
- Categories, threads, replies
- Upvoting, moderation

**Proximity Chat Plugin:**
- Gather.town-style 2D map
- WebRTC video chat when avatars are close
- Public/private areas

**Social Auto-Poster:**
- Post events to Slack, X (Twitter), Facebook
- Automated or manual publishing

**Analytics Dashboard:**
- Member growth charts
- Event attendance trends
- Blog post views

---

## Schema-per-Plugin (Optional)

**If security audit recommends:**

Migrate from table-level RLS to schema-per-plugin:

```sql
-- Instead of:
CREATE TABLE events (...);  -- In public schema

-- Use:
CREATE SCHEMA plugin_events;
CREATE TABLE plugin_events.events (...);

-- Plugin can only access plugin_events schema
GRANT USAGE ON SCHEMA plugin_events TO plugin_events_role;
```

**Trade-off:** More isolation, but more complex

---

## Layout Marketplace

**Vision:** Custom homepage designs

**Example:**
- "Tech-focused" layout (large project showcase)
- "Event-heavy" layout (calendar view dominant)
- "Blog-first" layout (magazine-style)

**Implementation:** React components using only `@faithtech/ui` components (no custom CSS)

---

## Global Adoption Targets

**Phase 3 Long-Term Goals:**

These are Phase 3 aspirational targets that follow *after* successfully proving the model with FaithTech Australia (Phase 1) and building a thriving plugin ecosystem (Phase 2):

- 10+ regions deployed (USA, UK, Nigeria, etc.)
- 20+ vetted plugins
- 100+ cities active
- Self-sustaining community

**Note:** Global adoption is not a Phase 1-2 metric. Success in early phases is measured by quality (platform reliability, contributor ecosystem health, sustainability) rather than deployment quantity.

---

**Note:** Don't build this yet! Focus on Phase 1 (launching Australia). Phase 2 comes AFTER we prove the model works.

**Read More:** See [../1-vision/phased-roadmap.md](../1-vision/phased-roadmap.md) for timeline
