/**
 * Admin Events List Page
 * Shows all events for the current city with management controls
 */

import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getCurrentCityId, isAdmin } from '@/lib/core/api';
import { getEvents } from '@/features/events/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, MapPinIcon, UsersIcon, PlusIcon } from 'lucide-react';

export default async function AdminEventsPage() {
  const supabase = await createClient();

  // Check authentication
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/auth/login');
  }

  // Check authorization
  const cityId = await getCurrentCityId();
  if (!cityId) {
    return (
      <div className="flex-1 w-full flex flex-col gap-12">
        <div className="bg-destructive/10 text-destructive p-3 px-5 rounded-md">
          No city context. Please select a city first.
        </div>
      </div>
    );
  }

  const userIsAdmin = await isAdmin(cityId);
  if (!userIsAdmin) {
    return (
      <div className="flex-1 w-full flex flex-col gap-12">
        <div className="bg-destructive/10 text-destructive p-3 px-5 rounded-md">
          Unauthorized. Only city admins can manage events.
        </div>
      </div>
    );
  }

  // Fetch events
  const events = await getEvents(cityId);

  // Separate upcoming and past events
  const now = new Date();
  const upcomingEvents = events.filter((e) => new Date(e.starts_at) >= now);
  const pastEvents = events.filter((e) => new Date(e.starts_at) < now);

  return (
    <div className="flex-1 w-full flex flex-col gap-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Events</h1>
          <p className="text-muted-foreground mt-2">
            Manage events for your community
          </p>
        </div>
        <Button asChild>
          <Link href="/protected/admin/events/new">
            <PlusIcon className="mr-2 h-4 w-4" />
            Create Event
          </Link>
        </Button>
      </div>

      {/* Upcoming Events */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">
          Upcoming Events ({upcomingEvents.length})
        </h2>
        {upcomingEvents.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground text-center">
                No upcoming events. Create your first event to get started!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {upcomingEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>

      {/* Past Events */}
      {pastEvents.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold mb-4">
            Past Events ({pastEvents.length})
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {pastEvents.map((event) => (
              <EventCard key={event.id} event={event} isPast />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function EventCard({
  event,
  isPast = false,
}: {
  event: Awaited<ReturnType<typeof getEvents>>[number];
  isPast?: boolean;
}) {
  const eventDate = new Date(event.starts_at);
  const formattedDate = eventDate.toLocaleDateString('en-AU', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  const formattedTime = eventDate.toLocaleTimeString('en-AU', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <Card className={isPast ? 'opacity-60' : ''}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg">{event.title}</CardTitle>
          {isPast && <Badge variant="secondary">Past</Badge>}
        </div>
        <CardDescription className="line-clamp-2">
          {event.description || 'No description'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CalendarIcon className="h-4 w-4" />
          <span>
            {formattedDate} at {formattedTime}
          </span>
        </div>

        {event.location_name && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPinIcon className="h-4 w-4" />
            <span className="line-clamp-1">{event.location_name}</span>
          </div>
        )}

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <UsersIcon className="h-4 w-4" />
          <span>
            {event.rsvp_yes_count} attending
            {event.max_attendees && ` / ${event.max_attendees} max`}
          </span>
        </div>

        <div className="pt-2">
          <Button asChild variant="outline" className="w-full" size="sm">
            <Link href={`/protected/admin/events/${event.id}`}>
              Manage Event
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
