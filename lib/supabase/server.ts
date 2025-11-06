/**
 * Server-Side Supabase Client Factory
 *
 * Creates a Supabase client for use in Server Components, Server Actions, and Route Handlers.
 * This client reads auth session from cookies managed by middleware.
 *
 * CRITICAL ARCHITECTURAL DECISION: Per-Request Client Creation
 *
 * WHY we create a NEW client on EVERY request:
 * 1. **Fluid Compute Compatibility**: Serverless functions are stateless.
 *    Global variables don't persist between requests and can cause stale auth state.
 *
 * 2. **Session Isolation**: Each request may have different user auth state.
 *    A global client would mix sessions between users (major security issue).
 *
 * 3. **Cookie Access**: Each request has its own cookie store.
 *    We need fresh access to cookies() for the current request.
 *
 * USAGE PATTERN (ALWAYS follow this):
 * ```typescript
 * // ✅ CORRECT - Create client inside function
 * export async function MyServerComponent() {
 *   const supabase = await createClient();
 *   const { data } = await supabase.from('table').select();
 *   // ...
 * }
 *
 * // ❌ WRONG - Never use global client
 * const supabase = await createClient(); // Don't do this!
 * export async function MyServerComponent() {
 *   const { data } = await supabase.from('table').select();
 * }
 * ```
 *
 * @returns Supabase client configured for server-side use with SSR auth
 * @see /middleware.ts - Refreshes sessions before this client is used
 * @see /lib/supabase/client.ts - Client-side version for browser components
 */

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    },
  );
}
