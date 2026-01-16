'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BeigeButton } from '@/components/design-system';
import { Input } from '@/components/ui/input';
import { Loader2Icon, CheckCircleIcon } from 'lucide-react';
import { unsubscribeFromNewsletter } from '@/features/newsletter/actions';

interface UnsubscribeFormProps {
  citySlug: string;
  cityName: string;
  initialEmail?: string;
}

export function UnsubscribeForm({ citySlug, cityName, initialEmail }: UnsubscribeFormProps) {
  const [email, setEmail] = useState(initialEmail || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const result = await unsubscribeFromNewsletter(email, citySlug);

      if (result.error) {
        setError(result.error);
      } else {
        setIsSuccess(true);
      }
    } catch (err) {
      console.error('Unsubscribe error:', err);
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
          <p className="font-heading text-h4 font-600">Unsubscribed</p>
          <p className="font-body text-p-14 text-brand-grey-500 mt-space-2">
            You've been unsubscribed from FaithTech {cityName} newsletter. You won't receive any more emails from us.
          </p>
        </div>
        <Link
          href={`/${citySlug}/subscribe`}
          className="font-body text-p-14 text-brand-blue-600 hover:underline mt-space-2"
        >
          Changed your mind? Subscribe again
        </Link>
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

      <BeigeButton type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? (
          <>
            <Loader2Icon className="mr-space-2 h-4 w-4 animate-spin" />
            Unsubscribing...
          </>
        ) : (
          'Unsubscribe'
        )}
      </BeigeButton>
    </form>
  );
}
