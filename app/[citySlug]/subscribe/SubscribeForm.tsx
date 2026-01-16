'use client';

import { useState } from 'react';
import { YellowButton } from '@/components/design-system';
import { Input } from '@/components/ui/input';
import { Loader2Icon, CheckCircleIcon } from 'lucide-react';
import { subscribeToNewsletter } from '@/features/newsletter/actions';

interface SubscribeFormProps {
  citySlug: string;
  cityName: string;
}

export function SubscribeForm({ citySlug, cityName }: SubscribeFormProps) {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const result = await subscribeToNewsletter(email, citySlug);

      if (result.error) {
        setError(result.error);
      } else {
        setIsSuccess(true);
      }
    } catch (err) {
      console.error('Subscribe error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center gap-space-4 py-space-4">
        <div className="p-space-3 rounded-full bg-green-100">
          <CheckCircleIcon className="h-8 w-8 text-green-600" />
        </div>
        <div className="text-center">
          <p className="font-heading text-h4 font-600">You're subscribed!</p>
          <p className="font-body text-p-14 text-brand-grey-500 mt-space-2">
            Thanks for subscribing to FaithTech {cityName}. You'll receive updates about upcoming events and news.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-space-4">
      <div>
        <Input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isSubmitting}
          className="w-full"
        />
        {error && (
          <p className="font-body text-p-12 text-destructive mt-space-2">{error}</p>
        )}
      </div>

      <YellowButton type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? (
          <>
            <Loader2Icon className="mr-space-2 h-4 w-4 animate-spin" />
            Subscribing...
          </>
        ) : (
          'Subscribe'
        )}
      </YellowButton>
    </form>
  );
}
