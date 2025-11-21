/**
 * SiteFooter Component
 *
 * Global footer for public pages with:
 * - About section with branding
 * - Quick links (contextual based on city)
 * - Resources links
 * - Newsletter signup (placeholder)
 * - Theme switcher
 * - Admin dashboard link (only for authenticated users)
 *
 * Following FaithTech Design System (docs/style_guide.md)
 *
 * Server Component
 */

import Link from 'next/link';
import { ThemeSwitcher } from '@/components/theme-switcher';
import { NewsletterSignup } from '@/components/homepage/NewsletterSignup';
import { createClient } from '@/lib/supabase/server';
import type { City } from '@/lib/core/api';

interface SiteFooterProps {
  showNewsletter?: boolean;
  currentCity?: City;
}

export async function SiteFooter({ showNewsletter = true, currentCity }: SiteFooterProps) {
  const currentYear = new Date().getFullYear();

  // Check if user is authenticated
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const isAuthenticated = !!user;

  return (
    <footer className="w-full border-t border-brand-grey-400 bg-brand-grey-100">
      <div className="container mx-auto max-w-7xl px-space-4 py-space-8 md:px-space-6 md:py-space-9">
        {/* Main footer content */}
        <div className="grid grid-cols-grid-1 gap-space-8 md:grid-cols-grid-2 lg:grid-cols-grid-4">
          {/* About Column */}
          <div className="space-y-space-4">
            <h3 className="font-heading text-h6 font-600">FaithTech</h3>
            <p className="font-body text-p-14 leading-lh-1-5 text-brand-grey-500">
              A global community connecting Christian technologists to redemptively change the world through tech.
            </p>
            {/* Social links placeholder */}
            <div className="flex gap-space-4">
              <Link
                href="https://github.com/faithtech"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-grey-500 transition-colors hover:text-brand-yellow-200"
                aria-label="GitHub"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </Link>
            </div>
          </div>

          {/* Quick Links Column */}
          <div className="space-y-space-4">
            <h3 className="font-heading text-h6 font-600">Quick Links</h3>
            <ul className="space-y-space-2 text-p-14">
              {currentCity ? (
                <>
                  <li>
                    <Link
                      href={`/${currentCity.slug}/events`}
                      className="font-body text-brand-grey-500 transition-colors hover:text-brand-yellow-200"
                    >
                      Events
                    </Link>
                  </li>
                  <li>
                    <Link
                      href={`/${currentCity.slug}/projects`}
                      className="font-body text-brand-grey-500 transition-colors hover:text-brand-yellow-200"
                    >
                      Projects
                    </Link>
                  </li>
                  <li>
                    <Link
                      href={`/${currentCity.slug}/blog`}
                      className="font-body text-brand-grey-500 transition-colors hover:text-brand-yellow-200"
                    >
                      Blog
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/"
                      className="font-body text-brand-grey-500 transition-colors hover:text-brand-yellow-200"
                    >
                      All Cities
                    </Link>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link
                      href="/#cities"
                      className="font-body text-brand-grey-500 transition-colors hover:text-brand-yellow-200"
                    >
                      Cities
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/#features"
                      className="font-body text-brand-grey-500 transition-colors hover:text-brand-yellow-200"
                    >
                      Features
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/#about"
                      className="font-body text-brand-grey-500 transition-colors hover:text-brand-yellow-200"
                    >
                      About
                    </Link>
                  </li>
                </>
              )}
              {isAuthenticated && (
                <li>
                  <Link
                    href="/protected"
                    className="font-body text-brand-grey-500 transition-colors hover:text-brand-yellow-200"
                  >
                    Admin Dashboard
                  </Link>
                </li>
              )}
            </ul>
          </div>

          {/* Resources Column */}
          <div className="space-y-space-4">
            <h3 className="font-heading text-h6 font-600">Resources</h3>
            <ul className="space-y-space-2 text-p-14">
              <li>
                <Link
                  href="https://github.com/faithtech/regional-hub"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-body text-brand-grey-500 transition-colors hover:text-brand-yellow-200"
                >
                  Documentation
                </Link>
              </li>
              <li>
                <Link
                  href="https://github.com/faithtech/regional-hub"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-body text-brand-grey-500 transition-colors hover:text-brand-yellow-200"
                >
                  GitHub
                </Link>
              </li>
              <li>
                <Link
                  href="https://faithtech.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-body text-brand-grey-500 transition-colors hover:text-brand-yellow-200"
                >
                  FaithTech Global
                </Link>
              </li>
              <li>
                <Link
                  href="mailto:support@faithtech.com"
                  className="font-body text-brand-grey-500 transition-colors hover:text-brand-yellow-200"
                >
                  Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter Column */}
          {showNewsletter && (
            <div className="space-y-space-4">
              <h3 className="font-heading text-h6 font-600">Stay Updated</h3>
              <p className="font-body text-p-14 text-brand-grey-500">
                Subscribe to our newsletter for community updates.
              </p>
              <NewsletterSignup cityId={currentCity?.id} />
            </div>
          )}
        </div>

        {/* Footer bottom */}
        <div className="mt-space-8 flex flex-col items-center justify-between gap-space-4 border-t border-brand-grey-400 pt-space-6 md:flex-row">
          <p className="font-body text-p-14 text-brand-grey-500">
            &copy; {currentYear} FaithTech. Built with faith and code.
          </p>
          <div className="flex items-center gap-space-6">
            <Link
              href="/privacy"
              className="font-body text-p-14 text-brand-grey-500 transition-colors hover:text-brand-yellow-200"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="font-body text-p-14 text-brand-grey-500 transition-colors hover:text-brand-yellow-200"
            >
              Terms of Service
            </Link>
            <ThemeSwitcher />
          </div>
        </div>
      </div>
    </footer>
  );
}
