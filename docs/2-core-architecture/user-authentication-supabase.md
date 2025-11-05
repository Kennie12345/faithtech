# Authentication: Supabase Auth SSR Pattern

**Document Type:** Core (Stable)
**Stability Level:** Stable
**Audience:** Engineers implementing auth
**Last Updated:** 2025-11-05
**Dependencies:** [01-data-model.md](01-data-model.md)

---

## Purpose

This document defines how authentication works using Supabase Auth with Server-Side Rendering (SSR) in Next.js 15.

**Scope:** User sign-up, login, session management, protected routes

**Out of Scope:** Authorization/permissions (see [03-authorization.md](03-authorization.md))

---

## Architecture Overview

We use **Supabase Auth with cookie-based sessions** for SSR compatibility.

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │ 1. Login form submitted
       ▼
┌─────────────────────┐
│  Next.js Client     │
│  (Client Component) │
└──────┬──────────────┘
       │ 2. supabase.auth.signInWithPassword()
       ▼
┌──────────────────────┐
│  Supabase Auth API   │
└──────┬───────────────┘
       │ 3. Returns session + JWT
       ▼
┌──────────────────────┐
│  Browser (Cookies)   │  ← Session stored in httpOnly cookies
└──────────────────────┘

On subsequent requests:

┌─────────────┐
│   Browser   │ Sends cookies
└──────┬──────┘
       ▼
┌─────────────────────┐
│  Middleware         │ Refreshes session
│  (middleware.ts)    │
└──────┬──────────────┘
       │ Valid session?
       ▼
┌─────────────────────┐
│  Server Component   │ Renders protected content
└─────────────────────┘
```

---

## Implementation

### 1. Supabase Client Initialization

We need **THREE separate client instances** for different contexts:

#### **Client-Side Client** (`lib/supabase/client.ts`)

Used in Client Components (forms, interactive UI).

```typescript
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

**Usage:**
```typescript
'use client';
import { createClient } from '@/lib/supabase/client';

export default function LoginForm() {
  const supabase = createClient();

  async function handleLogin() {
    const { error } = await supabase.auth.signInWithPassword({
      email, password
    });
  }

  return <form>...</form>;
}
```

---

#### **Server-Side Client** (`lib/supabase/server.ts`)

Used in Server Components and Route Handlers.

```typescript
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );
}
```

**⚠️ CRITICAL:** Always create a new client per request. Never use global variables.

```typescript
// ✅ Correct
export default async function ProtectedPage() {
  const supabase = await createClient(); // New client per request
  const { data: { user } } = await supabase.auth.getUser();
  return <div>Hello {user.email}</div>;
}

// ❌ Wrong - NEVER do this
const supabase = await createClient(); // Global variable = session leak!
export default async function ProtectedPage() {
  const { data: { user } } = await supabase.auth.getUser();
  return <div>Hello {user.email}</div>;
}
```

---

#### **Middleware Client** (`lib/supabase/middleware.ts`)

Used in Next.js middleware to refresh sessions on every request.

```typescript
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session (extends expiry)
  const { data: { user } } = await supabase.auth.getUser();

  // If no user and accessing protected route, redirect to login
  if (!user && request.nextUrl.pathname.startsWith('/protected')) {
    const url = request.nextUrl.clone();
    url.pathname = '/auth/login';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
```

**Root Middleware** (`middleware.ts`):
```typescript
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
```

---

### 2. User Lifecycle

#### **Sign Up**

```typescript
'use client';
import { createClient } from '@/lib/supabase/client';

export default function SignUpForm() {
  const supabase = createClient();

  async function handleSignUp(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${location.origin}/auth/confirm`,
      },
    });

    if (error) {
      console.error('Sign up error:', error);
      return;
    }

    // User created, but email confirmation pending
    alert('Check your email for confirmation link');
  }

  return <form>...</form>;
}
```

**Flow:**
1. User submits form
2. Supabase sends confirmation email
3. User clicks link → redirects to `/auth/confirm?token=...`
4. Confirm route (below) verifies token
5. User redirected to protected area

---

#### **Email Confirmation** (`app/auth/confirm/route.ts`)

```typescript
import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type');

  if (token_hash && type) {
    const supabase = await createClient();

    const { error } = await supabase.auth.verifyOtp({
      type: type as any,
      token_hash,
    });

    if (!error) {
      // Create profile after successful confirmation
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from('profiles').insert({
        id: user!.id,
        display_name: user!.email?.split('@')[0], // Default name
      });

      return NextResponse.redirect(new URL('/protected', request.url));
    }
  }

  return NextResponse.redirect(new URL('/auth/error', request.url));
}
```

---

#### **Login**

```typescript
'use client';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function LoginForm() {
  const supabase = createClient();
  const router = useRouter();

  async function handleLogin(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
      return;
    }

    router.push('/protected');
    router.refresh(); // Force Server Component re-render
  }

  return <form>...</form>;
}
```

---

#### **Logout**

```typescript
'use client';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export function LogoutButton() {
  const supabase = createClient();
  const router = useRouter();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  }

  return <button onClick={handleLogout}>Logout</button>;
}
```

---

#### **Password Reset**

**Step 1: Request Reset** (`app/auth/forgot-password/page.tsx`)

```typescript
'use client';
import { createClient } from '@/lib/supabase/client';

export default function ForgotPasswordForm() {
  const supabase = createClient();

  async function handleReset(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${location.origin}/auth/update-password`,
    });

    if (!error) {
      alert('Check your email for reset link');
    }
  }

  return <form>...</form>;
}
```

**Step 2: Update Password** (`app/auth/update-password/page.tsx`)

```typescript
'use client';
import { createClient } from '@/lib/supabase/client';

export default function UpdatePasswordForm() {
  const supabase = createClient();

  async function handleUpdate(newPassword: string) {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (!error) {
      alert('Password updated successfully');
    }
  }

  return <form>...</form>;
}
```

---

### 3. Protected Routes

**Pattern 1: Middleware Redirect** (Recommended)

Middleware automatically redirects unauthenticated users trying to access `/protected/*`.

```typescript
// middleware.ts handles this automatically
// No additional code needed in protected pages
```

**Pattern 2: Server Component Check**

For fine-grained control:

```typescript
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function ProtectedPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  return <div>Hello {user.email}</div>;
}
```

---

### 4. Session Management

**Session Duration:**
- Default: 1 hour access token, 7 days refresh token
- Middleware refreshes on every request (extends expiry)

**Multi-Tab Behavior:**
- Supabase syncs session across tabs via `localStorage`
- Logout in one tab → all tabs logged out

**Session Storage:**
- Stored in httpOnly cookies (not accessible via JavaScript)
- Protects against XSS attacks

---

## Security Best Practices

1. **Never expose `service_role` key** - Only use `anon` key in client code
2. **Always use RLS** - Don't rely on client-side auth checks (see [03-authorization.md](03-authorization.md))
3. **HTTPS only** - Supabase requires HTTPS in production
4. **Email confirmation required** - Prevent fake signups
5. **Rate limiting** - Supabase has built-in rate limits on auth endpoints

---

## Atomic Implementation Units

### Unit 1: Client Initialization
- **Files:** `lib/supabase/client.ts`, `lib/supabase/server.ts`, `lib/supabase/middleware.ts`
- **Acceptance Criteria:**
  - ✅ All three clients created
  - ✅ Middleware refreshes sessions
  - ✅ Protected routes redirect unauthenticated users

### Unit 2: Sign Up Flow
- **Files:** `app/auth/sign-up/page.tsx`, `app/auth/confirm/route.ts`
- **Acceptance Criteria:**
  - ✅ User can sign up with email/password
  - ✅ Confirmation email sent
  - ✅ Token verification creates profile

### Unit 3: Login/Logout
- **Files:** `app/auth/login/page.tsx`, logout button component
- **Acceptance Criteria:**
  - ✅ User can log in
  - ✅ Redirects to /protected
  - ✅ Logout clears session

### Unit 4: Password Reset
- **Files:** `app/auth/forgot-password/page.tsx`, `app/auth/update-password/page.tsx`
- **Acceptance Criteria:**
  - ✅ Reset email sent
  - ✅ User can set new password via link

---

## Testing Checklist

- [ ] Sign up → Check email → Click link → Profile created
- [ ] Login with wrong password → Error shown
- [ ] Login with correct password → Redirected to /protected
- [ ] Access /protected without login → Redirected to /auth/login
- [ ] Logout → Redirected to homepage, can't access /protected
- [ ] Password reset → Email sent → Link works → Password updated

---

## Troubleshooting

**Issue:** "Session not persisting across requests"
- **Cause:** Not using `await cookies()` in Server Components
- **Fix:** Always `const cookieStore = await cookies()`

**Issue:** "Auth works locally but not in production"
- **Cause:** `NEXT_PUBLIC_SUPABASE_URL` env var not set in Vercel
- **Fix:** Set env vars in Vercel dashboard

**Issue:** "User logged out randomly"
- **Cause:** Session expired (7 days)
- **Fix:** This is expected. User must re-login.

---

## Next Steps

- Read [03-authorization.md](03-authorization.md) for RLS policies
- Implement city membership after auth (user signs up → joins city)
