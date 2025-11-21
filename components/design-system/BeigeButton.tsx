/**
 * BeigeButton Component
 *
 * PRIMARY CTA button with beige background
 * Following FaithTech Design System (docs/style_guide.md)
 *
 * Example from style guide:
 * <button className="bg-brand-grey-300 text-swatch-dark px-space-8 py-space-5
 *   rounded-radius-0-5 hover:bg-swatch-faded-mid transition-colors">
 */

import React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '@/lib/utils';

interface BeigeButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'solid' | 'faded'; // solid = grey-300, faded = faded-mid
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  withIcon?: boolean; // Adds gap for icon children
  asChild?: boolean;
}

export function BeigeButton({
  children,
  variant = 'solid',
  size = 'md',
  fullWidth = false,
  withIcon = false,
  asChild = false,
  className,
  ...props
}: BeigeButtonProps) {
  const Comp = asChild ? Slot : 'button';

  return (
    <Comp
      className={cn(
        // Base styles - following design system
        'font-heading font-500 text-swatch-dark rounded-radius-0-5 transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',

        // Variant styles
        variant === 'solid' && 'bg-brand-grey-300 hover:bg-swatch-faded-mid',
        variant === 'faded' && 'bg-swatch-faded-mid hover:bg-brand-grey-300',

        // Size styles - using design system spacing
        size === 'sm' && 'px-space-4 py-space-2 text-p-14',
        size === 'md' && 'px-space-6 py-space-4 text-p-16',
        size === 'lg' && 'px-space-8 py-space-5 text-p-18',

        // Icon support
        withIcon && 'flex items-center gap-space-3',

        // Width
        fullWidth && 'w-full',

        // Disabled state
        'disabled:opacity-50 disabled:cursor-not-allowed',

        className
      )}
      {...props}
    >
      {children}
    </Comp>
  );
}
