/**
 * FeatureCard Component
 *
 * Feature highlight card with:
 * - Icon in colored circle
 * - Title and description
 * - Hover border effect
 * - Link to feature page
 *
 * Following FaithTech Design System (docs/style_guide.md)
 *
 * Server Component
 */

import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  href: string;
}

export function FeatureCard({ icon: Icon, title, description, href }: FeatureCardProps) {
  return (
    <Link
      href={href}
      className="group block rounded-radius-0-5 border border-brand-grey-400 bg-swatch-light p-space-8 shadow-sm transition-all duration-300 hover:border-brand-yellow-200 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-yellow-200 focus-visible:ring-offset-2"
    >
      {/* Icon */}
      <div className="mb-space-4 inline-flex h-12 w-12 items-center justify-center rounded-radius-0-5 bg-brand-yellow-200/10 transition-colors group-hover:bg-brand-yellow-200/20">
        <Icon className="h-6 w-6 text-brand-yellow-200" />
      </div>

      {/* Title */}
      <h3 className="mb-space-3 font-heading text-h4 font-600 transition-colors group-hover:text-brand-yellow-200">
        {title}
      </h3>

      {/* Description */}
      <p className="font-body text-p-16 leading-lh-1-5 text-brand-grey-500">
        {description}
      </p>

      {/* Hover indicator */}
      <div className="mt-space-4 flex items-center gap-space-1 text-brand-yellow-200 opacity-0 transition-opacity group-hover:opacity-100">
        <span className="font-heading text-p-14 font-500">Learn more</span>
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
    </Link>
  );
}
