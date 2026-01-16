'use client';

import { useState } from 'react';
import { YellowButton } from '@/components/design-system';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2Icon, CheckIcon } from 'lucide-react';
import { updateCityProfile } from '@/features/settings/actions';
import { ACCENT_COLORS } from '@/features/settings/types';
import type { CityProfile } from '@/features/settings/types';

interface CityProfileFormProps {
  profile: CityProfile;
}

export function CityProfileForm({ profile }: CityProfileFormProps) {
  const [name, setName] = useState(profile.name);
  const [logoUrl, setLogoUrl] = useState(profile.logo_url || '');
  const [heroImageUrl, setHeroImageUrl] = useState(profile.hero_image_url || '');
  const [accentColor, setAccentColor] = useState(profile.accent_color);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSaved(false);
    setIsSubmitting(true);

    try {
      const result = await updateCityProfile({
        name: name.trim(),
        logo_url: logoUrl.trim() || null,
        hero_image_url: heroImageUrl.trim() || null,
        accent_color: accentColor,
      });

      if (result.error) {
        setError(result.error);
      } else {
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 3000);
      }
    } catch (err) {
      console.error('Save error:', err);
      setError('Failed to save changes');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-space-6">
      {/* City Name */}
      <div className="space-y-space-2">
        <Label htmlFor="name" className="font-body text-p-14 font-600">
          City Name
        </Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="FaithTech Adelaide"
          required
          minLength={2}
          disabled={isSubmitting}
        />
        <p className="font-body text-p-12 text-brand-grey-400">
          The display name for your city
        </p>
      </div>

      {/* City Slug (read-only) */}
      <div className="space-y-space-2">
        <Label htmlFor="slug" className="font-body text-p-14 font-600">
          URL Slug
        </Label>
        <Input
          id="slug"
          value={profile.slug}
          disabled
          className="bg-brand-grey-100"
        />
        <p className="font-body text-p-12 text-brand-grey-400">
          Used in URLs (e.g., /{profile.slug}/events). Contact super admin to change.
        </p>
      </div>

      {/* Logo URL */}
      <div className="space-y-space-2">
        <Label htmlFor="logoUrl" className="font-body text-p-14 font-600">
          Logo URL
        </Label>
        <Input
          id="logoUrl"
          type="url"
          value={logoUrl}
          onChange={(e) => setLogoUrl(e.target.value)}
          placeholder="https://example.com/logo.png"
          disabled={isSubmitting}
        />
        <p className="font-body text-p-12 text-brand-grey-400">
          URL to your city logo (recommended: 200x200px PNG)
        </p>
      </div>

      {/* Hero Image URL */}
      <div className="space-y-space-2">
        <Label htmlFor="heroImageUrl" className="font-body text-p-14 font-600">
          Hero Image URL
        </Label>
        <Input
          id="heroImageUrl"
          type="url"
          value={heroImageUrl}
          onChange={(e) => setHeroImageUrl(e.target.value)}
          placeholder="https://example.com/hero.jpg"
          disabled={isSubmitting}
        />
        <p className="font-body text-p-12 text-brand-grey-400">
          Background image for your city homepage (recommended: 1920x1080px)
        </p>
      </div>

      {/* Accent Color */}
      <div className="space-y-space-2">
        <Label className="font-body text-p-14 font-600">Accent Color</Label>
        <div className="flex gap-space-3 flex-wrap">
          {ACCENT_COLORS.map((color) => (
            <button
              key={color.value}
              type="button"
              onClick={() => setAccentColor(color.value)}
              disabled={isSubmitting}
              className={`w-10 h-10 rounded-full border-2 transition-all ${
                accentColor === color.value
                  ? 'border-foreground scale-110'
                  : 'border-transparent hover:scale-105'
              }`}
              style={{ backgroundColor: color.value }}
              title={color.name}
            >
              {accentColor === color.value && (
                <CheckIcon className="h-5 w-5 text-white mx-auto" />
              )}
            </button>
          ))}
        </div>
        <p className="font-body text-p-12 text-brand-grey-400">
          Choose an accent color for buttons and highlights
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <p className="font-body text-p-14 text-destructive">{error}</p>
      )}

      {/* Submit Button */}
      <div className="flex items-center gap-space-4">
        <YellowButton type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2Icon className="mr-space-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : isSaved ? (
            <>
              <CheckIcon className="mr-space-2 h-4 w-4" />
              Saved!
            </>
          ) : (
            'Save Changes'
          )}
        </YellowButton>
      </div>
    </form>
  );
}
