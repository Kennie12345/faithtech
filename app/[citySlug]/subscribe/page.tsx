/**
 * Public Newsletter Subscribe Page
 * Allows visitors to subscribe to city newsletter (no auth required)
 */

import { notFound } from 'next/navigation';
import { getCityBySlug } from '@/lib/core/api';
import { SubscribeForm } from './SubscribeForm';
import { Container, Section, BeigeContentCard } from '@/components/design-system';
import { MailIcon } from 'lucide-react';

interface SubscribePageProps {
  params: Promise<{ citySlug: string }>;
}

export default async function SubscribePage({ params }: SubscribePageProps) {
  const { citySlug } = await params;

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
            <div className="p-space-4 rounded-full bg-swatch-yellow-100">
              <MailIcon className="h-8 w-8 text-swatch-yellow-600" />
            </div>

            <div>
              <h1 className="font-heading text-h3 font-600 leading-lh-1-1">
                Subscribe to Newsletter
              </h1>
              <p className="font-body text-p-16 text-brand-grey-500 mt-space-2">
                Get updates about events and news from FaithTech {city.name}
              </p>
            </div>

            <SubscribeForm citySlug={citySlug} cityName={city.name} />

            <p className="font-body text-p-12 text-brand-grey-400">
              We respect your privacy. Unsubscribe at any time.
            </p>
          </div>
        </BeigeContentCard>
      </Container>
    </Section>
  );
}
