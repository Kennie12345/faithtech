/**
 * HeroSection Component
 *
 * Reusable hero section for both root and city homepages
 * Supports:
 * - Optional eyebrow text (accent font)
 * - Large heading with design system typography
 * - Description text
 * - Multiple CTA buttons using design system buttons
 * - Optional background image with overlay
 * - Left or center alignment
 *
 * Following FaithTech Design System (docs/style_guide.md)
 *
 * Server Component
 */

import Link from 'next/link';
import Image from 'next/image';
import { YellowButton, BeigeButton, Container } from '@/components/design-system';
import { cn } from '@/lib/utils';

interface CTAButton {
  label: string;
  href: string;
  variant?: 'yellow' | 'beige' | 'beige-faded' | 'blue';
}

interface HeroSectionProps {
  eyebrow?: string;
  title: string;
  description: string;
  ctas: CTAButton[];
  backgroundImage?: string;
  overlay?: boolean;
  alignment?: 'left' | 'center';
  className?: string;
}

export function HeroSection({
  eyebrow,
  title,
  description,
  ctas,
  backgroundImage,
  overlay = true,
  alignment = 'left',
  className,
}: HeroSectionProps) {
  const containerClasses = cn(
    'relative w-full',
    backgroundImage ? 'min-h-[500px] md:min-h-[600px]' : 'bg-brand-grey-100',
    className
  );

  const contentClasses = cn(
    'relative z-10 mx-auto flex flex-col py-space-9 md:py-space-10',
    alignment === 'center' && 'items-center text-center',
    alignment === 'left' && 'items-start text-left'
  );

  const textClasses = cn(
    'space-y-space-6',
    alignment === 'center' ? 'max-w-4xl' : 'max-w-3xl'
  );

  return (
    <section className={containerClasses}>
      {/* Background Image */}
      {backgroundImage && (
        <>
          <Image
            src={backgroundImage}
            alt=""
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          {overlay && (
            <div className="absolute inset-0 bg-gradient-to-t from-swatch-dark/80 via-swatch-dark/50 to-swatch-dark/30" />
          )}
        </>
      )}

      {/* Content */}
      <Container size="large">
        <div className={contentClasses}>
          <div className={textClasses}>
            {/* Eyebrow */}
            {eyebrow && (
              <span className="font-accent text-p-18 italic text-brand-grey-500 md:text-p-20">
                {eyebrow}
              </span>
            )}

            {/* Title */}
            <h1
              className={cn(
                'font-heading text-h1 font-400 leading-lh-1-1 tracking-ls-3',
                backgroundImage && overlay && 'text-swatch-light'
              )}
            >
              {title}
            </h1>

            {/* Description */}
            <p
              className={cn(
                'font-body text-p-16 leading-lh-1-5 md:text-p-18',
                backgroundImage && overlay
                  ? 'text-brand-grey-100'
                  : 'text-swatch-dark'
              )}
            >
              {description}
            </p>

            {/* CTAs */}
            {ctas.length > 0 && (
              <div className="flex flex-col gap-space-4 pt-space-2 sm:flex-row">
                {ctas.map((cta, index) => {
                  // Map variants to design system buttons
                  if (cta.variant === 'yellow') {
                    return (
                      <YellowButton key={index} size="lg" asChild>
                        <Link href={cta.href}>{cta.label}</Link>
                      </YellowButton>
                    );
                  } else if (cta.variant === 'beige-faded') {
                    return (
                      <BeigeButton key={index} size="lg" variant="faded" asChild>
                        <Link href={cta.href}>{cta.label}</Link>
                      </BeigeButton>
                    );
                  } else {
                    // Default to beige solid
                    return (
                      <BeigeButton key={index} size="lg" asChild>
                        <Link href={cta.href}>{cta.label}</Link>
                      </BeigeButton>
                    );
                  }
                })}
              </div>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}
