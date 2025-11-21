/**
 * Container Component
 *
 * MAX-WIDTH container following FaithTech Design System
 * Following FaithTech Design System (docs/style_guide.md)
 *
 * Container widths from style guide:
 * - main: 90rem (1440px)
 * - large: 80rem (1280px)
 * - small: 90rem (1440px)
 */

import React from 'react';
import { cn } from '@/lib/utils';

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  size?: 'main' | 'large' | 'small';
  noPadding?: boolean;
}

export function Container({
  children,
  size = 'main',
  noPadding = false,
  className,
  ...props
}: ContainerProps) {
  return (
    <div
      className={cn(
        // Base styles
        'mx-auto',

        // Size variants - using design system container widths
        size === 'main' && 'max-w-container-main',
        size === 'large' && 'max-w-container-large',
        size === 'small' && 'max-w-container-small',

        // Responsive padding (unless disabled)
        !noPadding && 'px-space-4 md:px-space-6',

        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
