/**
 * Public Events List Page
 *
 * PURPOSE: Display upcoming events for a specific city
 *
 * ROUTE PATTERN: /[citySlug]/events
 * Example: /adelaide/events, /sydney/events
 *
 * MULTI-TENANCY:
 * - Dynamic [citySlug] route param identifies which city's events to show
 * - RLS policies in database ensure we only fetch events for this city
 * - Each city has isolated events (Adelaide can't see Sydney's events)
 *
 * DATA FETCHING:
 * 1. getCityBySlug() → Validate city exists, get city data
 * 2. getEvents(cityId, upcomingOnly=true) → Fetch future events only
 * 3. Server Component = Fast, SEO-friendly, no client JS needed
 *
 * ERROR HANDLING:
 * - Invalid city slug → notFound() → Shows 404 page
 *
 * @see /features/events/actions.ts - getEvents implementation
 * @see /lib/core/api.ts - getCityBySlug implementation
 * @see docs/2-core-architecture/multi-tenant-data-model.md
 */

import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getCityBySlug } from '@/lib/core/api';
import { getEvents } from '@/features/events/actions';
import { BeigeContentCard, Container, Section, Grid } from '@/components/design-system';
import { CalendarIcon, MapPinIcon, UsersIcon } from 'lucide-react';

interface PageProps {
  params: Promise<{ citySlug: string }>;
}

export default async function CityEventsPage({ params }: PageProps) {
  const { citySlug } = await params;

  // Fetch city
  const city = await getCityBySlug(citySlug);
  if (!city) {
    notFound();
  }

  // Fetch upcoming events
  const allEvents = await getEvents(city.id, true); // upcomingOnly = true

  return (
    <div className="min-h-screen">
      <Section spacing="lg">
        <Container size="large">
          {/* Header */}
          <div className="mb-space-9">
            <h1 className="font-heading text-h1 font-600 mb-space-4 leading-lh-1-1">
              Upcoming Events in {city.name}
            </h1>
            <p className="font-body text-p-18 text-brand-grey-500">
              Join us for community gatherings, workshops, and more
            </p>
          </div>

          {/* Events Grid */}
          {allEvents.length === 0 ? (
            <BeigeContentCard>
              <div className="text-center py-space-9">
                <CalendarIcon className="h-12 w-12 mx-auto mb-space-4 text-brand-grey-500" />
                <h3 className="font-heading text-h4 font-600 mb-space-2">No Upcoming Events</h3>
                <p className="font-body text-p-16 text-brand-grey-500">
                  Check back soon for new events in {city.name}
                </p>
              </div>
            </BeigeContentCard>
          ) : (
            <Grid cols={1} mdCols={2} lgCols={3} gap="md">
              {allEvents.map((event) => (
                <EventCard key={event.id} event={event} citySlug={citySlug} />
              ))}
            </Grid>
          )}
        </Container>
      </Section>
    </div>
  );
}

function EventCard({
  event,
  citySlug,
}: {
  event: Awaited<ReturnType<typeof getEvents>>[number];
  citySlug: string;
}) {
  const eventDate = new Date(event.starts_at);
  const formattedDate = eventDate.toLocaleDateString('en-AU', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const formattedTime = eventDate.toLocaleTimeString('en-AU', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <Link href={`/${citySlug}/events/${event.slug}`}>
      <BeigeContentCard className="h-full transition-shadow hover:shadow-lg cursor-pointer">
        <div className="space-y-space-4">
          <div>
            <h3 className="font-heading text-h5 font-600 mb-space-2">{event.title}</h3>
            <p className="font-body text-p-14 text-brand-grey-500 line-clamp-2 leading-lh-1-5">
              {event.description || 'No description'}
            </p>
          </div>

          <div className="space-y-space-3">
            <div className="flex items-center gap-space-2 text-p-14">
              <CalendarIcon className="h-4 w-4 text-brand-grey-500" />
              <div>
                <div className="font-heading font-500">{formattedDate}</div>
                <div className="font-body text-brand-grey-500">{formattedTime}</div>
              </div>
            </div>

            {event.location_name && (
              <div className="flex items-center gap-space-2 font-body text-p-14">
                <MapPinIcon className="h-4 w-4 text-brand-grey-500" />
                <span className="line-clamp-1">{event.location_name}</span>
              </div>
            )}

            <div className="flex items-center gap-space-2 font-body text-p-14 pt-space-2">
              <UsersIcon className="h-4 w-4 text-brand-grey-500" />
              <span className="text-brand-grey-500">
                {event.rsvp_yes_count}{' '}
                {event.rsvp_yes_count === 1 ? 'person' : 'people'} attending
              </span>
            </div>
          </div>
        </div>
      </BeigeContentCard>
    </Link>
  );
}
