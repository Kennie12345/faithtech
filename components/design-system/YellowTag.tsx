/**
 * YellowTag Component
 *
 * FEATURED tag with yellow background for highlighting important items
 * Following FaithTech Design System (docs/style_guide.md)
 *
 * Example from style guide:
 * <div className="bg-brand-yellow-200 px-space-4 py-space-2 rounded-radius-0-5">
 *   <span className="text-swatch-dark text-label-14 font-600">
 */

import React from 'react';
import { cn } from '@/lib/utils';

interface YellowTagProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'bright' | 'primary'; // bright = yellow-100, primary = yellow-200
  size?: 'sm' | 'md';
}

export function YellowTag({
  children,
  variant = 'primary',
  size = 'md',
  className,
  ...props
}: YellowTagProps) {
  return (
    <div
      className={cn(
        // Base styles - following design system
        'inline-block rounded-radius-0-5',

        // Variant styles
        variant === 'bright' && 'bg-brand-yellow-100',
        variant === 'primary' && 'bg-brand-yellow-200',

        // Size styles
        size === 'sm' && 'px-space-3 py-space-1',
        size === 'md' && 'px-space-4 py-space-2',

        className
      )}
      {...props}
    >
      <span
        className={cn(
          'font-heading font-600 text-swatch-dark',
          size === 'sm' && 'text-label-12',
          size === 'md' && 'text-label-14'
        )}
      >
        {children}
      </span>
    </div>
  );
}
