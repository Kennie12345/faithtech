/**
 * Admin Newsletter Page
 * View and export newsletter subscribers for the current city
 */

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getCurrentCityId, isAdmin } from '@/lib/core/api';
import { getSubscribers } from '@/features/newsletter/actions';
import { BeigeContentCard, Grid } from '@/components/design-system';
import { MailIcon, UsersIcon, DownloadIcon, UserXIcon, UserCheckIcon } from 'lucide-react';
import { ExportButton } from './ExportButton';
import { SubscriberRow } from './SubscriberRow';

export default async function AdminNewsletterPage() {
  const supabase = await createClient();

  // Check authentication
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/auth/login');
  }

  // Check authorization
  const cityId = await getCurrentCityId();
  if (!cityId) {
    return (
      <div className="flex-1 w-full flex flex-col gap-space-9">
        <BeigeContentCard className="bg-destructive/10 border-destructive/20">
          <p className="font-body text-p-14 text-destructive">
            No city context. Please select a city first.
          </p>
        </BeigeContentCard>
      </div>
    );
  }

  const userIsAdmin = await isAdmin(cityId);
  if (!userIsAdmin) {
    return (
      <div className="flex-1 w-full flex flex-col gap-space-9">
        <BeigeContentCard className="bg-destructive/10 border-destructive/20">
          <p className="font-body text-p-14 text-destructive">
            Unauthorized. Only city admins can manage newsletter subscribers.
          </p>
        </BeigeContentCard>
      </div>
    );
  }

  // Fetch all subscribers
  const subscribers = await getSubscribers();

  // Separate active and inactive
  const activeSubscribers = subscribers.filter((s) => s.is_active);
  const inactiveSubscribers = subscribers.filter((s) => !s.is_active);

  return (
    <div className="flex-1 w-full flex flex-col gap-space-9">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-h2 font-600 leading-lh-1-1">Newsletter</h1>
          <p className="font-body text-p-16 text-brand-grey-500 mt-space-2">
            Manage newsletter subscribers for your community
          </p>
        </div>
        <ExportButton disabled={activeSubscribers.length === 0} />
      </div>

      {/* Stats Cards */}
      <Grid cols={1} mdCols={3} gap="sm">
        <BeigeContentCard>
          <div className="flex items-center gap-space-4">
            <div className="p-space-3 rounded-full bg-green-100">
              <UsersIcon className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="font-body text-p-14 text-brand-grey-500">Active Subscribers</p>
              <p className="font-heading text-h3 font-600">{activeSubscribers.length}</p>
            </div>
          </div>
        </BeigeContentCard>
        <BeigeContentCard>
          <div className="flex items-center gap-space-4">
            <div className="p-space-3 rounded-full bg-gray-100">
              <UserXIcon className="h-6 w-6 text-gray-600" />
            </div>
            <div>
              <p className="font-body text-p-14 text-brand-grey-500">Unsubscribed</p>
              <p className="font-heading text-h3 font-600">{inactiveSubscribers.length}</p>
            </div>
          </div>
        </BeigeContentCard>
        <BeigeContentCard>
          <div className="flex items-center gap-space-4">
            <div className="p-space-3 rounded-full bg-blue-100">
              <MailIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="font-body text-p-14 text-brand-grey-500">Total All-Time</p>
              <p className="font-heading text-h3 font-600">{subscribers.length}</p>
            </div>
          </div>
        </BeigeContentCard>
      </Grid>

      {/* Active Subscribers Section */}
      <div>
        <h2 className="font-heading text-h4 font-600 mb-space-4 flex items-center gap-space-2">
          <UserCheckIcon className="h-5 w-5 text-green-600" />
          Active Subscribers ({activeSubscribers.length})
        </h2>
        {activeSubscribers.length === 0 ? (
          <BeigeContentCard>
            <p className="font-body text-p-14 text-brand-grey-500 text-center py-space-4">
              No subscribers yet. Share your subscribe link to grow your list!
            </p>
          </BeigeContentCard>
        ) : (
          <BeigeContentCard>
            <div className="divide-y divide-brand-grey-200">
              <div className="grid grid-cols-12 gap-space-4 py-space-3 font-body text-p-14 font-600 text-brand-grey-500">
                <div className="col-span-5">Email</div>
                <div className="col-span-4">Subscribed</div>
                <div className="col-span-3 text-right">Actions</div>
              </div>
              {activeSubscribers.map((subscriber) => (
                <SubscriberRow key={subscriber.id} subscriber={subscriber} />
              ))}
            </div>
          </BeigeContentCard>
        )}
      </div>

      {/* Unsubscribed Section */}
      {inactiveSubscribers.length > 0 && (
        <div>
          <h2 className="font-heading text-h4 font-600 mb-space-4 flex items-center gap-space-2">
            <UserXIcon className="h-5 w-5 text-gray-500" />
            Unsubscribed ({inactiveSubscribers.length})
          </h2>
          <BeigeContentCard>
            <div className="divide-y divide-brand-grey-200">
              <div className="grid grid-cols-12 gap-space-4 py-space-3 font-body text-p-14 font-600 text-brand-grey-500">
                <div className="col-span-5">Email</div>
                <div className="col-span-4">Unsubscribed</div>
                <div className="col-span-3 text-right">Actions</div>
              </div>
              {inactiveSubscribers.map((subscriber) => (
                <SubscriberRow key={subscriber.id} subscriber={subscriber} />
              ))}
            </div>
          </BeigeContentCard>
        </div>
      )}
    </div>
  );
}
