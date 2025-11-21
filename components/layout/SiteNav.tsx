/**
 * SiteNav Component
 *
 * Global navigation for public pages with two modes:
 * - Simple: City pages (Events, Projects, Blog, Login)
 * - Comprehensive: Root page (add Cities dropdown, Resources dropdown)
 *
 * Desktop navigation is always visible
 * Mobile navigation uses a slide-out drawer (Sheet component)
 *
 * Following FaithTech Design System (docs/style_guide.md)
 *
 * Server Component - fetches user auth state and cities
 */

import Link from 'next/link';
import { getUser } from '@/lib/core/api';
import { AuthButton } from '@/components/auth-button';
import { ThemeSwitcher } from '@/components/theme-switcher';
import { MobileMenu } from '@/components/layout/MobileMenu';
import { YellowButton, BeigeButton } from '@/components/design-system';
import type { City } from '@/lib/core/api';

interface SiteNavProps {
  mode?: 'simple' | 'comprehensive';
  currentCity?: City;
}

export async function SiteNav({ mode = 'simple', currentCity }: SiteNavProps) {
  const user = await getUser();

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-brand-grey-400 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-space-4 md:px-space-6">
        {/* Logo / Brand */}
        <div className="flex items-center gap-space-6">
          <Link
            href={currentCity ? `/${currentCity.slug}` : '/'}
            className="font-heading text-h5 md:text-h4 font-600 transition-colors hover:text-brand-yellow-200"
          >
            {currentCity ? `FaithTech ${currentCity.name}` : 'FaithTech'}
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden items-center gap-space-6 md:flex">
            {mode === 'simple' && currentCity ? (
              <>
                <Link
                  href={`/${currentCity.slug}/events`}
                  className="font-heading text-p-14 font-500 transition-colors hover:text-brand-yellow-200"
                >
                  Events
                </Link>
                <Link
                  href={`/${currentCity.slug}/projects`}
                  className="font-heading text-p-14 font-500 transition-colors hover:text-brand-yellow-200"
                >
                  Projects
                </Link>
                <Link
                  href={`/${currentCity.slug}/blog`}
                  className="font-heading text-p-14 font-500 transition-colors hover:text-brand-yellow-200"
                >
                  Blog
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/#cities"
                  className="font-heading text-p-14 font-500 transition-colors hover:text-brand-yellow-200"
                >
                  Cities
                </Link>
                <Link
                  href="/#features"
                  className="font-heading text-p-14 font-500 transition-colors hover:text-brand-yellow-200"
                >
                  Features
                </Link>
                <Link
                  href="/#about"
                  className="font-heading text-p-14 font-500 transition-colors hover:text-brand-yellow-200"
                >
                  About
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-space-4">
          <ThemeSwitcher />
          {user ? (
            <YellowButton size="sm" asChild className="hidden md:inline-block">
              <Link href="/protected">Dashboard</Link>
            </YellowButton>
          ) : (
            <div className="hidden items-center gap-space-2 md:flex">
              <BeigeButton size="sm" variant="faded" asChild>
                <Link href="/auth/login">Login</Link>
              </BeigeButton>
              <YellowButton size="sm" asChild>
                <Link href="/auth/sign-up">Sign Up</Link>
              </YellowButton>
            </div>
          )}

          {/* Mobile menu drawer */}
          <MobileMenu
            mode={mode}
            currentCity={currentCity}
            isAuthenticated={!!user}
          />
        </div>
      </div>
    </nav>
  );
}
