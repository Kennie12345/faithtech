/**
 * Event Form Component
 * Reusable form for creating and editing events
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { createEvent, updateEvent } from '@/features/events/actions';
import type { Event } from '@/features/events/types';

interface EventFormProps {
  event?: Event;
  mode: 'create' | 'edit';
}

export function EventForm({ event, mode }: EventFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);

    try {
      let result;
      if (mode === 'create') {
        result = await createEvent(formData);
      } else if (event) {
        result = await updateEvent(event.id, formData);
      }

      if (result?.error) {
        setError(result.error);
      } else {
        // Redirect to events list on success
        router.push('/protected/admin/events');
        router.refresh();
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Format datetime for input (YYYY-MM-DDTHH:MM)
  const formatDatetimeLocal = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{mode === 'create' ? 'Create New Event' : 'Edit Event'}</CardTitle>
        <CardDescription>
          {mode === 'create'
            ? 'Fill in the details below to create a new event'
            : 'Update the event details below'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm">
              {error}
            </div>
          )}

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">
              Event Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              name="title"
              required
              defaultValue={event?.title}
              placeholder="Community Meetup"
              maxLength={200}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              name="description"
              defaultValue={event?.description || ''}
              placeholder="Tell people about your event..."
              className="w-full min-h-[120px] px-3 py-2 text-sm rounded-md border border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              maxLength={10000}
            />
            <p className="text-xs text-muted-foreground">
              You can use Markdown formatting
            </p>
          </div>

          {/* Date & Time */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="starts_at">
                Start Date & Time <span className="text-destructive">*</span>
              </Label>
              <Input
                id="starts_at"
                name="starts_at"
                type="datetime-local"
                required
                defaultValue={formatDatetimeLocal(event?.starts_at)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ends_at">End Date & Time</Label>
              <Input
                id="ends_at"
                name="ends_at"
                type="datetime-local"
                defaultValue={formatDatetimeLocal(event?.ends_at || undefined)}
              />
            </div>
          </div>

          {/* Location */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Location</h3>

            <div className="space-y-2">
              <Label htmlFor="location_name">Venue Name</Label>
              <Input
                id="location_name"
                name="location_name"
                defaultValue={event?.location_name || ''}
                placeholder="St Paul's Church"
                maxLength={200}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location_address">Address</Label>
              <Input
                id="location_address"
                name="location_address"
                defaultValue={event?.location_address || ''}
                placeholder="123 Main St, Adelaide SA 5000"
                maxLength={500}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location_url">Location URL</Label>
              <Input
                id="location_url"
                name="location_url"
                type="url"
                defaultValue={event?.location_url || ''}
                placeholder="https://maps.google.com/..."
              />
              <p className="text-xs text-muted-foreground">
                Google Maps link or venue website
              </p>
            </div>
          </div>

          {/* Capacity */}
          <div className="space-y-2">
            <Label htmlFor="max_attendees">Maximum Attendees</Label>
            <Input
              id="max_attendees"
              name="max_attendees"
              type="number"
              min="1"
              defaultValue={event?.max_attendees || ''}
              placeholder="Leave empty for unlimited"
            />
            <p className="text-xs text-muted-foreground">
              Leave empty for unlimited capacity
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading
                ? mode === 'create'
                  ? 'Creating...'
                  : 'Saving...'
                : mode === 'create'
                ? 'Create Event'
                : 'Save Changes'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isLoading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
