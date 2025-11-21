/**
 * YellowButton Component
 *
 * PRIMARY CTA button with bright yellow background
 * Following FaithTech Design System (docs/style_guide.md)
 *
 * Example from style guide:
 * <button className="bg-brand-yellow-100 text-swatch-dark px-space-6 py-space-4
 *   rounded-radius-0-5 hover:bg-brand-yellow-200 transition-colors">
 */

import React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '@/lib/utils';

interface YellowButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'bright' | 'primary'; // bright = yellow-100, primary = yellow-200
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  asChild?: boolean;
}

export function YellowButton({
  children,
  variant = 'bright',
  size = 'md',
  fullWidth = false,
  asChild = false,
  className,
  ...props
}: YellowButtonProps) {
  const Comp = asChild ? Slot : 'button';

  return (
    <Comp
      className={cn(
        // Base styles - following design system
        'font-heading font-500 text-swatch-dark rounded-radius-0-5 transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',

        // Variant styles
        variant === 'bright' && 'bg-brand-yellow-100 hover:bg-brand-yellow-200',
        variant === 'primary' && 'bg-brand-yellow-200 hover:bg-brand-yellow-100',

        // Size styles - using design system spacing
        size === 'sm' && 'px-space-4 py-space-2 text-p-14',
        size === 'md' && 'px-space-6 py-space-4 text-p-16',
        size === 'lg' && 'px-space-8 py-space-5 text-p-18',

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
