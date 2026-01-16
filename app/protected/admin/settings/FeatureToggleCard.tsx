'use client';

import { useState } from 'react';
import { BeigeContentCard } from '@/components/design-system';
import { Switch } from '@/components/ui/switch';
import { Loader2Icon, CalendarDays, Rocket, BookOpen, Mail } from 'lucide-react';
import { toggleFeature } from '@/features/settings/actions';
import type { FeatureConfig, FeatureSlug } from '@/features/settings/types';

interface FeatureToggleCardProps {
  feature: FeatureConfig;
  isEnabled: boolean;
}

const IconMap = {
  CalendarDays: CalendarDays,
  Rocket: Rocket,
  BookOpen: BookOpen,
  Mail: Mail,
};

export function FeatureToggleCard({ feature, isEnabled }: FeatureToggleCardProps) {
  const [enabled, setEnabled] = useState(isEnabled);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const Icon = IconMap[feature.icon as keyof typeof IconMap] || CalendarDays;

  const handleToggle = async (checked: boolean) => {
    setError(null);
    setIsUpdating(true);

    // Optimistic update
    setEnabled(checked);

    try {
      const result = await toggleFeature(feature.slug as FeatureSlug, checked);

      if (result.error) {
        // Revert on error
        setEnabled(!checked);
        setError(result.error);
      }
    } catch (err) {
      console.error('Toggle error:', err);
      setEnabled(!checked);
      setError('Failed to update');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <BeigeContentCard className={!enabled ? 'opacity-60' : ''}>
      <div className="flex items-start gap-space-4">
        <div
          className={`p-space-3 rounded-lg ${
            enabled ? 'bg-green-100' : 'bg-gray-100'
          }`}
        >
          <Icon
            className={`h-5 w-5 ${enabled ? 'text-green-600' : 'text-gray-400'}`}
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-space-4">
            <h3 className="font-heading text-h6 font-600">{feature.name}</h3>
            <div className="flex items-center gap-space-2">
              {isUpdating && (
                <Loader2Icon className="h-4 w-4 animate-spin text-brand-grey-400" />
              )}
              <Switch
                checked={enabled}
                onCheckedChange={handleToggle}
                disabled={isUpdating}
              />
            </div>
          </div>
          <p className="font-body text-p-14 text-brand-grey-500 mt-space-1">
            {feature.description}
          </p>
          {error && (
            <p className="font-body text-p-12 text-destructive mt-space-2">
              {error}
            </p>
          )}
        </div>
      </div>
    </BeigeContentCard>
  );
}
