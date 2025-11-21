/**
 * CityCard Component
 *
 * Displays a city in the directory with:
 * - Hero image background
 * - Dark gradient overlay
 * - City name (design system heading font)
 * - Member count badge
 * - Hover elevation effect
 * - Links to city homepage
 *
 * Following FaithTech Design System (docs/style_guide.md)
 *
 * Server Component
 */

import Link from 'next/link';
import Image from 'next/image';
import type { City } from '@/lib/core/api';

interface CityCardProps {
  city: City;
  memberCount: number;
}

export function CityCard({ city, memberCount }: CityCardProps) {
  // Fallback gradient if no hero image
  const gradientColors: Record<string, string> = {
    '#6366f1': 'from-indigo-500 to-indigo-700', // Indigo
    '#8b5cf6': 'from-purple-500 to-purple-700', // Purple
    '#ec4899': 'from-pink-500 to-pink-700', // Pink
    '#14b8a6': 'from-teal-500 to-teal-700', // Teal
  };

  const gradientClass =
    gradientColors[city.accent_color] || 'from-brand-yellow-200/50 to-brand-yellow-200';

  return (
    <Link
      href={`/${city.slug}`}
      className="group relative block h-64 overflow-hidden rounded-radius-0-5 border border-brand-grey-400 bg-swatch-light shadow-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-yellow-200 focus-visible:ring-offset-2"
    >
      {/* Background Image or Gradient */}
      {city.hero_image_url ? (
        <Image
          src={city.hero_image_url}
          alt={`${city.name} skyline`}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
      ) : (
        <div className={`h-full w-full bg-gradient-to-br ${gradientClass}`} />
      )}

      {/* Dark Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-swatch-dark/80 via-swatch-dark/40 to-swatch-dark/20 transition-opacity group-hover:from-swatch-dark/90" />

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col justify-end p-space-6">
        {/* City Name */}
        <h3 className="font-heading text-h3 font-500 text-swatch-light transition-transform group-hover:translate-y-[-4px]">
          {city.name}
        </h3>

        {/* Member Count Badge */}
        <div className="mt-space-3 inline-flex w-fit items-center gap-space-2 rounded-full bg-swatch-light/20 px-space-3 py-space-1 backdrop-blur-sm">
          <svg
            className="h-4 w-4 text-swatch-light"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
          <span className="font-heading text-p-14 font-500 text-swatch-light">
            {memberCount} {memberCount === 1 ? 'member' : 'members'}
          </span>
        </div>

        {/* Hover Indicator */}
        <div className="mt-space-2 flex items-center gap-space-1 text-swatch-light opacity-0 transition-opacity group-hover:opacity-100">
          <span className="font-heading text-p-14 font-500">View Community</span>
          <svg
            className="h-4 w-4 transition-transform group-hover:translate-x-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>
      </div>
    </Link>
  );
}
