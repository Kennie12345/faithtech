/**
 * City Pages Layout
 *
 * PURPOSE: Provides consistent navigation and footer for all city-specific pages
 *
 * WHEN THIS APPLIES:
 * All routes under /[citySlug]/* use this layout automatically.
 * This includes:
 * - /[citySlug] - City homepage
 * - /[citySlug]/events - Events list
 * - /[citySlug]/blog - Blog list
 * - /[citySlug]/projects - Projects list
 * - /[citySlug]/events/[slug] - Event details
 * - etc.
 *
 * ARCHITECTURAL PATTERN: Layout Nesting
 * - Root layout (/app/layout.tsx) → provides theme, fonts, metadata
 * - This layout → adds public navigation + footer for city pages
 * - Route-specific content renders in {children}
 *
 * MULTI-TENANCY:
 * - Fetches city data based on [citySlug] param
 * - Passes city context to SiteNav and SiteFooter
 * - Returns 404 if city doesn't exist
 *
 * @see components/layout/SiteNav.tsx - Public navigation component
 * @see components/layout/SiteFooter.tsx - Public footer component
 */

import { notFound } from 'next/navigation';
import { getCityBySlug } from '@/lib/core/api';
import { SiteNav } from '@/components/layout/SiteNav';
import { SiteFooter } from '@/components/layout/SiteFooter';

interface CityLayoutProps {
  children: React.ReactNode;
  params: Promise<{ citySlug: string }>;
}

export default async function CityLayout({ children, params }: CityLayoutProps) {
  const { citySlug } = await params;

  // Fetch city data
  const city = await getCityBySlug(citySlug);
  if (!city) {
    notFound();
  }

  return (
    <>
      <SiteNav mode="comprehensive" currentCity={city} />
      <main>{children}</main>
      <SiteFooter currentCity={city} />
    </>
  );
}
