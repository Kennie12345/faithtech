# FaithTech Regional Hub - Local Setup Guide

This guide will help you set up the FaithTech Regional Hub locally with Supabase and test the Events feature (Phase 2 Track A).

## Prerequisites

Before starting, ensure you have:

- **Node.js 18+** installed
- **Docker Desktop** installed and running
- **Supabase CLI** installed

### Install Supabase CLI

```bash
# macOS
brew install supabase/tap/supabase

# Or via npm
npm install -g supabase
```

Verify installation:
```bash
supabase --version
```

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Start Local Supabase

Make sure Docker Desktop is running, then:

```bash
supabase start
```

This will:
- Pull Docker images (first time only, ~2-3 minutes)
- Start PostgreSQL, PostgREST, Auth, Storage, and more
- Apply all migrations from `supabase/migrations/`
- Run seed data from `supabase/seed.sql`

**Expected output:**
```
Started supabase local development setup.

         API URL: http://localhost:54321
          DB URL: postgresql://postgres:postgres@localhost:54322/postgres
      Studio URL: http://localhost:54323
    Inbucket URL: http://localhost:54324
      JWT secret: super-secret-jwt-token-with-at-least-32-characters-long
        anon key: eyJhbGc...
service_role key: eyJhbGc...
```

**Save the `anon key` and `API URL` - you'll need these next!**

## Step 3: Configure Environment Variables

Create `.env.local` in the project root:

```bash
cp .env.example .env.local
```

Edit `.env.local` with the values from `supabase start`:

```env
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-anon-key-from-supabase-start
```

## Step 4: Verify Database Setup

Open Supabase Studio in your browser:
```
http://localhost:54323
```

### Check Tables

Go to **Table Editor** and verify these tables exist:
- ✅ `cities` (3 rows: Adelaide, Sydney, Melbourne)
- ✅ `profiles`
- ✅ `user_city_roles`
- ✅ `groups` (4 rows)
- ✅ `events` (5 rows) ← **NEW in Phase 2**
- ✅ `event_rsvps` ← **NEW in Phase 2**

### Check Migrations

Go to **Database** → **Migrations** and verify:
- 001-008 (Phase 1)
- **009-012 (Phase 2 - Events)** ← Should show as applied

### Check Sample Events

Go to **SQL Editor** and run:

```sql
SELECT
  e.title,
  e.slug,
  e.starts_at,
  c.name as city_name
FROM events e
JOIN cities c ON c.id = e.city_id
ORDER BY e.starts_at DESC;
```

You should see 5 events:
- **Adelaide**: Community Meetup, Web Development Workshop, Launch Event (past)
- **Sydney**: Prayer & Worship Night
- **Melbourne**: AI & Ethics Roundtable

## Step 5: Create Test Users

You need test users to test the Events feature. Go to **Authentication** → **Users** → **Add User**:

### Create These Users:

| Email | Password | Role | City |
|-------|----------|------|------|
| `admin@adelaide.faithtech.com` | `TestAdmin123!` | City Admin | Adelaide |
| `member@adelaide.faithtech.com` | `TestMember123!` | Member | Adelaide |
| `admin@sydney.faithtech.com` | `TestAdmin123!` | City Admin | Sydney |

After creating each user, note their **UUID** (you'll see it in the table).

### Assign User Roles

Go to **SQL Editor** and run this for each user (replace UUIDs):

```sql
-- Admin for Adelaide
INSERT INTO profiles (id, display_name, bio)
VALUES ('PASTE-ADELAIDE-ADMIN-UUID', 'Adelaide Admin', 'City admin for Adelaide');

INSERT INTO user_city_roles (user_id, city_id, role)
VALUES ('PASTE-ADELAIDE-ADMIN-UUID', 'c1111111-1111-1111-1111-111111111111', 'city_admin');

-- Member for Adelaide
INSERT INTO profiles (id, display_name, bio)
VALUES ('PASTE-ADELAIDE-MEMBER-UUID', 'Test Member', 'Regular member');

INSERT INTO user_city_roles (user_id, city_id, role)
VALUES ('PASTE-ADELAIDE-MEMBER-UUID', 'c1111111-1111-1111-1111-111111111111', 'member');

-- Admin for Sydney
INSERT INTO profiles (id, display_name, bio)
VALUES ('PASTE-SYDNEY-ADMIN-UUID', 'Sydney Admin', 'City admin for Sydney');

INSERT INTO user_city_roles (user_id, city_id, role)
VALUES ('PASTE-SYDNEY-ADMIN-UUID', 'c2222222-2222-2222-2222-222222222222', 'city_admin');
```

## Step 6: Set City Context (Important!)

Before users can query data, they need a city context. Run this in **SQL Editor**:

```sql
-- Set default city context for Adelaide admin
-- (You'll need to do this in the application code for production)
-- For now, we'll test via SQL
SELECT set_city_context('c1111111-1111-1111-1111-111111111111');
```

## Step 7: Start the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Step 8: Test the Events Feature

### Test Admin Interface

1. **Sign In** as Adelaide admin: `admin@adelaide.faithtech.com` / `TestAdmin123!`

2. Go to **Admin Events**: [http://localhost:3000/protected/admin/events](http://localhost:3000/protected/admin/events)
   - You should see 2 upcoming events and 1 past event for Adelaide
   - Click "Create Event" to test event creation
   - Click "Manage Event" to test editing and viewing RSVPs

3. **Create a Test Event**:
   - Title: "Test Meetup"
   - Description: "This is a test event"
   - Start Date: Tomorrow at 6 PM
   - Location Name: "Test Church"
   - Max Attendees: 20
   - Click "Create Event"

4. **Test City Isolation**:
   - Sign in as Sydney admin: `admin@sydney.faithtech.com`
   - Go to admin events - you should only see Sydney events (not Adelaide)

### Test Public Interface

1. **View Public Events**: [http://localhost:3000/adelaide/events](http://localhost:3000/adelaide/events)
   - Should show upcoming Adelaide events
   - Click on an event to see details

2. **Test RSVP Flow**:
   - Sign in as Adelaide member: `member@adelaide.faithtech.com`
   - Go to an event detail page
   - Click "Going" button
   - Refresh the page - you should see "Your RSVP: ✓ Attending"
   - Try changing to "Maybe" or "Can't Go"

3. **Test Capacity**:
   - Create an event with max_attendees = 1
   - RSVP as first user (should work)
   - Sign in as different user and try to RSVP (should see "At Capacity")

### Test RLS Policies

Go to **SQL Editor** in Supabase Studio and test:

```sql
-- Test 1: Authenticated user sees only their city's events
SET ROLE authenticated;
SET request.jwt.claims.sub TO 'ADELAIDE-MEMBER-UUID';
SELECT set_city_context('c1111111-1111-1111-1111-111111111111');
SELECT * FROM events; -- Should only see Adelaide events (3 rows)

-- Test 2: User can RSVP to events in their city
INSERT INTO event_rsvps (event_id, user_id, status)
VALUES ('e1111111-1111-1111-1111-111111111111', 'ADELAIDE-MEMBER-UUID', 'yes');
-- Should succeed

-- Test 3: User CANNOT RSVP to events in other cities
INSERT INTO event_rsvps (event_id, user_id, status)
VALUES ('e2222221-2222-2222-2222-222222222222', 'ADELAIDE-MEMBER-UUID', 'yes');
-- Should fail (Sydney event)

-- Test 4: Members cannot create events
INSERT INTO events (city_id, title, slug, starts_at)
VALUES ('c1111111-1111-1111-1111-111111111111', 'Unauthorized Event', 'unauthorized', NOW());
-- Should fail (members can't create)

-- Reset
RESET ROLE;
```

## Step 9: View Event Bus Logs

Event Bus emissions are logged to the console. Check your terminal running `npm run dev`:

```
Events feature: event:created { eventId: '...', cityId: '...', createdBy: '...' }
Events feature: event:rsvp_added { eventId: '...', userId: '...', status: 'yes' }
```

## Troubleshooting

### Issue: "Cannot connect to Docker daemon"
**Solution**: Make sure Docker Desktop is running

### Issue: "Migration failed"
**Solution**:
```bash
supabase db reset  # Resets and reapplies all migrations
```

### Issue: "No city context"
**Solution**: Make sure you've assigned users to cities via `user_city_roles` table

### Issue: Events not showing in admin panel
**Solution**:
1. Check that user has `city_admin` role
2. Verify city_id matches in `events` and `user_city_roles` tables
3. Check browser console for errors

### Issue: RLS policy blocking queries
**Solution**: Run this to check your role:
```sql
SELECT auth.user_role('c1111111-1111-1111-1111-111111111111');
```

## Next Steps

✅ **Phase 2 Track A (Events) is complete!**

Ready to continue? Next tracks:

- **Track B: Projects** - Showcase community projects
- **Track C: Blog** - Markdown blog with SEO
- **Track D: Newsletter** - Subscriber management

---

## Production Deployment

Follow these steps to deploy the FaithTech Regional Hub to production.

### Prerequisites

- A [Supabase](https://supabase.com) account (free tier works)
- A [Vercel](https://vercel.com) account (free tier works)
- [Supabase CLI](https://supabase.com/docs/guides/cli) installed

### Step 1: Create Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Click "New Project"
3. Choose your organization and enter:
   - **Name:** `faithtech-[your-region]` (e.g., `faithtech-australia`)
   - **Database Password:** Generate a strong password and save it
   - **Region:** Choose closest to your users
4. Wait for the project to be created (~2 minutes)

### Step 2: Configure Supabase

1. In your Supabase project, go to **Settings** → **API**
2. Note these values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon/public key** (under "Project API keys")
   - **service_role key** (under "Project API keys" - keep this secret!)

3. Go to **Settings** → **General** and note:
   - **Reference ID** (e.g., `xxxxx`)

### Step 3: Apply Database Migrations

Connect to your Supabase project and push migrations:

```bash
# Link to your Supabase project
supabase link --project-ref YOUR_PROJECT_REF

# Push all migrations
supabase db push
```

This will create all required tables, RLS policies, and functions.

### Step 4: Configure Authentication

1. In Supabase, go to **Authentication** → **Providers**
2. Ensure **Email** provider is enabled
3. (Optional) Configure OAuth providers (Google, GitHub, etc.)

4. Go to **Authentication** → **URL Configuration**
5. Add your production URL to:
   - **Site URL:** `https://your-domain.com`
   - **Redirect URLs:** `https://your-domain.com/**`

### Step 5: Deploy to Vercel

1. Push your code to a GitHub repository

2. Go to [Vercel Dashboard](https://vercel.com/dashboard)

3. Click "Add New..." → "Project"

4. Import your GitHub repository

5. Configure environment variables:

   | Variable | Value |
   |----------|-------|
   | `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase Project URL |
   | `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Your Supabase anon/public key |
   | `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase service_role key |

6. Click "Deploy"

### Step 6: Configure Custom Domain (Optional)

1. In Vercel, go to your project → **Settings** → **Domains**
2. Add your custom domain
3. Follow DNS configuration instructions
4. Update Supabase redirect URLs with your custom domain

### Step 7: Seed Initial Data

After deployment, you'll need to create initial cities and admin users:

1. Go to Supabase **SQL Editor**
2. Run migration 020 manually if cities weren't seeded:

```sql
-- Check if cities exist
SELECT * FROM cities;
```

3. Create your first admin user:
   - Sign up through the app at `/auth/sign-up`
   - In Supabase **SQL Editor**, assign admin role:

```sql
-- Get the user ID from auth.users
SELECT id, email FROM auth.users;

-- Create profile
INSERT INTO profiles (id, display_name)
VALUES ('USER_ID_HERE', 'Admin Name');

-- Assign as city admin
INSERT INTO user_city_roles (user_id, city_id, role)
SELECT 'USER_ID_HERE', id, 'city_admin'
FROM cities
WHERE slug = 'YOUR_CITY_SLUG';
```

### Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Yes | Supabase anon key (public) |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role key (for newsletter) |

### Post-Deployment Checklist

- [ ] Verify authentication flow works (sign up, login, logout)
- [ ] Verify admin can create events, projects, blog posts
- [ ] Verify public pages display content correctly
- [ ] Verify newsletter subscription works
- [ ] Configure email templates in Supabase (optional)
- [ ] Set up monitoring and error tracking (optional)

---

## Useful Commands

```bash
# Check Supabase status
supabase status

# Stop Supabase
supabase stop

# Reset database (reapply all migrations + seed)
supabase db reset

# Create new migration
supabase migration new migration_name

# Generate TypeScript types from database
supabase gen types typescript --local > lib/database.types.ts
```

## Documentation

- [Supabase Local Development](https://supabase.com/docs/guides/cli/local-development)
- [Next.js + Supabase Auth](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Project Documentation](./docs/README.md)

---

**Happy coding! 🎉** If you run into issues, check the documentation or open an issue on GitHub.
