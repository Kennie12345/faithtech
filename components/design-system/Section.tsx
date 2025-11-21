/**
 * Section Component
 *
 * SECTION wrapper with proper spacing following FaithTech Design System
 * Following FaithTech Design System (docs/style_guide.md)
 */

import React from 'react';
import { cn } from '@/lib/utils';

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  spacing?: 'sm' | 'md' | 'lg' | 'xl';
  as?: 'section' | 'div';
}

export function Section({
  children,
  spacing = 'md',
  as = 'section',
  className,
  ...props
}: SectionProps) {
  const Component = as;

  return (
    <Component
      className={cn(
        // Vertical spacing - using design system tokens
        spacing === 'sm' && 'py-space-6',
        spacing === 'md' && 'py-space-8 md:py-space-9',
        spacing === 'lg' && 'py-space-9 md:py-space-10',
        spacing === 'xl' && 'py-space-10',

        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
}
