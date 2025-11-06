/**
 * Email Confirmation Route Handler
 *
 * PURPOSE: Verify user email and complete sign-up flow using Supabase OTP
 *
 * FLOW:
 * 1. User signs up → Supabase sends email with magic link
 * 2. User clicks link → Redirects to this route with token_hash & type
 * 3. This route verifies OTP token with Supabase
 * 4. Create user profile if new signup
 * 5. Emit 'user:created' event for other features to react
 * 6. Redirect to app (authenticated)
 *
 * WHY PROFILE CREATION HERE:
 * - Supabase auth creates user in auth.users automatically
 * - We need to create matching record in public.profiles table
 * - This is the single point where we know user is newly created
 * - Profile row is needed for RLS policies and user features
 *
 * ERROR HANDLING:
 * - Invalid/expired tokens → redirect to /auth/error
 * - Profile creation failure → redirect to /auth/error
 * - User sees friendly error message, not raw error
 *
 * @see /app/auth/sign-up/page.tsx - Where users start signup
 * @see /lib/core/events.ts - Event system for 'user:created' event
 */

import { createClient } from "@/lib/supabase/server";
import { type EmailOtpType } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { type NextRequest } from "next/server";
import { emitEvent } from "@/lib/core/events";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/";

  if (token_hash && type) {
    const supabase = await createClient();

    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });

    if (!error) {
      // Get the authenticated user
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // Check if profile already exists
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', user.id)
          .single();

        // Create profile if it doesn't exist (new signup)
        if (!existingProfile) {
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              display_name: user.email?.split('@')[0] || 'User', // Default to email username
              avatar_url: null,
              bio: null,
              linkedin_url: null,
              github_url: null,
              website_url: null,
            });

          if (profileError) {
            console.error('Error creating profile:', profileError);
            redirect(`/auth/error?error=Failed to create profile`);
          }

          // Emit user:created event for other features to react to
          emitEvent('user:created', {
            userId: user.id,
            email: user.email || '',
          });
        }
      }

      // redirect user to specified redirect URL or root of app
      redirect(next);
    } else {
      // redirect the user to an error page with some instructions
      redirect(`/auth/error?error=${error?.message}`);
    }
  }

  // redirect the user to an error page with some instructions
  redirect(`/auth/error?error=No token hash or type`);
}
