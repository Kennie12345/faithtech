/**
 * YellowPopupCard Component
 *
 * HIGHLIGHT card with bright yellow background for important callouts
 * Following FaithTech Design System (docs/style_guide.md)
 *
 * Example from style guide:
 * <div className="bg-brand-yellow-100 p-space-5 rounded-radius-0-5 flex flex-col gap-space-5">
 */

import React from 'react';
import { cn } from '@/lib/utils';

interface YellowPopupCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export function YellowPopupCard({
  children,
  size = 'md',
  className,
  ...props
}: YellowPopupCardProps) {
  return (
    <div
      className={cn(
        // Base styles - following design system
        'bg-brand-yellow-100 rounded-radius-0-5 flex flex-col',

        // Size styles - padding and gap from design system
        size === 'sm' && 'p-space-4 gap-space-4',
        size === 'md' && 'p-space-5 gap-space-5',
        size === 'lg' && 'p-space-6 gap-space-6',

        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * YellowPopupCardHeader - For labels and headings inside yellow cards
 */
export function YellowPopupCardHeader({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex flex-col gap-space-4', className)}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * YellowPopupCardTitle - Heading inside yellow cards
 */
export function YellowPopupCardTitle({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn('font-heading text-h4 text-swatch-dark', className)}
      {...props}
    >
      {children}
    </h3>
  );
}
