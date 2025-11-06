/**
 * Public Event Detail Page
 * Shows event details with RSVP functionality
 */

import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getCityBySlug, getUser } from '@/lib/core/api';
import { getEventBySlug, getUserRSVP } from '@/features/events/actions';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  CalendarIcon,
  MapPinIcon,
  UsersIcon,
  ExternalLinkIcon,
  ArrowLeftIcon,
} from 'lucide-react';
import { RSVPButton } from '@/components/events/RSVPButton';

interface PageProps {
  params: Promise<{ citySlug: string; slug: string }>;
}

export default async function EventDetailPage({ params }: PageProps) {
  const { citySlug, slug } = await params;

  // Fetch city
  const city = await getCityBySlug(citySlug);
  if (!city) {
    notFound();
  }

  // Fetch event
  const event = await getEventBySlug(city.id, slug);
  if (!event) {
    notFound();
  }

  // Get current user and their RSVP
  const user = await getUser();
  const userRSVP = user ? await getUserRSVP(event.id) : null;

  // Format dates
  const eventDate = new Date(event.starts_at);
  const endDate = event.ends_at ? new Date(event.ends_at) : null;

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

  const formattedEndTime = endDate
    ? endDate.toLocaleTimeString('en-AU', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

  // Check if event is past
  const isPast = new Date() > eventDate;

  // Check if event is at capacity
  const isAtCapacity =
    event.max_attendees && event.rsvp_yes_count >= event.max_attendees;

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Back Button */}
        <div className="mb-8">
          <Button variant="ghost" asChild>
            <Link href={`/${citySlug}/events`}>
              <ArrowLeftIcon className="mr-2 h-4 w-4" />
              Back to Events
            </Link>
          </Button>
        </div>

        {/* Event Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <h1 className="text-4xl font-bold">{event.title}</h1>
            {isPast && <Badge variant="secondary">Past Event</Badge>}
            {isAtCapacity && !isPast && (
              <Badge variant="destructive">At Capacity</Badge>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Column - Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-xl font-semibold mb-4">About This Event</h2>
                {event.description ? (
                  <div className="prose prose-sm max-w-none">
                    <p className="whitespace-pre-wrap">{event.description}</p>
                  </div>
                ) : (
                  <p className="text-muted-foreground">
                    No description provided.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Location Details */}
            {event.location_name && (
              <Card>
                <CardContent className="pt-6">
                  <h2 className="text-xl font-semibold mb-4">Location</h2>
                  <div className="space-y-2">
                    <p className="font-medium">{event.location_name}</p>
                    {event.location_address && (
                      <p className="text-muted-foreground">
                        {event.location_address}
                      </p>
                    )}
                    {event.location_url && (
                      <Button variant="outline" size="sm" asChild>
                        <a
                          href={event.location_url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View on Map
                          <ExternalLinkIcon className="ml-2 h-3 w-3" />
                        </a>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* RSVP Card */}
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-4">RSVP</h3>
                {user ? (
                  <RSVPButton
                    eventId={event.id}
                    currentStatus={userRSVP?.status || null}
                    isAtCapacity={isAtCapacity || false}
                    isPast={isPast}
                  />
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Sign in to RSVP to this event
                    </p>
                    <Button asChild className="w-full">
                      <Link href="/auth/login">Sign In</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Event Info Card */}
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-start gap-3">
                  <CalendarIcon className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="text-sm">
                    <div className="font-medium">{formattedDate}</div>
                    <div className="text-muted-foreground">
                      {formattedTime}
                      {formattedEndTime && ` - ${formattedEndTime}`}
                    </div>
                  </div>
                </div>

                {event.location_name && (
                  <div className="flex items-start gap-3">
                    <MapPinIcon className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="text-sm">
                      <div className="font-medium">{event.location_name}</div>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <UsersIcon className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="text-sm">
                    <div className="font-medium">
                      {event.rsvp_yes_count}{' '}
                      {event.rsvp_yes_count === 1 ? 'person' : 'people'} attending
                    </div>
                    {event.max_attendees && (
                      <div className="text-muted-foreground">
                        {event.max_attendees} capacity
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
