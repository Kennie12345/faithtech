/**
 * BlueLabel Component
 *
 * INFO label with blue background for categories and tags
 * Following FaithTech Design System (docs/style_guide.md)
 *
 * Example from style guide:
 * <div className="bg-brand-blue-200 px-space-3 py-space-2 rounded-radius-0-25">
 *   <span className="text-swatch-light uppercase text-label-12 tracking-ls-6">
 */

import React from 'react';
import { cn } from '@/lib/utils';

interface BlueLabelProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'dark' | 'light'; // dark = blue-200, light = blue-100
  size?: 'sm' | 'md';
  uppercase?: boolean;
}

export function BlueLabel({
  children,
  variant = 'dark',
  size = 'md',
  uppercase = true,
  className,
  ...props
}: BlueLabelProps) {
  return (
    <div
      className={cn(
        // Base styles - following design system
        'inline-block rounded-radius-0-25',

        // Variant styles
        variant === 'dark' && 'bg-brand-blue-200',
        variant === 'light' && 'bg-brand-blue-100',

        // Size styles
        size === 'sm' && 'px-space-2 py-space-1',
        size === 'md' && 'px-space-3 py-space-2',

        className
      )}
      {...props}
    >
      <span
        className={cn(
          'font-heading tracking-ls-6',
          variant === 'dark' && 'text-swatch-light',
          variant === 'light' && 'text-swatch-dark',
          size === 'sm' && 'text-label-12',
          size === 'md' && 'text-label-14',
          uppercase && 'uppercase'
        )}
      >
        {children}
      </span>
    </div>
  );
}
