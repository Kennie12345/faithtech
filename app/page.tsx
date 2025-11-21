/**
 * Root Homepage (Multi-City Directory)
 *
 * PURPOSE: Global landing page with geo-location aware routing
 *
 * ROUTING STRATEGY:
 * 1. Check Vercel geo headers for user location
 * 2. If location matches a city → Redirect to /[citySlug]
 * 3. If no match or no geo data → Render directory page
 *
 * SECTIONS:
 * - Hero: FaithTech mission statement
 * - City Directory: Grid of all active cities
 * - Feature Highlights: Events, Projects, Blog
 * - Mission & Values: Stone Soup Strategy
 * - Global Stats: Aggregate across all cities
 * - CTA: Join the Movement
 * - Footer: Newsletter, links, theme switcher
 *
 * Server Component
 */

import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import Link from 'next/link';
import { CalendarDays, Rocket, BookOpen } from 'lucide-react';
import { getAllCities, getGlobalStats, getCityStats } from '@/lib/core/api';
import { SiteNav } from '@/components/layout/SiteNav';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { HeroSection } from '@/components/homepage/HeroSection';
import { CityCard } from '@/components/homepage/CityCard';
import { FeatureCard } from '@/components/homepage/FeatureCard';
import { StatsDisplay } from '@/components/homepage/StatsDisplay';
import {
  YellowButton,
  BeigeButton,
  Container,
  Section,
  Grid
} from '@/components/design-system';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FaithTech Regional Hub | Christian Tech Community',
  description:
    'Connecting Christian technologists across cities to redemptively change the world through tech. Join events, collaborate on projects, and grow in faith and tech together.',
  keywords: ['FaithTech', 'Christian tech', 'tech community', 'faith and technology'],
  openGraph: {
    title: 'FaithTech Regional Hub',
    description: 'A global movement of Christian technologists',
    type: 'website',
  },
};

export default async function HomePage() {
  // Geo-location detection (Vercel Edge headers)
  const headersList = await headers();
  const geoCity = headersList.get('x-vercel-ip-city');
  const geoCountry = headersList.get('x-vercel-ip-country');

  // Fetch all active cities
  const cities = await getAllCities();
  const activeCities = cities.filter((city) => city.is_active);

  // Try to match user's location to a city
  if (geoCity && geoCountry === 'AU') {
    // Match city name (case-insensitive)
    const matchedCity = activeCities.find(
      (city) => city.name.toLowerCase() === geoCity.toLowerCase()
    );

    if (matchedCity) {
      // Redirect to city homepage
      redirect(`/${matchedCity.slug}`);
    }
  }

  // If no match, render directory page
  // Fetch global stats
  const globalStats = await getGlobalStats();

  // Fetch member counts for each city (in parallel)
  const citiesWithMemberCounts = await Promise.all(
    activeCities.map(async (city) => {
      const stats = await getCityStats(city.id);
      return {
        city,
        memberCount: stats.memberCount,
      };
    })
  );

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <SiteNav mode="comprehensive" />

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <HeroSection
          eyebrow="A Global Movement"
          title="We exist to see a Jesus revival awakened in and through tech"
          description="FaithTech is a practicing community connecting Christian technologists across cities and regions to redemptively change the world."
          ctas={[
            { label: 'Explore Cities', href: '#cities', variant: 'yellow' },
            { label: 'Learn More', href: '#about', variant: 'beige-faded' },
          ]}
        />

        {/* City Directory */}
        <Section id="cities" spacing="lg">
          <Container size="large">
            <div className="mb-space-8 text-center">
              <h2 className="font-heading text-h2 font-500 leading-lh-1-1">
                Choose Your City
              </h2>
              <p className="mt-space-4 text-p-18 md:text-p-20 text-brand-grey-500">
                Find your local FaithTech community and start connecting with Christian technologists in your area.
              </p>
            </div>

            <Grid cols={1} mdCols={2} lgCols={3} gap="md">
              {citiesWithMemberCounts.map(({ city, memberCount }) => (
                <CityCard key={city.id} city={city} memberCount={memberCount} />
              ))}
            </Grid>

            {activeCities.length === 0 && (
              <div className="rounded-radius-0-5 border border-dashed border-brand-grey-400 bg-brand-grey-100 p-space-8 text-center">
                <p className="text-p-18 text-brand-grey-500">
                  No cities yet. Be the first to start a FaithTech community!
                </p>
                <div className="mt-space-6">
                  <YellowButton asChild>
                    <Link href="/setup">Start a City</Link>
                  </YellowButton>
                </div>
              </div>
            )}
          </Container>
        </Section>

        {/* Feature Highlights */}
        <Section id="features" spacing="lg" className="bg-brand-grey-100">
          <Container size="large">
            <div className="mb-space-8 text-center">
              <h2 className="font-heading text-h2 font-500 leading-lh-1-1">
                What We Do
              </h2>
              <p className="mt-space-4 text-p-18 md:text-p-20 text-brand-grey-500">
                Connect, create, and grow through our community platform.
              </p>
            </div>

            <Grid cols={1} mdCols={2} lgCols={3} gap="md">
              <FeatureCard
                icon={CalendarDays}
                title="Events & Gatherings"
                description="Connect in-person at workshops, meetups, and community gatherings designed for Christian tech workers."
                href={activeCities[0] ? `/${activeCities[0].slug}/events` : '#cities'}
              />
              <FeatureCard
                icon={Rocket}
                title="Project Showcase"
                description="See what communities are building through CREATE hackathons and discover tech-for-good projects."
                href={activeCities[0] ? `/${activeCities[0].slug}/projects` : '#cities'}
              />
              <FeatureCard
                icon={BookOpen}
                title="Blog & Resources"
                description="Learn from testimonies, tech articles, and faith-tech insights shared by community members."
                href={activeCities[0] ? `/${activeCities[0].slug}/blog` : '#cities'}
              />
            </Grid>
          </Container>
        </Section>

        {/* Mission & Values */}
        <Section id="about" spacing="lg">
          <Container size="large">
            <Grid cols={1} lgCols={2} gap="lg">
              {/* Text Content */}
              <div className="space-y-space-6">
                <h2 className="font-heading text-h2 font-500 leading-lh-1-1">
                  The Stone Soup Strategy
                </h2>
                <p className="font-body text-p-18 leading-lh-1-5 text-swatch-dark">
                  We&apos;re building something compelling that others want to contribute to.
                  By creating an excellent platform for FaithTech Australia, we attract
                  developers worldwide to build features that benefit all cities.
                </p>
                <ul className="space-y-space-4 text-p-18 leading-lh-1-5">
                  <li className="flex items-start gap-space-3">
                    <svg
                      className="mt-1 h-6 w-6 flex-shrink-0 text-brand-yellow-200"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span>Stable core, flexible periphery</span>
                  </li>
                  <li className="flex items-start gap-space-3">
                    <svg
                      className="mt-1 h-6 w-6 flex-shrink-0 text-brand-yellow-200"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span>Plugin ecosystem for extensibility</span>
                  </li>
                  <li className="flex items-start gap-space-3">
                    <svg
                      className="mt-1 h-6 w-6 flex-shrink-0 text-brand-yellow-200"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span>Global collaboration, local impact</span>
                  </li>
                  <li className="flex items-start gap-space-3">
                    <svg
                      className="mt-1 h-6 w-6 flex-shrink-0 text-brand-yellow-200"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span>Excellence in execution</span>
                  </li>
                </ul>
              </div>

              {/* Stats Display */}
              <div className="flex items-center justify-center">
                <div className="w-full">
                  <StatsDisplay
                    stats={[
                      { label: 'Active Cities', value: globalStats.cityCount },
                      {
                        label: 'Community Members',
                        value: globalStats.memberCount,
                      },
                      { label: 'Projects Built', value: globalStats.projectCount },
                      { label: 'Events Hosted', value: globalStats.eventCount },
                    ]}
                  />
                </div>
              </div>
            </Grid>
          </Container>
        </Section>

        {/* Call-to-Action */}
        <Section className="bg-brand-yellow-200" spacing="lg">
          <Container size="main">
            <div className="text-center">
              <h2 className="font-heading text-h2 font-500 leading-lh-1-1 text-swatch-dark">
                Join the Movement
              </h2>
              <p className="mt-space-6 font-body text-p-18 md:text-p-20 text-swatch-dark">
                Whether you&apos;re a developer, designer, or technologist, there&apos;s a
                place for you in the FaithTech community.
              </p>
              <div className="mt-space-8 flex flex-col gap-space-4 sm:flex-row sm:justify-center">
                <BeigeButton size="lg" asChild>
                  <Link href="#cities">Find Your City</Link>
                </BeigeButton>
                <BeigeButton size="lg" variant="faded" asChild>
                  <Link href="/setup">Start a New City</Link>
                </BeigeButton>
              </div>
            </div>
          </Container>
        </Section>
      </main>

      {/* Footer */}
      <SiteFooter showNewsletter={true} />
    </div>
  );
}
