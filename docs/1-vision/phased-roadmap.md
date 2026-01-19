# Phased Roadmap: From Launch to Global Ecosystem

**Document Type:** Strategic
**Stability Level:** Stable (milestones), Semi-Stable (dates)
**Last Updated:** 2025-11-05

---

## Overview

This roadmap outlines the 3-phase evolution of the FaithTech Regional Hub platform:

1. **Phase 1:** Launch FaithTech Australia with core features
2. **Phase 2:** Build plugin ecosystem for global contribution
3. **Phase 3:** Scale to 10+ regions, thriving marketplace

---

## Phase 1: The Foundation Stone ✅ COMPLETE

**Goal:** Prove the concept with a working multi-city hub for FaithTech Australia

**Status:** All milestones complete! Ready to deploy.

### Phase 1 Milestone A: Core Infrastructure
- ✅ **Database:** Multi-tenant schema (cities, users, groups)
- ✅ **Auth:** Supabase SSR authentication flow
- ✅ **Security:** RLS policies for city isolation
- ✅ **API:** CoreAPI + Event Bus

**Deliverable:** Working admin panel, users can sign up and join cities

---

### Phase 1 Milestone B: Core Features
- ✅ **Events:** Create events, RSVP, calendar
- ✅ **Projects:** Showcase CREATE projects
- ✅ **Blog:** SEO-ready Markdown blog

**Deliverable:** City admins can create content, public can view it

---

### Phase 1 Milestone C: Polish & Launch ✅ COMPLETE
- ✅ **Newsletter:** Subscribe form, CSV export
- ✅ **Admin UI:** City settings, feature toggles
- ✅ **Homepage:** Public-facing hero, featured content, feature toggles
- ✅ **Deploy:** Production deployment guide complete (SETUP.md)

**Deliverable:** 🚀 FaithTech Australia ready to launch with 3+ cities (Adelaide, Sydney, Melbourne)

---

### Phase 1 Success Criteria

- [ ] FaithTech Australia goes live
- [ ] 3+ cities operational (Adelaide, Sydney, Melbourne)
- [ ] City admins can create events, projects, blog posts
- [ ] Members can RSVP, view content
- [ ] Zero critical bugs in first deployment cycle

---

## Phase 2: The Plugin Ecosystem

**Goal:** Enable global developers to contribute features safely

### Phase 2 Milestone A: Extract & Prove

**Milestone A.1: Extract Events to Plugin**
- Extract Events feature as proof-of-concept plugin
- Plugin runs in isolated environment (Error Boundary)
- Prove the extraction pattern works

**Milestone A.2: Build @faithtech/sdk**
- Create `@faithtech/sdk` NPM package
- CoreAPI, Event Bus, UI components exposed
- Type-safe plugin contracts

**Deliverable:** One working runtime plugin (Events), SDK published

---

### Phase 2 Milestone B: Developer Experience

**Milestone B.1: Create Plugin CLI**
- `npx create-faithtech-plugin` scaffolds new plugin
- Template includes boilerplate (manifest, RLS, actions, UI)
- Developer can build plugin without understanding core

**Milestone B.2: Build Plugin Marketplace**
- GitHub repo: `faithtech-starter-marketplace`
- JSON index of vetted plugins
- Automated vetting pipeline (linting, security checks)

**Deliverable:** Developers can scaffold + submit plugins, marketplace live

---

### Phase 2 Milestone C: First Community Plugins

**Milestone C.1: Vet 3-5 Community Plugins**
- Solicit plugins from Australian FaithTech developers
- Review, vet, and approve
- Add to marketplace

**Milestone C.2: Schema-per-Plugin Migration** _(Optional)_
- Migrate from table-level RLS to schema-per-plugin (if security audit recommends)
- Update documentation

**Deliverable:** 5+ vetted plugins available, ecosystem forming

---

### Phase 2 Success Criteria

- [ ] @faithtech/sdk published on NPM
- [ ] `npx create-faithtech-plugin` CLI works
- [ ] Plugin marketplace live with 5+ plugins
- [ ] 2+ plugins built by community (not core team)
- [ ] Events feature successfully extracted to plugin
- [ ] Documentation updated for plugin development

---

## Phase 3: Global Scale

**Goal:** 10+ FaithTech regions deploy, thriving plugin ecosystem

### Phase 3 Milestone A: Regional Adoption

**Milestone A.1: 3 Regions Deploy**
- FaithTech USA deploys
- FaithTech UK deploys
- FaithTech [Africa region] deploys

**Activities:**
- Provide onboarding support
- Collect feedback on deployment process
- Fix bugs, improve documentation
- Improve one-click deploy experience

**Deliverable:** 3 regions live, deployment process refined

---

### Phase 3 Milestone B: Marketplace Growth

**Milestone B.1: 20+ Plugins Available**
- Advanced plugins: Forum, Proximity Chat, Social Auto-Poster
- Integration plugins: Circle, Slack, Mailchimp (official)
- Analytics dashboard plugin
- Layout marketplace (custom homepage designs)

**Activities:**
- Developer outreach (blog posts, talks at FaithTech events)
- Plugin bounties (incentivize contributions)
- Plugin documentation improvements

**Deliverable:** 20+ plugins, vibrant contributor community

---

### Phase 3 Milestone C: Platform Maturity

**Milestone C.1: 10+ Regions, Self-Sustaining**
- 10+ FaithTech regions using the platform
- Community maintains core (not just original team)
- Regional customization (language support, localization)

**Activities:**
- Governance model (who approves PRs, plugin vetting)
- Community events (plugin showcases, hackathons)
- Case studies (how cities are using the platform)

**Deliverable:** Platform is self-sustaining, FaithTech standard infrastructure

---

### Phase 3 Success Criteria

- [ ] 10+ FaithTech regions deployed
- [ ] 20+ plugins in marketplace
- [ ] 10+ community contributors (non-core team)
- [ ] Platform adopted as "FaithTech standard"
- [ ] Other faith-tech orgs interested (non-FaithTech)

---

## Phase Progression Overview

```
Phase 1: Foundation Stone
  ├─► Milestone A: Core Infrastructure
  ├─► Milestone B: Core Features
  └─► Milestone C: Polish & Launch
  ✅ Success: FaithTech Australia live

Phase 2: Plugin Ecosystem
  ├─► Milestone A: Extract & Prove (Events plugin, SDK)
  ├─► Milestone B: Developer Experience (CLI, marketplace)
  └─► Milestone C: First Community Plugins
  ✅ Success: 5+ plugins, thriving ecosystem

Phase 3: Global Scale
  ├─► Milestone A: Regional Adoption (3 regions)
  ├─► Milestone B: Marketplace Growth (20+ plugins)
  └─► Milestone C: Platform Maturity (10+ regions)
  ✅ Success: Self-sustaining platform
```

---

## Key Metrics to Track

| Metric | Phase 1 Target | Phase 2 Target | Phase 3 Target |
|--------|----------------|----------------|----------------|
| **Regions Deployed** | 1 (Australia) | 1 (still Australia) | 10+ |
| **Cities Active** | 3+ | 3+ | 30+ |
| **Plugins Available** | 0 (features built-in) | 5+ | 20+ |
| **Community Contributors** | 0 | 2-3 | 10+ |
| **Weekly Active Users** | 50+ (Australia) | 50+ | 500+ |

---

## Risk Mitigation

### Phase 1 Risks

**Risk:** "We don't ship Phase 1 in a focused sprint"
**Mitigation:** Strict scope control, defer non-essentials

**Risk:** "Multi-tenancy is too complex"
**Mitigation:** RLS is proven pattern, Supabase docs + examples exist

---

### Phase 2 Risks

**Risk:** "Plugin SDK is too hard to use"
**Mitigation:** Developer testing, clear docs, CLI scaffolding

**Risk:** "No one builds plugins"
**Mitigation:** Build 2-3 ourselves first (Forum, Proximity Chat), show it's possible

---

### Phase 3 Risks

**Risk:** "Regions fork instead of using official version"
**Mitigation:** Make official version SO GOOD they don't want to fork

**Risk:** "Maintenance burden overwhelms core team"
**Mitigation:** Community governance, shared maintenance model

---

## Decision Points

### After Phase 1 Launch

**Question:** Is the architecture viable?
**Decision:** Proceed to Phase 2 (extract plugins) OR refactor core (if major issues)

---

### After Phase 2 Milestone A

**Question:** Can we extract features to plugins?
**Decision:** If yes → Continue. If no → Revisit architecture.

---

### After Phase 2 Milestone C

**Question:** Are developers building plugins?
**Decision:** If yes → Scale to Phase 3. If no → Improve DevEx, rethink marketplace.

---

## Next Steps

**Right Now:**
1. Focus 100% on Phase 1
2. Ship FaithTech Australia
3. Validate the model works

**After Phase 1:**
1. Gather feedback from Australia team
2. Decide: Proceed to Phase 2 or iterate on Phase 1?
3. If proceeding: Start SDK design

**Don't Think About Phase 3 Yet:**
- It's too far out
- Assumptions will change
- Focus on shipping Australia first

---

**Remember:** "Stone Soup" strategy = Ship something compelling in Phase 1, attract contributors in Phase 2, scale in Phase 3.
