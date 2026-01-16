'use client';

import { useState } from 'react';
import { BeigeButton } from '@/components/design-system';
import { Trash2Icon, RefreshCwIcon, Loader2Icon } from 'lucide-react';
import { deleteSubscriber, reactivateSubscriber } from '@/features/newsletter/actions';
import type { NewsletterSubscriber } from '@/features/newsletter/types';

interface SubscriberRowProps {
  subscriber: NewsletterSubscriber;
}

export function SubscriberRow({ subscriber }: SubscriberRowProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to permanently delete this subscriber? This action cannot be undone.')) {
      return;
    }

    setIsLoading(true);
    try {
      const result = await deleteSubscriber(subscriber.id);
      if (result.error) {
        alert(result.error);
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete subscriber');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReactivate = async () => {
    setIsLoading(true);
    try {
      const result = await reactivateSubscriber(subscriber.id);
      if (result.error) {
        alert(result.error);
      }
    } catch (error) {
      console.error('Reactivate error:', error);
      alert('Failed to reactivate subscriber');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-AU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="grid grid-cols-12 gap-space-4 py-space-3 items-center font-body text-p-14">
      <div className="col-span-5 truncate">{subscriber.email}</div>
      <div className="col-span-4 text-brand-grey-500">
        {subscriber.is_active
          ? formatDate(subscriber.subscribed_at)
          : formatDate(subscriber.unsubscribed_at)}
      </div>
      <div className="col-span-3 flex justify-end gap-space-2">
        {!subscriber.is_active && (
          <BeigeButton
            size="sm"
            onClick={handleReactivate}
            disabled={isLoading}
            title="Reactivate subscriber"
          >
            {isLoading ? (
              <Loader2Icon className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCwIcon className="h-4 w-4" />
            )}
          </BeigeButton>
        )}
        <BeigeButton
          size="sm"
          onClick={handleDelete}
          disabled={isLoading}
          title="Delete permanently"
          className="text-destructive hover:bg-destructive/10"
        >
          {isLoading ? (
            <Loader2Icon className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2Icon className="h-4 w-4" />
          )}
        </BeigeButton>
      </div>
    </div>
  );
}
