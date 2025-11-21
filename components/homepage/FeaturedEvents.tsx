/**
 * FeaturedEvents Component
 *
 * Displays 2-3 featured/upcoming events for a city
 * Fallback to recent upcoming if no featured events
 *
 * Following FaithTech Design System (docs/style_guide.md)
 *
 * Server Component
 */

import Link from 'next/link';
import { getEvents } from '@/features/events/actions';
import { BeigeContentCard, BeigeButton, Container, Section, Grid } from '@/components/design-system';
import { CalendarIcon, MapPinIcon, UsersIcon } from 'lucide-react';

interface FeaturedEventsProps {
  citySlug: string;
  cityId: string;
  limit?: number;
}

export async function FeaturedEvents({
  citySlug,
  cityId,
  limit = 3,
}: FeaturedEventsProps) {
  // Try to get featured events first
  let events = await getEvents(cityId, true, true, limit);

  // Fallback to recent upcoming events if no featured
  if (events.length === 0) {
    events = await getEvents(cityId, true, false, limit);
  }

  // If still no events, show empty state
  if (events.length === 0) {
    return (
      <Section spacing="lg">
        <Container size="large">
          <div className="mb-space-8 flex items-center justify-between">
            <h2 className="font-heading text-h3 font-500 leading-lh-1-1">
              Upcoming Events
            </h2>
          </div>
          <div className="rounded-radius-0-5 border border-dashed border-brand-grey-400 bg-brand-grey-100 p-space-8 text-center">
            <svg
              className="mx-auto mb-space-4 h-12 w-12 text-brand-grey-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="font-body text-p-18 text-brand-grey-500">
              No upcoming events yet. Check back soon!
            </p>
          </div>
        </Container>
      </Section>
    );
  }

  return (
    <Section spacing="lg">
      <Container size="large">
        {/* Section Header */}
        <div className="mb-space-8 flex items-center justify-between">
          <h2 className="font-heading text-h3 font-500 leading-lh-1-1">
            Upcoming Events
          </h2>
          <BeigeButton size="sm" variant="faded" asChild>
            <Link href={`/${citySlug}/events`}>
              View All
              <svg
                className="ml-1 h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </BeigeButton>
        </div>

        {/* Events Grid */}
        <Grid cols={1} mdCols={2} lgCols={3} gap="md">
          {events.map((event) => {
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
              <Link key={event.id} href={`/${citySlug}/events/${event.slug}`}>
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
          })}
        </Grid>
      </Container>
    </Section>
  );
}
