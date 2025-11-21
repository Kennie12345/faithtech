/**
 * Grid Component
 *
 * GRID layout following FaithTech Design System
 * Following FaithTech Design System (docs/style_guide.md)
 *
 * Uses grid-cols-grid-* classes from design system (1-12 columns)
 */

import React from 'react';
import { cn } from '@/lib/utils';

interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  cols?: 1 | 2 | 3 | 4 | 12;
  mdCols?: 1 | 2 | 3 | 4 | 12;
  lgCols?: 1 | 2 | 3 | 4 | 12;
  gap?: 'sm' | 'md' | 'lg';
}

export function Grid({
  children,
  cols = 1,
  mdCols,
  lgCols,
  gap = 'md',
  className,
  ...props
}: GridProps) {
  return (
    <div
      className={cn(
        // Base grid
        'grid',

        // Column spans - using design system grid tokens
        cols === 1 && 'grid-cols-grid-1',
        cols === 2 && 'grid-cols-grid-2',
        cols === 3 && 'grid-cols-grid-3',
        cols === 4 && 'grid-cols-grid-4',
        cols === 12 && 'grid-cols-grid-12',

        // Medium breakpoint columns
        mdCols === 1 && 'md:grid-cols-grid-1',
        mdCols === 2 && 'md:grid-cols-grid-2',
        mdCols === 3 && 'md:grid-cols-grid-3',
        mdCols === 4 && 'md:grid-cols-grid-4',
        mdCols === 12 && 'md:grid-cols-grid-12',

        // Large breakpoint columns
        lgCols === 1 && 'lg:grid-cols-grid-1',
        lgCols === 2 && 'lg:grid-cols-grid-2',
        lgCols === 3 && 'lg:grid-cols-grid-3',
        lgCols === 4 && 'lg:grid-cols-grid-4',
        lgCols === 12 && 'lg:grid-cols-grid-12',

        // Gap - using design system spacing
        gap === 'sm' && 'gap-space-4',
        gap === 'md' && 'gap-space-6',
        gap === 'lg' && 'gap-space-8',

        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
