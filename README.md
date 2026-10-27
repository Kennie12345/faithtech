# FaithTech Regional Hub Starter Kit

An open-source website starter for FaithTech cities and regions. One deployment serves several cities from a single Next.js and Supabase codebase: each city gets its own pages for events, projects, blog and newsletter, and its own admins, with row-level security in Postgres keeping each city's data separate.

It started in the FaithTech Sydney community. The problem it addresses: local FaithTech groups either depend on the global faithtech.com site, which offers little local control, or every city builds its own site from scratch, which means inconsistent branding, duplicated volunteer effort and sites nobody can maintain. A shared starter lets cities run the same platform and share improvements.

**Stack:** Next.js 16 (App Router, React Server Components, server actions) · React 19 · TypeScript · Supabase (Postgres, Auth, Storage, RLS) · Tailwind CSS 3.4 with shadcn/ui and a FaithTech design-system layer · Zod · Vitest and Playwright.

**Status:** active development. Events, projects, blog, newsletter, per-city feature toggles and the admin panels are implemented. The plugin SDK and marketplace described below are planned, not built.

## Features

- **Multi-city routing.** Every public page lives under `/[citySlug]` (for example `/sydney/events`). The root page uses Vercel geo headers to redirect a visitor to their nearest active city, or shows a city directory. Migrations seed Adelaide, Sydney, Melbourne and Brisbane.
- **Roles.** `super_admin`, `city_admin` and `member`, stored per city in `user_city_roles` and enforced by RLS policies.
- **Events** with RSVPs, featured events and admin create/edit.
- **Projects showcase** with team members, GitHub and demo links.
- **Blog** with a draft and publish workflow, featured posts and Markdown content.
- **Newsletter** subscribe and unsubscribe pages, subscriber admin, and CSV export.
- **Per-city feature toggles** (`city_features` table) so a city can switch events, blog, projects or newsletter on or off from the admin settings page.
- **Auth** via Supabase with SSR cookies: sign-up, email confirmation, password reset, protected admin routes.

## How it works

The architecture is a "prepared monolith": features are written as self-contained modules now so they can be extracted into runtime plugins later without a rewrite.

```
app/[citySlug]/     public city pages (events, projects, blog, subscribe)
app/protected/      authenticated admin panels per feature, plus city settings
features/<name>/    one module per feature: server actions, Zod schemas, types, listeners
lib/core/api.ts     CoreAPI: users, cities, roles, groups and stats (the only shared surface)
lib/core/events.ts  typed pub/sub event bus
supabase/migrations 25 ordered SQL migrations: schema, helper functions, RLS, storage buckets
```

Three rules hold the structure together:

1. **Tenancy in the database.** City-scoped tables carry a `city_id`, and RLS policies plus helper functions (`006_helper_functions.sql`) decide what each role can read or write in each city.
2. **Features depend only on core.** A feature may call `CoreAPI` but never imports another feature.
3. **Cross-feature effects go through the event bus.** Feature actions emit typed events (`event:created`, `event:rsvp_added`, `post:published`, `subscriber:added` and others), and other features subscribe in their `listeners.ts`. `instrumentation.ts` registers the listeners once at server start.

Design documents are in [docs/](docs/README.md): start with [docs/00-START-HERE.md](docs/00-START-HERE.md) and [docs/diagrams/system-architecture.md](docs/diagrams/system-architecture.md).

## Local development

Prerequisites: Node.js 20 or later, Docker, and the [Supabase CLI](https://supabase.com/docs/guides/cli).

```bash
git clone https://github.com/Kennie12345/faithtech.git
cd faithtech
npm install

supabase start      # local Postgres, Auth, Storage and Studio
supabase db reset   # apply all migrations and supabase/seed.sql

cp .env.example .env.local
# fill in the API URL, anon key and service role key printed by `supabase start`

npm run dev         # http://localhost:3000
```

Supabase Studio runs at http://localhost:54323. [SETUP.md](SETUP.md) walks through creating test users, assigning city roles and checking the events feature end to end.

### Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Next.js dev server with Turbopack |
| `npm run build` / `npm start` | Production build and server |
| `npm run lint` | ESLint |
| `npm run type-check` | `tsc --noEmit` |
| `npm test` | Vitest (unit tests live in `__tests__/unit`) |
| `npm run test:coverage` | Vitest with coverage |
| `npm run test:e2e` | Playwright (configured for `__tests__/e2e`; no specs committed yet) |

## Deploying

There is no one-click deploy yet. The full guide, including auth settings and initial data, is the [Production Deployment](SETUP.md#production-deployment) section of SETUP.md. In short:

1. Create a Supabase project and apply the migrations (`supabase link`, then `supabase db push`).
2. Import the repository into Vercel and set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` and `SUPABASE_SERVICE_ROLE_KEY`.
3. Create your first user in the Supabase dashboard, then run `supabase/setup_admin_user.sql` to give that user a profile and the super-admin role.

## Roadmap

The long-term aim is a plugin ecosystem that FaithTech developers anywhere can contribute to, built on three principles:

- **Secure:** each plugin gets its own database schema, so a plugin cannot read or corrupt core data or another plugin's data.
- **Safe:** plugins load at runtime inside React error boundaries, so a failing plugin cannot take down the page.
- **Inclusive:** a `create-faithtech-plugin` CLI and an `@faithtech/sdk` package so contributors can build a feature without learning the whole codebase.

Planned phases: harden the core features and launch with FaithTech Australia; extract Events as the first runtime plugin and publish the SDK; then a vetted plugin marketplace. The detail is in [docs/1-vision/phased-roadmap.md](docs/1-vision/phased-roadmap.md).

## Contributing

Fork the repo, follow the local setup above, keep changes inside the relevant feature module or migration, add tests, and open a pull request. See [docs/7-contributing/contributing-guide.md](docs/7-contributing/contributing-guide.md). Bugs and feature requests go to [GitHub Issues](https://github.com/Kennie12345/faithtech/issues).

## License

No license file has been added yet.

## Acknowledgments

Built by the FaithTech Sydney community for the wider FaithTech network.

**Core philosophy:** 1 Corinthians 3:10-11.
