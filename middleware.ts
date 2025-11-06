/**
 * Next.js Middleware - Runs on EVERY request before reaching pages/routes
 *
 * PURPOSE: Refresh Supabase auth sessions automatically using SSR pattern
 *
 * WHY THIS EXISTS:
 * - Supabase uses JWT tokens that expire after 1 hour
 * - Without middleware, users would be randomly logged out
 * - Middleware refreshes the session cookie on every request automatically
 * - This runs BEFORE pages render, ensuring auth state is always fresh
 *
 * CRITICAL FOR:
 * - Server-side rendering (SSR) with authenticated user data
 * - Protected routes that check user auth before rendering
 * - Fluid compute compatibility (stateless serverless functions)
 *
 * ARCHITECTURAL DECISION:
 * Supabase's SSR pattern requires middleware to manage session cookies.
 * See: https://supabase.com/docs/guides/auth/server-side
 *
 * @see /lib/supabase/middleware.ts for updateSession implementation
 * @see CLAUDE.md "Authentication Architecture" section
 */

import { updateSession } from "@/lib/supabase/middleware";
import { type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
