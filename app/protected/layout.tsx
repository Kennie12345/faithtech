/**
 * Protected Routes Layout
 *
 * PURPOSE: Provides navigation and footer for authenticated pages
 *
 * WHEN THIS APPLIES:
 * All routes under /protected/* use this layout automatically.
 * This includes admin pages, user dashboards, and authenticated features.
 *
 * ARCHITECTURAL PATTERN: Layout Nesting
 * - Root layout (/app/layout.tsx) → provides theme, fonts, metadata
 * - This layout → adds navigation + footer for authenticated sections
 * - Route-specific layouts can nest further (e.g., /protected/admin/layout.tsx)
 *
 * AUTHENTICATION:
 * - Middleware (/middleware.ts) runs BEFORE this layout renders
 * - Middleware redirects unauthenticated users to /auth/login
 * - Therefore, we can assume user IS authenticated when this renders
 * - AuthButton component handles displaying user info + logout
 *
 * COMPONENTS EXPLAINED:
 * - <EnvVarWarning />: Shows banner if Supabase env vars missing (setup helper)
 * - <AuthButton />: Shows user email + logout button (only if authenticated)
 * - <DeployButton />: Quick link to deploy on Vercel (can remove for production)
 * - <ThemeSwitcher />: Toggle dark/light mode
 *
 * LAYOUT STRUCTURE:
 * Navigation (nav) → Content (children) → Footer
 * All constrained to max-w-5xl for consistent page width
 *
 * @see /middleware.ts - Protects these routes by checking auth
 * @see /app/layout.tsx - Root layout that wraps this
 */

import { DeployButton } from "@/components/deploy-button";
import { EnvVarWarning } from "@/components/env-var-warning";
import { AuthButton } from "@/components/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { hasEnvVars } from "@/lib/utils";
import Link from "next/link";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen flex flex-col items-center">
      <div className="flex-1 w-full flex flex-col gap-20 items-center">
        <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
          <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
            <div className="flex gap-5 items-center font-semibold">
              <Link href={"/"}>Next.js Supabase Starter</Link>
              <div className="flex items-center gap-2">
                <DeployButton />
              </div>
            </div>
            {!hasEnvVars ? <EnvVarWarning /> : <AuthButton />}
          </div>
        </nav>
        <div className="flex-1 flex flex-col gap-20 max-w-5xl p-5">
          {children}
        </div>

        <footer className="w-full flex items-center justify-center border-t mx-auto text-center text-xs gap-8 py-16">
          <p>
            Powered by{" "}
            <a
              href="https://supabase.com/?utm_source=create-next-app&utm_medium=template&utm_term=nextjs"
              target="_blank"
              className="font-bold hover:underline"
              rel="noreferrer"
            >
              Supabase
            </a>
          </p>
          <ThemeSwitcher />
        </footer>
      </div>
    </main>
  );
}
