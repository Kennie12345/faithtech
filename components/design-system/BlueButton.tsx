/**
 * BlueButton Component
 *
 * ACCENT button with blue background for secondary actions
 * Following FaithTech Design System (docs/style_guide.md)
 *
 * Example from style guide:
 * <button className="bg-brand-blue-200 text-swatch-light px-space-6 py-space-4
 *   rounded-radius-0-5 hover:opacity-90 transition-opacity">
 */

import React from 'react';
import { cn } from '@/lib/utils';

interface BlueButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'dark' | 'light'; // dark = blue-200, light = blue-100
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export function BlueButton({
  children,
  variant = 'dark',
  size = 'md',
  fullWidth = false,
  className,
  ...props
}: BlueButtonProps) {
  return (
    <button
      className={cn(
        // Base styles - following design system
        'font-heading font-500 rounded-radius-0-5 transition-opacity',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',

        // Variant styles
        variant === 'dark' && 'bg-brand-blue-200 text-swatch-light hover:opacity-90',
        variant === 'light' && 'bg-brand-blue-100 text-swatch-dark hover:opacity-90',

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
    </button>
  );
}
