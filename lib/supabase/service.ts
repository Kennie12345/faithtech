/**
 * Service Role Supabase Client
 *
 * Creates a Supabase client with service_role key for server-side operations
 * that need to bypass Row Level Security (RLS).
 *
 * CRITICAL SECURITY NOTES:
 * 1. NEVER use this client for operations involving user-supplied data without validation
 * 2. NEVER expose this client to client-side code
 * 3. Only use in Server Actions or API Routes where you've done authorization checks
 * 4. This client bypasses ALL RLS policies - use with extreme caution
 *
 * USE CASES:
 * - Public newsletter subscription (no auth required)
 * - Background jobs / cron tasks
 * - Admin operations that need cross-city access
 *
 * @example
 * ```typescript
 * 'use server'
 * import { createServiceClient } from '@/lib/supabase/service';
 *
 * export async function subscribeToNewsletter(email: string, cityId: string) {
 *   const supabase = createServiceClient();
 *   // Validate email before inserting...
 *   const { data, error } = await supabase
 *     .from('newsletter_subscribers')
 *     .insert({ email, city_id: cityId });
 *   return { data, error };
 * }
 * ```
 */

import { createClient } from "@supabase/supabase-js";

export function createServiceClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables"
    );
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
