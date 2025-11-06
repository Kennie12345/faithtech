/**
 * Public Events List Page
 * Shows upcoming events for a city
 */

import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getCityBySlug } from '@/lib/core/api';
import { getEvents } from '@/features/events/actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4">
            Upcoming Events in {city.name}
          </h1>
          <p className="text-lg text-muted-foreground">
            Join us for community gatherings, workshops, and more
          </p>
        </div>

        {/* Events Grid */}
        {allEvents.length === 0 ? (
          <Card>
            <CardContent className="pt-12 pb-12">
              <div className="text-center">
                <CalendarIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">No Upcoming Events</h3>
                <p className="text-muted-foreground">
                  Check back soon for new events in {city.name}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {allEvents.map((event) => (
              <EventCard key={event.id} event={event} citySlug={citySlug} />
            ))}
          </div>
        )}
      </div>
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
      <Card className="h-full transition-shadow hover:shadow-lg cursor-pointer">
        <CardHeader>
          <CardTitle className="text-xl">{event.title}</CardTitle>
          <CardDescription className="line-clamp-2">
            {event.description || 'No description'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            <div>
              <div className="font-medium">{formattedDate}</div>
              <div className="text-muted-foreground">{formattedTime}</div>
            </div>
          </div>

          {event.location_name && (
            <div className="flex items-center gap-2 text-sm">
              <MapPinIcon className="h-4 w-4 text-muted-foreground" />
              <span className="line-clamp-1">{event.location_name}</span>
            </div>
          )}

          <div className="flex items-center gap-2 text-sm pt-2">
            <UsersIcon className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              {event.rsvp_yes_count}{' '}
              {event.rsvp_yes_count === 1 ? 'person' : 'people'} attending
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
