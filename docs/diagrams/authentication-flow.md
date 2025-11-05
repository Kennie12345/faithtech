# Authentication Flow: User Journey

**Document Type:** Visual Architecture
**Purpose:** Understand how users sign up, confirm email, and access protected areas
**Last Updated:** 2025-11-05

---

## Complete User Journey

```
┌─────────────────────────────────────────────────────────────────┐
│                    1. SIGN UP JOURNEY                           │
└─────────────────────────────────────────────────────────────────┘

User visits: /auth/sign-up

┌──────────┐
│ Browser  │
└────┬─────┘
     │ User fills form (email, password)
     ▼
┌──────────────────┐
│ SignUpForm.tsx   │ ("use client" - Client Component)
│ ──────────────── │
│ useState()       │
│ useRouter()      │
└────┬─────────────┘
     │ Calls: supabase.auth.signUp({ email, password })
     ▼
┌──────────────────┐
│ Supabase Auth    │ (External service)
│ ──────────────── │
│ Creates user in  │
│ auth.users table │
└────┬─────────────┘
     │ Sends confirmation email with token
     ▼
┌──────────────────┐
│  User's Email    │
│ ──────────────── │
│ Subject:         │
│ "Confirm email"  │
│ Link: /auth/     │
│ confirm?token=...│
└────┬─────────────┘
     │ User clicks link
     │
     │
┌─────────────────────────────────────────────────────────────────┐
│                  2. EMAIL CONFIRMATION                          │
└─────────────────────────────────────────────────────────────────┘

User clicks: /auth/confirm?token_hash=XXX&type=signup

     ▼
┌──────────────────┐
│ /auth/confirm    │ (Route Handler - Server-side)
│ route.ts         │
└────┬─────────────┘
     │ Extracts token from URL params
     ▼
┌──────────────────┐
│ Supabase Auth    │
│ .verifyOtp()     │
└────┬─────────────┘
     │ Token valid? → User confirmed
     ▼
┌──────────────────────┐
│ Create profile       │ (Server-side insert)
│ ──────────────────── │
│ INSERT INTO profiles │
│ (id, display_name)   │
│ VALUES (user.id, ...) │
└────┬─────────────────┘
     │
     ▼
┌──────────────────────┐
│ Emit event           │
│ events.emit(         │
│  'user:created',     │
│  { userId, email }   │
│ )                    │
└────┬─────────────────┘
     │
     ▼
┌──────────────────────┐
│ Redirect to          │
│ /protected           │
└──────────────────────┘


┌─────────────────────────────────────────────────────────────────┐
│                      3. LOGIN JOURNEY                           │
└─────────────────────────────────────────────────────────────────┘

User visits: /auth/login

┌──────────┐
│ Browser  │
└────┬─────┘
     │ User fills form (email, password)
     ▼
┌──────────────────┐
│ LoginForm.tsx    │ ("use client")
└────┬─────────────┘
     │ Calls: supabase.auth.signInWithPassword({ email, password })
     ▼
┌──────────────────┐
│ Supabase Auth    │
│ Validates creds  │
└────┬─────────────┘
     │ Returns session (JWT + refresh token)
     ▼
┌──────────────────┐
│ Browser Cookies  │ (httpOnly, secure)
│ ──────────────── │
│ sb-access-token  │
│ sb-refresh-token │
└────┬─────────────┘
     │ Redirect to /protected
     │
     │
┌─────────────────────────────────────────────────────────────────┐
│               4. ACCESSING PROTECTED ROUTES                     │
└─────────────────────────────────────────────────────────────────┘

User visits: /protected/admin/events

     ▼
┌──────────────────┐
│ middleware.ts    │ (Runs on EVERY request)
└────┬─────────────┘
     │ Calls: updateSession(request)
     ▼
┌────────────────────────┐
│ lib/supabase/          │
│ middleware.ts          │
│ ──────────────────────  │
│ 1. Read cookies        │
│ 2. Create Supabase     │
│    client with cookies │
│ 3. Call getUser()      │
│ 4. Refresh session     │
│    (extends expiry)    │
└────┬───────────────────┘
     │
     ├─ User authenticated? → Continue to page
     │
     └─ Not authenticated? → Redirect to /auth/login
     │
     ▼
┌──────────────────┐
│ Protected Page   │ (Server Component)
│ ──────────────── │
│ const supabase = │
│  await createClient()│
│                  │
│ const { user } = │
│  await supabase  │
│   .auth.getUser()│
│                  │
│ return <Dashboard│
│   user={user} /> │
└──────────────────┘


┌─────────────────────────────────────────────────────────────────┐
│                  5. SESSION MANAGEMENT                          │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────┐
│ Session Duration │
│ ──────────────── │
│ Access Token:    │
│   1 hour         │
│ Refresh Token:   │
│   7 days         │
└──────────────────┘

Every request:
  ├─► middleware.ts refreshes session
  ├─► Extends expiry automatically
  └─► User stays logged in (up to 7 days)

After 7 days:
  └─► Refresh token expires
      └─► User must log in again


┌─────────────────────────────────────────────────────────────────┐
│                  6. PASSWORD RESET JOURNEY                      │
└─────────────────────────────────────────────────────────────────┘

User visits: /auth/forgot-password

┌──────────┐
│ Browser  │
└────┬─────┘
     │ User enters email
     ▼
┌────────────────────────┐
│ ForgotPasswordForm.tsx │
└────┬───────────────────┘
     │ Calls: supabase.auth.resetPasswordForEmail(email)
     ▼
┌──────────────────┐
│ Supabase Auth    │
│ Sends reset email│
└────┬─────────────┘
     │ Email with link: /auth/update-password?token=...
     ▼
┌──────────────────┐
│  User's Email    │
└────┬─────────────┘
     │ User clicks link
     ▼
┌──────────────────┐
│ /auth/update-    │
│  password        │
└────┬─────────────┘
     │ User enters new password
     ▼
┌────────────────────────┐
│ UpdatePasswordForm.tsx │
└────┬───────────────────┘
     │ Calls: supabase.auth.updateUser({ password: newPassword })
     ▼
┌──────────────────┐
│ Supabase Auth    │
│ Updates password │
└────┬─────────────┘
     │
     ▼
┌──────────────────┐
│ Redirect to      │
│ /auth/login      │
└──────────────────┘


┌─────────────────────────────────────────────────────────────────┐
│                        7. LOGOUT                                │
└─────────────────────────────────────────────────────────────────┘

User clicks: Logout button

┌──────────────────┐
│ LogoutButton.tsx │
└────┬─────────────┘
     │ Calls: supabase.auth.signOut()
     ▼
┌──────────────────┐
│ Supabase Auth    │
│ Invalidates      │
│ session          │
└────┬─────────────┘
     │ Clears cookies
     ▼
┌──────────────────┐
│ Browser Cookies  │
│ (deleted)        │
└────┬─────────────┘
     │ Redirect to /
     ▼
┌──────────────────┐
│ Homepage         │
│ (logged out)     │
└──────────────────┘
```

---

## Key Security Mechanisms

### 1. **Cookie-Based Sessions (Not localStorage)**

**Why:** httpOnly cookies protect against XSS attacks

```typescript
// Middleware sets cookies automatically
const supabase = createServerClient(url, key, {
  cookies: {
    set(name, value, options) {
      response.cookies.set(name, value, {
        ...options,
        httpOnly: true,  // ⚡ JavaScript can't access
        secure: true,    // ⚡ HTTPS only
        sameSite: 'lax', // ⚡ CSRF protection
      });
    },
  },
});
```

### 2. **Per-Request Client Creation**

**Why:** Prevents session leakage in serverless environments

```typescript
// ✅ Correct: New client per request
export default async function Page() {
  const supabase = await createClient(); // Fresh client
  const { data: { user } } = await supabase.auth.getUser();
  return <div>{user.email}</div>;
}

// ❌ Wrong: Global client (session leak!)
const supabase = await createClient(); // DON'T DO THIS
export default async function Page() {
  const { data: { user } } = await supabase.auth.getUser();
  return <div>{user.email}</div>;
}
```

### 3. **Middleware Session Refresh**

**Why:** Extends session automatically on every request

```typescript
// middleware.ts runs on EVERY request
export async function middleware(request: NextRequest) {
  return await updateSession(request); // Refreshes session
}
```

**Result:** User stays logged in as long as they visit within 7 days

---

## Multi-Tab Behavior

**Scenario:** User has 3 tabs open

```
Tab 1: /protected/admin/events
Tab 2: /protected/admin/blog
Tab 3: /adelaide/events (public)

User logs out in Tab 1:
  ├─► supabase.auth.signOut() called
  ├─► Cookies cleared
  ├─► Supabase syncs via localStorage broadcast
  └─► All tabs receive logout event
      ├─► Tab 2: Redirects to /auth/login
      └─► Tab 3: No change (public page)
```

---

## Three Supabase Clients

### 1. **Client-Side** (`lib/supabase/client.ts`)

**When:** Client Components (`"use client"`)

```typescript
import { createClient } from '@/lib/supabase/client';

export default function LoginForm() {
  const supabase = createClient();
  // Use in forms, interactive UI
}
```

### 2. **Server-Side** (`lib/supabase/server.ts`)

**When:** Server Components, Route Handlers

```typescript
import { createClient } from '@/lib/supabase/server';

export default async function Page() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return <div>{user.email}</div>;
}
```

### 3. **Middleware** (`lib/supabase/middleware.ts`)

**When:** Middleware only (session refresh)

```typescript
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}
```

---

## Session Storage Comparison

| Method | Security | SSR Compatible | Multi-Tab Sync |
|--------|----------|----------------|----------------|
| **Cookies (our choice)** | ✅ httpOnly protects from XSS | ✅ Yes | ✅ Yes (via localStorage broadcast) |
| localStorage | ❌ Vulnerable to XSS | ❌ No (client-side only) | ✅ Yes |
| sessionStorage | ❌ Vulnerable to XSS | ❌ No | ❌ No |

**Decision:** Cookies for security + SSR compatibility

---

## Next Steps

- **For detailed implementation:** See [../2-core-architecture/user-authentication-supabase.md](../2-core-architecture/user-authentication-supabase.md)
- **For RLS policies:** See [../2-core-architecture/authorization-rls-policies.md](../2-core-architecture/authorization-rls-policies.md)
- **For system architecture:** See [system-architecture.md](system-architecture.md)
