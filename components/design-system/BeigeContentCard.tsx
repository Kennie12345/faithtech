/**
 * BeigeContentCard Component
 *
 * PRIMARY content card with beige background for main content sections
 * Following FaithTech Design System (docs/style_guide.md)
 *
 * Example from style guide:
 * <div className="bg-brand-grey-300 p-space-6 md:p-space-5 rounded-radius-0-5 flex flex-col gap-space-5">
 */

import React from 'react';
import { cn } from '@/lib/utils';

interface BeigeContentCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'solid' | 'faded'; // solid = grey-300, faded = faded-mid
  size?: 'sm' | 'md' | 'lg';
}

export function BeigeContentCard({
  children,
  variant = 'solid',
  size = 'md',
  className,
  ...props
}: BeigeContentCardProps) {
  return (
    <div
      className={cn(
        // Base styles - following design system
        'rounded-radius-0-5 flex flex-col',

        // Variant styles
        variant === 'solid' && 'bg-brand-grey-300',
        variant === 'faded' && 'bg-swatch-faded-mid',

        // Size styles - responsive padding and gap
        size === 'sm' && 'p-space-4 gap-space-4',
        size === 'md' && 'p-space-6 md:p-space-5 gap-space-5',
        size === 'lg' && 'p-space-7 md:p-space-6 gap-space-6',

        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * BeigeContentCardHeader - For content inside beige cards
 */
export function BeigeContentCardHeader({
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
 * BeigeContentCardTitle - Heading inside beige cards
 */
export function BeigeContentCardTitle({
  children,
  as = 'h2',
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement> & { as?: 'h2' | 'h3' | 'h4' }) {
  const Component = as;
  return (
    <Component
      className={cn(
        'font-heading text-swatch-dark',
        as === 'h2' && 'text-h3',
        as === 'h3' && 'text-h4',
        as === 'h4' && 'text-h5',
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
}

/**
 * BeigeContentCardDescription - Body text inside beige cards
 */
export function BeigeContentCardDescription({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn('font-body text-p-16 leading-lh-1-5 text-swatch-dark', className)}
      {...props}
    >
      {children}
    </p>
  );
}

/**
 * BeigeContentCardActions - Button container inside beige cards
 */
export function BeigeContentCardActions({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex gap-space-2', className)}
      {...props}
    >
      {children}
    </div>
  );
}
