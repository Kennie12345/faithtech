/**
 * NewsletterSignup Component
 *
 * Newsletter signup form for city homepages
 * Connects to the newsletter feature for email collection
 *
 * Following FaithTech Design System (docs/style_guide.md)
 */

'use client';

import { useState } from 'react';
import { YellowButton } from '@/components/design-system';
import { Loader2Icon, CheckCircleIcon, MailIcon } from 'lucide-react';
import { subscribeToNewsletter } from '@/features/newsletter/actions';

interface NewsletterSignupProps {
  citySlug: string;
  cityName: string;
}

export function NewsletterSignup({ citySlug, cityName }: NewsletterSignupProps) {
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
        setEmail('');
      }
    } catch (err) {
      console.error('Newsletter signup error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="rounded-radius-0-5 border border-green-200 bg-green-50 p-space-6 text-center">
        <CheckCircleIcon className="mx-auto h-10 w-10 text-green-600 mb-space-4" />
        <h3 className="font-heading text-h5 font-600 text-green-800">
          You're subscribed!
        </h3>
        <p className="font-body text-p-14 text-green-700 mt-space-2">
          Thanks for subscribing to FaithTech {cityName}. You'll receive updates about upcoming events and news.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-radius-0-5 border border-brand-grey-300 bg-brand-grey-100 p-space-6 md:p-space-8">
      <div className="text-center mb-space-6">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-swatch-yellow-100 mb-space-4">
          <MailIcon className="h-6 w-6 text-swatch-yellow-600" />
        </div>
        <h3 className="font-heading text-h4 font-600">Stay Updated</h3>
        <p className="font-body text-p-16 text-brand-grey-500 mt-space-2">
          Get notified about events and news from FaithTech {cityName}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-space-3 sm:flex-row sm:gap-space-2 max-w-md mx-auto">
        <input
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isSubmitting}
          className="flex-1 rounded-radius-0-5 border border-brand-grey-400 bg-background px-space-4 py-space-3 font-body text-p-14 text-foreground placeholder:text-brand-grey-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Email address"
        />
        <YellowButton type="submit" disabled={isSubmitting} size="md">
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

      {error && (
        <p className="font-body text-p-14 text-destructive text-center mt-space-3">
          {error}
        </p>
      )}

      <p className="font-body text-p-12 text-brand-grey-400 text-center mt-space-4">
        We respect your privacy. Unsubscribe at any time.
      </p>
    </div>
  );
}
