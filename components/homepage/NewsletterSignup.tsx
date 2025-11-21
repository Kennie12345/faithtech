/**
 * NewsletterSignup Component
 *
 * Placeholder newsletter signup form (Client Component)
 * Displays a disabled form with "Coming Soon" messaging
 * Will be connected to actual newsletter service in Phase 3 (Tasks 32-37)
 *
 * Following FaithTech Design System (docs/style_guide.md)
 */

'use client';

import { useState } from 'react';
import { YellowButton } from '@/components/design-system';

interface NewsletterSignupProps {
  cityId?: string;
}

export function NewsletterSignup({ cityId }: NewsletterSignupProps) {
  const [email, setEmail] = useState('');
  const [showMessage, setShowMessage] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowMessage(true);
    setTimeout(() => setShowMessage(false), 5000);
  };

  return (
    <div className="space-y-space-3">
      <form onSubmit={handleSubmit} className="flex flex-col gap-space-2 sm:flex-row">
        <input
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled
          className="flex-1 rounded-radius-0-5 border border-brand-grey-400 bg-background px-space-4 py-space-3 font-body text-p-14 text-foreground placeholder:text-brand-grey-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Email address"
        />
        <YellowButton
          type="submit"
          disabled
          size="md"
          className="relative group"
          title="Newsletter feature coming soon!"
        >
          Subscribe
          <span className="absolute -top-space-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-radius-0-5 bg-foreground px-space-2 py-space-1 font-body text-p-12 text-background opacity-0 transition-opacity group-hover:opacity-100">
            Coming Soon
          </span>
        </YellowButton>
      </form>

      {showMessage && (
        <p className="font-body text-p-14 text-brand-grey-500">
          Newsletter feature coming soon! We&apos;ll notify you when it&apos;s ready.
        </p>
      )}

      <p className="font-body text-p-12 text-brand-grey-500">
        We&apos;re building newsletter functionality - check back soon!
      </p>
    </div>
  );
}
