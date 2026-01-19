/**
 * Edit Event Page
 * Admin page for editing events and managing RSVPs
 */

import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getCurrentCityId, isAdmin } from '@/lib/core/api';
import { getEvent, getEventRSVPs } from '@/features/events/actions';
import { EventForm } from '@/components/events/EventForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeftIcon, CheckIcon, XIcon, HelpCircleIcon } from 'lucide-react';
import { DeleteEventButton } from '@/components/events/DeleteEventButton';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditEventPage({ params }: PageProps) {
  const { id } = await params;
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
      <div className="flex-1 w-full flex flex-col gap-space-9">
        <div className="bg-destructive/10 text-destructive p-3 px-5 rounded-md">
          No city context. Please select a city first.
        </div>
      </div>
    );
  }

  const userIsAdmin = await isAdmin(cityId);
  if (!userIsAdmin) {
    return (
      <div className="flex-1 w-full flex flex-col gap-space-9">
        <div className="bg-destructive/10 text-destructive p-3 px-5 rounded-md">
          Unauthorized. Only city admins can manage events.
        </div>
      </div>
    );
  }

  // Fetch event
  const event = await getEvent(id);
  if (!event) {
    notFound();
  }

  // Verify event belongs to current city
  if (event.city_id !== cityId) {
    return (
      <div className="flex-1 w-full flex flex-col gap-space-9">
        <div className="bg-destructive/10 text-destructive p-3 px-5 rounded-md">
          Event not found in your city.
        </div>
      </div>
    );
  }

  // Fetch RSVPs
  const rsvps = await getEventRSVPs(id);

  // Organize RSVPs by status
  const yesRSVPs = rsvps.filter((r) => r.status === 'yes');
  const noRSVPs = rsvps.filter((r) => r.status === 'no');
  const maybeRSVPs = rsvps.filter((r) => r.status === 'maybe');

  return (
    <div className="flex-1 w-full flex flex-col gap-space-9">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/protected/admin/events">
            <ArrowLeftIcon className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="font-heading text-h2 font-600 leading-lh-1-1">Edit Event</h1>
          <p className="text-muted-foreground mt-2">{event.title}</p>
        </div>
        <DeleteEventButton eventId={event.id} />
      </div>

      {/* Event Form */}
      <EventForm mode="edit" event={event} />

      {/* RSVPs Section */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">RSVPs</h2>

        <div className="grid gap-4 md:grid-cols-3">
          {/* Yes RSVPs */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckIcon className="h-5 w-5 text-green-600" />
                Attending ({yesRSVPs.length})
              </CardTitle>
              {event.max_attendees && (
                <CardDescription>
                  {yesRSVPs.length} / {event.max_attendees} capacity
                </CardDescription>
              )}
            </CardHeader>
            <CardContent>
              {yesRSVPs.length === 0 ? (
                <p className="text-sm text-muted-foreground">No attendees yet</p>
              ) : (
                <ul className="space-y-2">
                  {yesRSVPs.map((rsvp) => (
                    <li key={rsvp.id} className="text-sm">
                      {rsvp.profile.display_name || 'Unknown User'}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          {/* Maybe RSVPs */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircleIcon className="h-5 w-5 text-yellow-600" />
                Maybe ({maybeRSVPs.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {maybeRSVPs.length === 0 ? (
                <p className="text-sm text-muted-foreground">No maybe responses</p>
              ) : (
                <ul className="space-y-2">
                  {maybeRSVPs.map((rsvp) => (
                    <li key={rsvp.id} className="text-sm">
                      {rsvp.profile.display_name || 'Unknown User'}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          {/* No RSVPs */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <XIcon className="h-5 w-5 text-red-600" />
                Not Attending ({noRSVPs.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {noRSVPs.length === 0 ? (
                <p className="text-sm text-muted-foreground">No declines</p>
              ) : (
                <ul className="space-y-2">
                  {noRSVPs.map((rsvp) => (
                    <li key={rsvp.id} className="text-sm">
                      {rsvp.profile.display_name || 'Unknown User'}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
