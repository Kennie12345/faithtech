/**
 * Protected Routes Layout
 *
 * PURPOSE: Provides navigation and footer for authenticated admin pages
 *
 * WHEN THIS APPLIES:
 * All routes under /protected/* use this layout automatically.
 * This includes admin dashboard and management pages.
 *
 * ARCHITECTURAL PATTERN: Layout Nesting
 * - Root layout (/app/layout.tsx) → provides theme, fonts, metadata
 * - This layout → adds admin navigation + footer for authenticated sections
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
 * - <ThemeSwitcher />: Toggle dark/light mode
 * - <AdminNav />: Admin navigation menu (Dashboard, Events, Projects, Blog)
 *
 * LAYOUT STRUCTURE:
 * Navigation (nav) → Content (children) → Footer
 * All constrained to max-w-5xl for consistent page width
 *
 * @see /middleware.ts - Protects these routes by checking auth
 * @see /app/layout.tsx - Root layout that wraps this
 */

import { EnvVarWarning } from "@/components/env-var-warning";
import { AuthButton } from "@/components/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { hasEnvVars } from "@/lib/utils";
import Link from "next/link";
import {
  LayoutDashboard,
  CalendarDays,
  Rocket,
  BookOpen,
  MailIcon,
  SettingsIcon,
  ArrowLeft,
} from "lucide-react";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen flex flex-col items-center">
      <div className="flex-1 w-full flex flex-col gap-space-10 items-center">
        {/* Admin Navigation */}
        <nav className="w-full flex justify-center border-b border-brand-grey-400 h-16">
          <div className="w-full max-w-5xl flex justify-between items-center p-space-3 px-space-5 font-body text-p-14">
            <div className="flex gap-space-6 items-center">
              <Link
                href={"/protected"}
                className="font-heading font-600 text-h6 hover:text-brand-yellow-200 transition-colors"
              >
                FaithTech Admin
              </Link>
              <div className="hidden md:flex items-center gap-space-4 text-p-14">
                <Link
                  href="/protected"
                  className="flex items-center gap-space-1-5 text-brand-grey-500 hover:text-foreground transition-colors"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Link>
                <Link
                  href="/protected/admin/events"
                  className="flex items-center gap-space-1-5 text-brand-grey-500 hover:text-foreground transition-colors"
                >
                  <CalendarDays className="h-4 w-4" />
                  Events
                </Link>
                <Link
                  href="/protected/admin/projects"
                  className="flex items-center gap-space-1-5 text-brand-grey-500 hover:text-foreground transition-colors"
                >
                  <Rocket className="h-4 w-4" />
                  Projects
                </Link>
                <Link
                  href="/protected/admin/blog"
                  className="flex items-center gap-space-1-5 text-brand-grey-500 hover:text-foreground transition-colors"
                >
                  <BookOpen className="h-4 w-4" />
                  Blog
                </Link>
                <Link
                  href="/protected/admin/newsletter"
                  className="flex items-center gap-space-1-5 text-brand-grey-500 hover:text-foreground transition-colors"
                >
                  <MailIcon className="h-4 w-4" />
                  Newsletter
                </Link>
                <Link
                  href="/protected/admin/settings"
                  className="flex items-center gap-space-1-5 text-brand-grey-500 hover:text-foreground transition-colors"
                >
                  <SettingsIcon className="h-4 w-4" />
                  Settings
                </Link>
              </div>
            </div>
            {!hasEnvVars ? <EnvVarWarning /> : <AuthButton />}
          </div>
        </nav>

        {/* Main Content */}
        <div className="flex-1 flex flex-col gap-space-10 max-w-5xl p-space-5">
          {children}
        </div>

        {/* Footer */}
        <footer className="w-full flex items-center justify-center border-t border-brand-grey-400 mx-auto text-center font-body text-p-12 gap-space-8 py-space-9">
          <Link
            href="/"
            className="flex items-center gap-space-1-5 text-brand-grey-500 hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3 w-3" />
            Back to Site
          </Link>
          <ThemeSwitcher />
          <p className="text-brand-grey-500">
            FaithTech © {new Date().getFullYear()}
          </p>
        </footer>
      </div>
    </main>
  );
}
