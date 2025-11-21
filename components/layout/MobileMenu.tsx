/**
 * MobileMenu Component
 *
 * Mobile navigation drawer for SiteNav
 * Opens as a sheet from the right side on mobile devices
 *
 * Client Component - uses useState for open/close state
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import type { City } from '@/lib/core/api';
import { Menu } from 'lucide-react';

interface MobileMenuProps {
  mode?: 'simple' | 'comprehensive';
  currentCity?: City;
  isAuthenticated: boolean;
}

export function MobileMenu({ mode = 'simple', currentCity, isAuthenticated }: MobileMenuProps) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          className="inline-flex items-center justify-center rounded-md p-2 transition-colors hover:bg-accent md:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-6 w-6" />
        </button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[300px] sm:w-[400px]">
        <SheetHeader>
          <SheetTitle className="font-serif text-xl">
            {currentCity ? `FaithTech ${currentCity.name}` : 'FaithTech'}
          </SheetTitle>
        </SheetHeader>
        <nav className="mt-8 flex flex-col gap-4">
          {mode === 'simple' && currentCity ? (
            <>
              <Link
                href={`/${currentCity.slug}/events`}
                className="text-base font-medium transition-colors hover:text-primary"
                onClick={() => setOpen(false)}
              >
                Events
              </Link>
              <Link
                href={`/${currentCity.slug}/projects`}
                className="text-base font-medium transition-colors hover:text-primary"
                onClick={() => setOpen(false)}
              >
                Projects
              </Link>
              <Link
                href={`/${currentCity.slug}/blog`}
                className="text-base font-medium transition-colors hover:text-primary"
                onClick={() => setOpen(false)}
              >
                Blog
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/#cities"
                className="text-base font-medium transition-colors hover:text-primary"
                onClick={() => setOpen(false)}
              >
                Cities
              </Link>
              <Link
                href="/#features"
                className="text-base font-medium transition-colors hover:text-primary"
                onClick={() => setOpen(false)}
              >
                Features
              </Link>
              <Link
                href="/#about"
                className="text-base font-medium transition-colors hover:text-primary"
                onClick={() => setOpen(false)}
              >
                About
              </Link>
            </>
          )}

          <div className="my-4 border-t border-border"></div>

          {isAuthenticated ? (
            <Button asChild className="w-full">
              <Link href="/protected" onClick={() => setOpen(false)}>
                Dashboard
              </Link>
            </Button>
          ) : (
            <div className="flex flex-col gap-2">
              <Button asChild variant="outline" className="w-full">
                <Link href="/auth/login" onClick={() => setOpen(false)}>
                  Login
                </Link>
              </Button>
              <Button asChild className="w-full">
                <Link href="/auth/sign-up" onClick={() => setOpen(false)}>
                  Sign Up
                </Link>
              </Button>
            </div>
          )}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
