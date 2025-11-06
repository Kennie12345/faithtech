/**
 * Client-Side Supabase Client Factory
 *
 * Creates a Supabase client for use in Client Components (browser-only).
 * This client reads auth session from browser cookies and local storage.
 *
 * WHEN TO USE THIS:
 * - Client Components (components with "use client" directive)
 * - Interactive forms that need to call Supabase directly
 * - Real-time subscriptions
 * - Browser-based authentication flows
 *
 * WHEN NOT TO USE (use server.ts instead):
 * - Server Components (default in Next.js App Router)
 * - Server Actions
 * - Route Handlers (API routes)
 * - Anything that needs to run securely on the server
 *
 * KEY DIFFERENCE from server.ts:
 * - Server client: Reads cookies via Next.js cookies() API (SSR-safe)
 * - Browser client: Reads cookies directly from browser (client-only)
 *
 * USAGE EXAMPLE:
 * ```typescript
 * 'use client'; // Must be in Client Component
 *
 * import { createClient } from '@/lib/supabase/client';
 *
 * export function LoginForm() {
 *   const supabase = createClient();
 *
 *   async function handleLogin(email: string, password: string) {
 *     const { error } = await supabase.auth.signInWithPassword({
 *       email,
 *       password,
 *     });
 *     // handle response...
 *   }
 *
 *   return <form>...</form>;
 * }
 * ```
 *
 * @returns Supabase client configured for browser use
 * @see /lib/supabase/server.ts - Server-side version
 * @see /middleware.ts - Refreshes sessions automatically
 */

import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}
