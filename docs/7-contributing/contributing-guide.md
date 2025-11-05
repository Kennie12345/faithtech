# Contributing Guide

**Last Updated:** 2025-11-05

Welcome! We're excited you want to contribute to the FaithTech Regional Hub platform.

---

## Two Ways to Contribute

### 1. Improve Core Features (This Repo)

**For:** Fixing bugs, enhancing existing features

**Examples:**
- Fix a bug in Events feature
- Improve RLS policy performance
- Add tests for Blog feature
- Improve documentation

**Process:**
1. Fork this repository
2. Create feature branch: `git checkout -b fix/events-rsvp-bug`
3. Make changes
4. Write tests
5. Submit PR

---

### 2. Build Plugins (Phase 2+)

**For:** Adding new features

**Examples:**
- Build a Forum plugin
- Build a Proximity Chat plugin
- Build an Analytics Dashboard

**Process:**
1. Wait for Phase 2 (plugin SDK must be ready first)
2. Use `npx create-faithtech-plugin`
3. Build using `@faithtech/sdk`
4. Submit to marketplace repo

---

## Local Development Setup

See [../5-implementation/implementation-guide.md](../5-implementation/implementation-guide.md#local-development-setup)

---

## Code Standards

### TypeScript
- Use TypeScript (not JavaScript)
- Enable strict mode
- Avoid `any` type

### React
- Prefer Server Components
- Only use Client Components when needed (`useState`, `useEffect`, event handlers)
- Use `"use client"` directive explicitly

### Database
- All tables must have `city_id` foreign key
- Always enable RLS
- Include indexes on foreign keys

### Testing
- Write tests for new features
- Test RLS policies
- Test multi-city isolation

---

## PR Guidelines

**Before submitting:**
- [ ] Code follows style guide
- [ ] Tests pass (`npm test`)
- [ ] Linting passes (`npm run lint`)
- [ ] Documentation updated (if needed)
- [ ] RLS policies tested (if database changes)

**PR Title:** Use conventional commits
- `fix: Resolve RSVP button not working`
- `feat: Add event capacity limits`
- `docs: Update migration guide`

**PR Description:** Include:
- What changed
- Why it changed
- How to test

---

## Code Review Process

1. **Submit PR** to `main` branch
2. **Automated checks** run (linting, tests)
3. **Manual review** by core team (1-2 days)
4. **Feedback** addressed
5. **Merged** when approved

---

## Community Guidelines

- Be respectful and inclusive
- Assume good intent
- Provide constructive feedback
- Help onboard new contributors

---

## Recognition

Contributors are credited in:
- README.md contributors section
- Release notes
- Annual FaithTech showcase

---

## Questions?

- **GitHub Issues:** For bugs, feature requests
- **GitHub Discussions:** For questions, ideas
- **FaithTech Slack:** For real-time chat (check CLAUDE.md for invite link)

---

## Product Backlog

**High Priority (Phase 1):**
- [ ] Complete Events feature
- [ ] Complete Projects feature
- [ ] Complete Blog feature
- [ ] Complete Newsletter feature

**Medium Priority (Phase 1):**
- [ ] Add event capacity limits
- [ ] Add project approval workflow
- [ ] Add blog post scheduling

**Low Priority (Phase 2):**
- [ ] Build plugin SDK
- [ ] Extract features to plugins
- [ ] Create plugin marketplace

---

**Thank you for contributing to FaithTech! 🙏**
