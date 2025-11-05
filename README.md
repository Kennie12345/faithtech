# FaithTech Regional Hub Starter Kit

An open-source, deployable platform that empowers any FaithTech city or region to launch a powerful, brand-aligned community website in under 60 minutes.

---

## 📖 About This Project

This is a **"batteries-included" starter kit** designed for the global FaithTech network. Whether you're running a single city (like FaithTech Bangkok) or managing an entire region (like FaithTech Australia with multiple cities), this platform gives you everything you need to build community, showcase projects, and grow your local movement.

### The Problem We're Solving

Local FaithTech communities worldwide face two major barriers:

1. **The Central Bottleneck**: Using the global faithtech.com site can be slow and lacks local customization
2. **The Technical Burden**: Building a custom site from scratch requires massive volunteer effort and leads to:
   - Inconsistent branding across regions
   - Fragmented tech stacks that can't be shared
   - Duplicated effort as every city reinvents the same features
   - High maintenance costs and volunteer burnout

### Our Solution: A "Prepared Monolith" Architecture

This platform solves both problems with a unique **"Core + Plugin"** architecture:

- **Ship Fast**: Deploy a complete, feature-rich platform in under 60 minutes
- **Stay Flexible**: Clean modular design prepares for future plugin ecosystem
- **Collaborate Globally**: Build once, share everywhere across the FaithTech network

**Two Deployment Modes:**
- **Single City Mode**: Run a simple, powerful website for just your city
- **Region Mode**: Manage multiple cities (Brisbane, Sydney, Melbourne, Adelaide) from one dashboard

---

## 🚀 Built for Community: The Plugin Vision

The long-term vision is a **WordPress-like plugin ecosystem** where global FaithTech developers can build and share features. The architecture is designed around three core principles:

### 🔒 Secure (Schema-per-Plugin)
Plugins are isolated in their own database schemas. A "forum" plugin cannot accidentally read or corrupt core user data or other plugins' data.

### ⛑️ Safe (Runtime Error Boundary)
Plugins load at runtime with React Error Boundaries. A crashing plugin shows an error in its own component while the rest of your app remains fully functional.

### 🤗 Inclusive (Developer SDK)
Future: `npx create-faithtech-plugin` CLI tool lets developers build features in total isolation without understanding the core codebase.

**Current Status**: The platform is built as a "Prepared Monolith" - features are clean modules now, ready to extract as runtime plugins in Phase 2.

---

## ✨ Features (Batteries-Included)

### Tech Stack
- **Framework**: Next.js 15 (App Router) with React Server Components
- **Database**: Supabase (PostgreSQL + Auth + Storage + Realtime)
- **Styling**: Tailwind CSS 3.4 + Shadcn UI component library
- **Hosting**: Vercel (one-click deploy)
- **Multi-Tenancy**: Row-Level Security (RLS) enforced at database level

### Core Features

✅ **Multi-City Support**: Full multi-tenancy with city isolation from day one

✅ **Authentication**: Supabase Auth with SSR, email verification, password reset

✅ **Events Management**: Create events, manage RSVPs, calendar views

✅ **Project Showcase**: Display CREATE projects with team members and links

✅ **SEO-Ready Blog**: Markdown-based blog with draft/publish workflow

✅ **Newsletter**: Subscriber management with CSV export for Mailchimp

✅ **Admin Panels**: Regional admin (manage cities) and city admin (manage content)

✅ **Brand Safety**: Locked-down component library ensures 100% FaithTech brand consistency

---

## 🚀 Getting Started (One-Click Deploy)

The fastest way to get started is deploying directly to Vercel:

### Deploy to Production

1. **Click "Deploy to Vercel"** button (add button at top of README)
2. **Follow prompts** to create your GitHub repository from this template
3. **Connect Supabase** - Vercel will automatically create and connect a Supabase project
4. **Complete setup** - Once deployed, visit your site's URL and complete the `/setup` wizard

**Result**: Technical deployment to Vercel completes in ~5 minutes. After deployment, complete the `/setup` wizard to configure your region and cities (~15 minutes). **Total time from start to fully operational: under 60 minutes.**

---

## 👨‍💻 Local Development (For Contributors)

If you want to contribute to the core platform or customize beyond the admin panel:

### Prerequisites
- Node.js 18+
- Supabase CLI ([installation guide](https://supabase.com/docs/guides/cli))
- Git

### Setup Steps

**1. Fork and Clone**
```bash
git clone https://github.com/YOUR_USERNAME/faithtech-regional-hub.git
cd faithtech-regional-hub
```

**2. Install Dependencies**
```bash
npm install
```

**3. Start Local Supabase**
```bash
# Start local Supabase services
supabase start

# Apply migrations (first time or after pulling new migrations)
supabase db reset
```

**Note the printed `SUPABASE_URL` and `anon_key` from the terminal.**

**4. Configure Environment**
```bash
# Copy example environment file
cp .env.example .env.local

# Edit .env.local and paste Supabase credentials from previous step
```

**5. Run Development Server**
```bash
npm run dev
```

Visit **http://localhost:3000** - your local instance is running!

### Local Supabase Studio

Access Supabase Studio UI at **http://localhost:54323** to:
- Browse database tables
- Test RLS policies
- View auth users
- Inspect real-time subscriptions

---

## 🗺️ Roadmap

### Phase 0: The Deployable MVP ✅ **COMPLETE**

- [x] Prove the "One-Click Deploy" flow
- [x] Implement unified Single/Region setup screen
- [x] Core Auth and Admin panels working

### Phase 1: The "Batteries-Included" Release 🔄 **CURRENT FOCUS**

- [ ] Build all core features: Events, Projects, Blog, Newsletter
- [ ] Finalize City Admin vs Super Admin RLS policies
- [ ] Comprehensive test suite for core features
- [ ] Multi-city isolation testing
- [ ] Launch with FaithTech Australia

### Phase 2: The Plugin SDK 🔮 **PLANNED**

- [ ] Runtime Plugin Loader (next/dynamic + Error Boundary)
- [ ] Secure Install API with schema-per-plugin isolation
- [ ] Publish `@faithtech/sdk` NPM package (official PluginAPI)
- [ ] Publish `npx create-faithtech-plugin` CLI tool
- [ ] Extract Events feature as proof-of-concept plugin

### Phase 3: The Marketplace 🔮 **PLANNED**

- [ ] Central, vetted Plugin Marketplace
- [ ] First "advanced" community plugins (Forum, Proximity Chat, Social Auto-Poster)
- [ ] Plugin bounty program
- [ ] Global adoption across 10+ FaithTech regions

---

## 🤝 How to Contribute

We welcome contributions! There are **two primary ways** to get involved:

### 1. Improve the Core Platform (Now)

**Best for**: Fixing bugs, improving official features (Events, Blog, etc.)

**How to contribute**:
1. Follow the "Local Development" setup above
2. Make your changes in the relevant area (e.g., `app/`, `components/`, `supabase/migrations/`)
3. Write tests for your changes
4. Submit a Pull Request with clear description

**See**: [docs/7-contributing/contributing-guide.md](docs/7-contributing/contributing-guide.md)

### 2. Build Plugins (Phase 2+)

**Best for**: Adding entirely new features

**Current Status**: Plugin SDK is planned for Phase 2. Once ready, you'll be able to:
- Use `npx create-faithtech-plugin` to scaffold a new plugin
- Build your feature in total isolation using `@faithtech/sdk`
- Submit to the vetted marketplace for all FaithTech cities to use

**Examples of future plugins**:
- Forum (Discourse-style discussions)
- Proximity Chat (Gather.town-style virtual spaces)
- Social Auto-Poster (post events to Slack/X/Facebook)
- Analytics Dashboard
- Member Directory

---

## 📚 Documentation

### Quick Links

- **[Start Here](docs/00-START-HERE.md)** - Quick start guide for all roles
- **[System Architecture](docs/diagrams/system-architecture.md)** - Visual overview of 5-layer architecture
- **[Implementation Guide](docs/5-implementation/implementation-guide.md)** - Setup, testing, deployment
- **[Contributing Guide](docs/7-contributing/contributing-guide.md)** - How to contribute

### By Role

**Strategic Leaders**: Read [Mission & Vision](docs/1-vision/mission-and-vision.md) and [Phased Roadmap](docs/1-vision/phased-roadmap.md)

**Software Engineers**: Start with [Documentation Map](docs/diagrams/documentation-map.md) then dive into [Core Architecture](docs/2-core-architecture/)

**DevOps**: See [Implementation Guide - Deployment](docs/5-implementation/implementation-guide.md#production-deployment)

**Complete Documentation**: [docs/README.md](docs/README.md)

---

## 🏗️ Architecture Overview

### The "Prepared Monolith" Strategy

Features are built as **clean, modular packages NOW**, ready to extract as **runtime plugins LATER**.

**Why this approach?**
- ✅ Ship complete platform immediately
- ✅ Maintain clean architecture and separation of concerns
- ✅ Enable future plugin extraction without major refactoring
- ✅ Allow parallel development by multiple teams

### Key Architectural Principles

1. **Multi-Tenancy by Default**: Every table has `city_id`, RLS enforces isolation
2. **Feature Independence**: Features only depend on core, communicate via Event Bus
3. **Event-Driven**: Loose coupling enables future plugin architecture
4. **Brand Safety**: Locked-down UI components prevent design fragmentation
5. **Database-Level Security**: RLS policies enforced at PostgreSQL level

**Learn More**: [Architectural Principles](docs/1-vision/architectural-principles.md)

---

## 🧪 Testing

### Run Tests Locally

```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e

# RLS policy tests
npm run test:rls
```

### Test Multi-City Isolation

```sql
-- In Supabase Studio SQL Editor
SET ROLE authenticated;
SET request.jwt.claims.sub TO 'adelaide-user-id';
SELECT * FROM events;  -- Should only see Adelaide events
```

**See**: [Testing Strategy](docs/5-implementation/implementation-guide.md#testing-strategy)

---

## 🚢 Deployment

### Production Deployment to Vercel + Supabase

1. **Vercel Setup**: Use "Deploy to Vercel" button or manual deployment
2. **Supabase Project**: Create production Supabase project
3. **Environment Variables**: Set in Vercel dashboard
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```
4. **Run Migrations**: Automatic via Vercel build
5. **Complete Setup**: Visit `/setup` on deployed site

**See**: [Production Deployment Guide](docs/5-implementation/implementation-guide.md#production-deployment)

---

## 🌍 Global Impact Vision

### Phase 1 Focus: Prove the Model with FaithTech Australia

Launching with Brisbane, Sydney, Melbourne - proving the multi-city model works. Success in Phase 1 means:
- Platform works reliably for Australia's cities
- Codebase is clean and contributor-friendly
- City admins can manage their communities effectively

### Phase 2: Build the Contributor Ecosystem

Once Australia proves the model works:
- Launch plugin SDK (`@faithtech/sdk` and `npx create-faithtech-plugin`)
- Attract global FaithTech developers to contribute features
- Create thriving community of plugin builders
- **Goal**: Quality ecosystem over quantity of deployments

### Phase 3 Vision: Global Adoption Follows Naturally

With a proven platform and thriving ecosystem:
- FaithTech USA, UK, Africa, Asia deploy their regional hubs
- Plugins built in one region benefit all regions worldwide
- Platform becomes self-sustaining through community contributions
- Other faith-tech organizations adopt the model

**The Vision**: Build a proven foundation first, attract contributors second, enable global adoption third. Quality and sustainability over rapid expansion.

---

## 📞 Support & Community

- **Documentation Issues**: Open issue in this repo
- **Bug Reports**: [GitHub Issues](https://github.com/faithtech/regional-hub/issues)
- **Feature Requests**: [GitHub Discussions](https://github.com/faithtech/regional-hub/discussions)
- **Questions**: FaithTech Slack (see [CLAUDE.md](CLAUDE.md) for invite)

---

## ⚖️ License

This project is licensed under the **MIT License**.

**In Plain English**: You're free to use, modify, and deploy this for your FaithTech community (or any faith-tech community). We only ask that you contribute improvements back to help the global network.

---

## 🙏 Acknowledgments

Built with love by the FaithTech community for the global Church. Started by the FaithTech Sydney Community.

**Core Philosophy**: 1 Corinthians 3:10-11

Let's build something worthy of the mission. 🚀

---

## 📋 Quick Reference

| What | Where |
|------|-------|
| **Start Here** | [docs/00-START-HERE.md](docs/00-START-HERE.md) |
| **Full Documentation** | [docs/README.md](docs/README.md) |
| **Setup Guide** | [docs/5-implementation/implementation-guide.md](docs/5-implementation/implementation-guide.md) |
| **Contributing** | [docs/7-contributing/contributing-guide.md](docs/7-contributing/contributing-guide.md) |
| **Architecture** | [docs/1-vision/architectural-principles.md](docs/1-vision/architectural-principles.md) |
| **Roadmap** | [docs/1-vision/phased-roadmap.md](docs/1-vision/phased-roadmap.md) |
| **Feature Specs** | [docs/3-features/](docs/3-features/) |
| **Report Issues** | [GitHub Issues](https://github.com/faithtech/regional-hub/issues) |
