/**
 * RSVP Button Component
 * Interactive RSVP interface for events
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { rsvpToEvent, removeRSVP } from '@/features/events/actions';
import type { RSVPStatus } from '@/features/events/types';
import { CheckIcon, XIcon, HelpCircleIcon } from 'lucide-react';

interface RSVPButtonProps {
  eventId: string;
  currentStatus: RSVPStatus | null;
  isAtCapacity: boolean;
  isPast: boolean;
}

export function RSVPButton({
  eventId,
  currentStatus,
  isAtCapacity,
  isPast,
}: RSVPButtonProps) {
  const router = useRouter();
  const [status, setStatus] = useState<RSVPStatus | null>(currentStatus);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRSVP = async (newStatus: RSVPStatus) => {
    setIsLoading(true);
    setError(null);

    const result = await rsvpToEvent(eventId, newStatus);

    if (result.error) {
      setError(result.error);
    } else {
      setStatus(newStatus);
      router.refresh();
    }

    setIsLoading(false);
  };

  const handleRemoveRSVP = async () => {
    setIsLoading(true);
    setError(null);

    const result = await removeRSVP(eventId);

    if (result.error) {
      setError(result.error);
    } else {
      setStatus(null);
      router.refresh();
    }

    setIsLoading(false);
  };

  // Don't show RSVP buttons for past events
  if (isPast) {
    return (
      <div className="text-sm text-muted-foreground">
        This event has already occurred
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="bg-destructive/10 text-destructive p-2 rounded-md text-sm">
          {error}
        </div>
      )}

      {status && (
        <div className="text-sm text-muted-foreground mb-2">
          Your RSVP:{' '}
          <span className="font-semibold">
            {status === 'yes' && '✓ Attending'}
            {status === 'no' && '✗ Not Attending'}
            {status === 'maybe' && '? Maybe'}
          </span>
        </div>
      )}

      <div className="space-y-2">
        <Button
          onClick={() => handleRSVP('yes')}
          disabled={isLoading || (isAtCapacity && status !== 'yes')}
          variant={status === 'yes' ? 'default' : 'outline'}
          className="w-full"
        >
          <CheckIcon className="mr-2 h-4 w-4" />
          {status === 'yes' ? "I'm Going" : 'Going'}
        </Button>

        <Button
          onClick={() => handleRSVP('maybe')}
          disabled={isLoading}
          variant={status === 'maybe' ? 'default' : 'outline'}
          className="w-full"
        >
          <HelpCircleIcon className="mr-2 h-4 w-4" />
          {status === 'maybe' ? "I Might Go" : 'Maybe'}
        </Button>

        <Button
          onClick={() => handleRSVP('no')}
          disabled={isLoading}
          variant={status === 'no' ? 'default' : 'outline'}
          className="w-full"
        >
          <XIcon className="mr-2 h-4 w-4" />
          {status === 'no' ? "I Can't Go" : "Can't Go"}
        </Button>

        {status && (
          <Button
            onClick={handleRemoveRSVP}
            disabled={isLoading}
            variant="ghost"
            className="w-full text-muted-foreground"
            size="sm"
          >
            Remove RSVP
          </Button>
        )}
      </div>

      {isAtCapacity && status !== 'yes' && (
        <p className="text-xs text-muted-foreground">
          This event is at capacity
        </p>
      )}
    </div>
  );
}
