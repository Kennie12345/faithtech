/**
 * Public Newsletter Unsubscribe Page
 * Allows subscribers to opt-out of city newsletter (no auth required)
 */

import { notFound } from 'next/navigation';
import { getCityBySlug } from '@/lib/core/api';
import { UnsubscribeForm } from './UnsubscribeForm';
import { Container, Section, BeigeContentCard } from '@/components/design-system';
import { MailXIcon } from 'lucide-react';

interface UnsubscribePageProps {
  params: Promise<{ citySlug: string }>;
  searchParams: Promise<{ email?: string }>;
}

export default async function UnsubscribePage({ params, searchParams }: UnsubscribePageProps) {
  const { citySlug } = await params;
  const { email } = await searchParams;

  // Fetch city data
  const city = await getCityBySlug(citySlug);
  if (!city) {
    notFound();
  }

  return (
    <Section>
      <Container className="max-w-md">
        <BeigeContentCard>
          <div className="flex flex-col items-center text-center gap-space-6 py-space-4">
            <div className="p-space-4 rounded-full bg-gray-100">
              <MailXIcon className="h-8 w-8 text-gray-600" />
            </div>

            <div>
              <h1 className="font-heading text-h3 font-600 leading-lh-1-1">
                Unsubscribe
              </h1>
              <p className="font-body text-p-16 text-brand-grey-500 mt-space-2">
                We're sorry to see you go. Enter your email to unsubscribe from FaithTech {city.name} newsletter.
              </p>
            </div>

            <UnsubscribeForm
              citySlug={citySlug}
              cityName={city.name}
              initialEmail={email}
            />
          </div>
        </BeigeContentCard>
      </Container>
    </Section>
  );
}
