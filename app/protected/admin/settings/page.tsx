/**
 * Admin Settings Page
 * City profile configuration and feature toggles
 */

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getCurrentCityId, isAdmin } from '@/lib/core/api';
import { getCityProfile, getFeatureToggles } from '@/features/settings/actions';
import { FEATURE_CONFIGS } from '@/features/settings/types';
import { BeigeContentCard, Grid } from '@/components/design-system';
import { SettingsIcon } from 'lucide-react';
import { CityProfileForm } from './CityProfileForm';
import { FeatureToggleCard } from './FeatureToggleCard';

export default async function AdminSettingsPage() {
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
            Unauthorized. Only city admins can manage settings.
          </p>
        </BeigeContentCard>
      </div>
    );
  }

  // Fetch data
  const cityProfile = await getCityProfile();
  const featureToggles = await getFeatureToggles();

  if (!cityProfile) {
    return (
      <div className="flex-1 w-full flex flex-col gap-space-9">
        <BeigeContentCard className="bg-destructive/10 border-destructive/20">
          <p className="font-body text-p-14 text-destructive">
            Failed to load city profile.
          </p>
        </BeigeContentCard>
      </div>
    );
  }

  // Map feature toggles to a lookup object
  const featureStates = featureToggles.reduce(
    (acc, toggle) => {
      acc[toggle.feature_slug] = toggle.is_enabled;
      return acc;
    },
    {} as Record<string, boolean>
  );

  return (
    <div className="flex-1 w-full flex flex-col gap-space-9">
      {/* Header */}
      <div>
        <h1 className="font-heading text-h2 font-600 leading-lh-1-1 flex items-center gap-space-3">
          <SettingsIcon className="h-7 w-7" />
          Settings
        </h1>
        <p className="font-body text-p-16 text-brand-grey-500 mt-space-2">
          Configure your city profile and manage features
        </p>
      </div>

      {/* City Profile Section */}
      <div>
        <h2 className="font-heading text-h4 font-600 mb-space-4">City Profile</h2>
        <BeigeContentCard>
          <CityProfileForm profile={cityProfile} />
        </BeigeContentCard>
      </div>

      {/* Feature Toggles Section */}
      <div>
        <h2 className="font-heading text-h4 font-600 mb-space-4">Features</h2>
        <p className="font-body text-p-14 text-brand-grey-500 mb-space-4">
          Enable or disable features for your city. Disabled features will be hidden from your public site.
        </p>
        <Grid cols={1} mdCols={2} gap="sm">
          {FEATURE_CONFIGS.map((feature) => (
            <FeatureToggleCard
              key={feature.slug}
              feature={feature}
              isEnabled={featureStates[feature.slug] ?? true}
            />
          ))}
        </Grid>
      </div>
    </div>
  );
}
