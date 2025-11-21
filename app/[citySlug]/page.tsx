/**
 * City Homepage
 *
 * PURPOSE: City-specific community homepage
 *
 * ROUTING: /[citySlug] (e.g., /adelaide, /sydney)
 *
 * SECTIONS:
 * - Hero: City name, tagline, hero image
 * - Featured Events: 3 upcoming events
 * - Featured Projects: 3 featured/recent projects
 * - Latest Blog Posts: 3 recent posts
 * - Community Stats: City-specific counts
 * - CTA: Join community
 * - Footer
 *
 * Server Component
 */

import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getCityBySlug, getCityStats } from '@/lib/core/api';
import { HeroSection } from '@/components/homepage/HeroSection';
import { FeaturedEvents } from '@/components/homepage/FeaturedEvents';
import { FeaturedProjects } from '@/components/homepage/FeaturedProjects';
import { LatestPosts } from '@/components/homepage/LatestPosts';
import { StatsDisplay } from '@/components/homepage/StatsDisplay';
import { YellowButton, BeigeButton, Container, Section } from '@/components/design-system';
import type { Metadata } from 'next';

interface CityPageProps {
  params: {
    citySlug: string;
  };
}

// Generate dynamic metadata for SEO
export async function generateMetadata({
  params,
}: CityPageProps): Promise<Metadata> {
  const city = await getCityBySlug(params.citySlug);

  if (!city || !city.is_active) {
    return {
      title: 'City Not Found',
    };
  }

  return {
    title: `FaithTech ${city.name} | Christian Tech Community`,
    description: `Join the FaithTech community in ${city.name}. Connect with Christian technologists, attend events, collaborate on projects, and grow in faith and tech.`,
    openGraph: {
      title: `FaithTech ${city.name}`,
      description: `Christian tech community in ${city.name}`,
      images: city.hero_image_url ? [city.hero_image_url] : [],
      type: 'website',
    },
  };
}

export default async function CityPage({ params }: CityPageProps) {
  // Fetch city data
  const city = await getCityBySlug(params.citySlug);

  // 404 if city doesn't exist or is inactive
  if (!city || !city.is_active) {
    notFound();
  }

  // Fetch city stats
  const stats = await getCityStats(city.id);

  return (
    <div className="flex flex-col">
        {/* Hero Section */}
        <HeroSection
          eyebrow={`FaithTech ${city.name}`}
          title={`Connecting Christian Technologists in ${city.name}`}
          description="Join us to connect, create, and grow in faith and tech together. Attend events, collaborate on projects, and be part of a vibrant community of believers in tech."
          ctas={[
            { label: 'Join Our Community', href: '/auth/sign-up', variant: 'yellow' },
            { label: 'Upcoming Events', href: `/${city.slug}/events`, variant: 'beige-faded' },
          ]}
          backgroundImage={city.hero_image_url || undefined}
          overlay={true}
        />

        {/* Featured Events */}
        <FeaturedEvents citySlug={city.slug} cityId={city.id} limit={3} />

        {/* Featured Projects */}
        <FeaturedProjects citySlug={city.slug} cityId={city.id} limit={3} />

        {/* Latest Blog Posts */}
        <LatestPosts citySlug={city.slug} cityId={city.id} limit={3} />

        {/* Community Stats */}
        <Section spacing="lg" className="bg-brand-grey-200">
          <Container size="large">
            <div className="mb-space-9 text-center">
              <h2 className="font-heading text-h2 font-500 leading-lh-1-1">
                Community Impact
              </h2>
              <p className="mt-space-4 font-body text-p-18 text-brand-grey-500">
                Together, we&apos;re building something meaningful in {city.name}.
              </p>
            </div>

            <StatsDisplay
              stats={[
                { label: 'Active Members', value: stats.memberCount },
                { label: 'Events This Year', value: stats.eventCount },
                { label: 'Projects Built', value: stats.projectCount },
                { label: 'Blog Posts', value: stats.postCount },
              ]}
            />
          </Container>
        </Section>

        {/* Call-to-Action */}
        <section
          className="py-space-9 md:py-space-10 text-white"
          style={{
            backgroundColor: city.accent_color || 'var(--_brand---brand-yellow--200)',
          }}
        >
          <Container size="medium" className="text-center">
            <h2 className="font-heading text-h1 font-500 leading-lh-1-1">
              Join the {city.name} Community
            </h2>
            <p className="mt-space-6 font-body text-p-18 md:text-p-20">
              Connect with Christian technologists in your city. Attend events,
              collaborate on projects, and grow in faith and tech together.
            </p>
            <div className="mt-space-8 flex flex-col gap-space-4 sm:flex-row sm:justify-center">
              <YellowButton size="lg" asChild className="bg-white hover:bg-white/90" style={{ color: city.accent_color || 'var(--_brand---brand-yellow--200)' }}>
                <Link href="/auth/sign-up">Sign Up Now</Link>
              </YellowButton>
              <BeigeButton size="lg" variant="faded" asChild className="border-2 border-white bg-transparent text-white hover:bg-white/10">
                <Link href={`/${city.slug}/events`}>View Events</Link>
              </BeigeButton>
            </div>
          </Container>
        </section>
    </div>
  );
}
