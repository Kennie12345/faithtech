# Implementation Guide: Build, Test, Deploy

**Last Updated:** 2025-11-05

This document consolidates local development setup, testing strategy, and deployment guide.

---

## Local Development Setup

### Prerequisites
- Node.js 18+
- Supabase CLI
- Git

### Steps

1. **Clone repository:**
```bash
git clone https://github.com/faithtech/regional-hub.git
cd regional-hub
```

2. **Install dependencies:**
```bash
npm install
```

3. **Start local Supabase:**
```bash
supabase start
```

4. **Apply migrations:**
```bash
supabase db reset
```

5. **Configure environment:**
```bash
cp .env.example .env.local
# Edit .env.local with Supabase credentials from `supabase start` output
```

6. **Run development server:**
```bash
npm run dev
```

Visit: http://localhost:3000

---

## Testing Strategy

### Unit Tests
Test utility functions, CoreAPI methods

```typescript
// Example
test('CoreAPI.isAdmin returns true for city admin', async () => {
  const isAdmin = await CoreAPI.isAdmin(cityId);
  expect(isAdmin).toBe(true);
});
```

### RLS Tests
Test row-level security policies

```sql
-- Test city isolation
SET ROLE authenticated;
SET request.jwt.claims.sub TO 'adelaide-user-id';
SELECT * FROM events;  -- Should only see Adelaide events
```

### E2E Tests
Test critical user journeys

```typescript
test('User can signup → login → RSVP to event', async () => {
  // Signup
  await page.goto('/auth/sign-up');
  await page.fill('[name=email]', 'test@example.com');
  // ... continue journey
});
```

---

## Production Deployment

### Vercel + Supabase

1. **Create Supabase project:**
   - Go to supabase.com
   - Create new project
   - Note URL and anon key

2. **Deploy to Vercel:**
   - Click "Deploy to Vercel" button in README
   - Connect GitHub repository
   - Set environment variables:
     ```
     NEXT_PUBLIC_SUPABASE_URL=...
     NEXT_PUBLIC_SUPABASE_ANON_KEY=...
     ```

3. **Run migrations:**
   ```bash
   # Vercel build automatically runs:
   supabase db push
   ```

4. **Verify deployment:**
   - Visit Vercel URL
   - Complete `/setup` flow
   - Create first city

---

## Phased Implementation Plan

### Phase 1: Core Foundation
- Database migrations
- RLS policies
- Auth flow, CoreAPI

**Deliverable:** Admin can create cities

### Phase 2: Features
- Events (parallel with Projects, Blog)
- Feature polish and integration

**Deliverable:** Features working

### Phase 3: Launch
- Newsletter
- Homepage
- Deploy, test, launch

**Deliverable:** FaithTech Australia live! 🚀

---

**For detailed diagrams:** See [../diagrams/implementation-dependencies.md](../diagrams/implementation-dependencies.md)
