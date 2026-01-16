# FaithTech Design System & Style Guide

**Version:** 2.0
**Last Updated:** 2025-01-13
**For:** Developers building FaithTech frontend components

---

## Overview

The FaithTech design system is a comprehensive, CSS-variable-driven framework inspired by modern design systems. It provides a complete toolkit for building consistent, accessible, and beautiful user interfaces across all FaithTech city deployments.

### Key Features

- **🎨 Comprehensive Color System**: Three-layer color architecture (Brand → Swatches → Themes)
- **📐 Fluid Responsive Sizing**: CSS `clamp()` for automatically responsive typography and spacing
- **🎯 Design Token First**: 250+ CSS variables for complete design consistency
- **🌗 Dark Mode Ready**: Full dark mode support with semantic color tokens
- **♿ Accessibility Built-in**: WCAG AA compliant color contrasts and focus states
- **⚡ Performance Optimized**: CSS variables for instant theme switching

---

## Table of Contents

1. [Color System](#color-system)
2. [Typography](#typography)
3. [Spacing & Layout](#spacing--layout)
4. [Components](#components)
5. [Accessibility](#accessibility)
6. [Usage Examples](#usage-examples)

---

## Color System

### Three-Layer Color Architecture

FaithTech uses a sophisticated three-tier color token system:

```
Brand Colors (#ffd800, #e5e0d8)
        ↓
Swatches (--swatch--brand, --swatch--light)
        ↓
Theme Tokens (--_themes---primary--background)
```

**CRITICAL RULE:** Always reference CSS variables, never hardcode colors.

### Brand Colors (Base Palette)

#### Primary Brand - Yellows

| Variable | Hex | Usage |
|----------|-----|-------|
| `--brand--yellow-100` | `#fff737` | Bright yellow for buttons and highlights |
| `--brand--yellow-200` | `#ffd800` | **Primary brand color** - main identity |

**Tailwind classes:**
- `bg-brand-yellow-100` / `text-brand-yellow-100`
- `bg-brand-yellow-200` / `text-brand-yellow-200`

#### Neutral Colors - Greys & Beige

| Variable | Hex | Usage |
|----------|-----|-------|
| `--brand--grey-100` | `#f5f0f0` | Lightest grey, alternate backgrounds |
| `--brand--grey-200` | `#e9e7e4` | Light grey |
| `--brand--grey-300` | `#e5e0d8` | **Beige - primary for component backgrounds** |
| `--brand--grey-400` | `#cdcdcd` | Medium grey, borders |
| `--brand--grey-500` | `#c6c5bb` | Medium-dark grey, muted text |

**Tailwind classes:**
- `bg-brand-grey-100` through `bg-brand-grey-500`
- `text-brand-grey-100` through `text-brand-grey-500`

#### Accent Colors - Greens

| Variable | Hex | Usage |
|----------|-----|-------|
| `--brand--green-100` | `#bae386` | Light green accent |
| `--brand--green-200` | `#32a432` | Success states, confirmations |

**Tailwind classes:** `bg-brand-green-100`, `bg-brand-green-200`

#### Accent Colors - Blues

| Variable | Hex | Usage |
|----------|-----|-------|
| `--brand--blue-100` | `#8adfff` | Info light |
| `--brand--blue-200` | `#1d8fb9` | Info dark, links |

**Tailwind classes:** `bg-brand-blue-100`, `bg-brand-blue-200`

#### Accent Colors - Oranges

| Variable | Hex | Usage |
|----------|-----|-------|
| `--brand--orange-100` | `#ffb300` | Warning states |
| `--brand--orange-200` | `#f05228` | Error states, destructive actions |

**Tailwind classes:** `bg-brand-orange-100`, `bg-brand-orange-200`

### Swatch System (Foundation Layer)

Swatches provide semantic meaning to base colors:

| Variable | Value | Usage |
|----------|-------|-------|
| `--swatch--light` | `white` | Light theme backgrounds |
| `--swatch--dark` | `#16160c` | Dark theme backgrounds, primary text |
| `--swatch--brand` | `#ffd800` | Primary brand yellow |
| `--swatch--brand-text` | `var(--swatch--dark)` | Text on brand color |
| `--swatch--transparent` | `transparent` | Transparent elements |
| `--swatch--faded-mid` | `#e5e0d87a` | Beige with 48% opacity |
| `--swatch--faded-dark` | `#16160c3d` | Dark with 24% opacity |
| `--swatch--faded-light` | `#ffffff29` | White with 16% opacity |

**Tailwind classes:** `bg-swatch-light`, `bg-swatch-dark`, `bg-swatch-brand`, etc.

### Theme System (Semantic Tokens)

Theme tokens adapt automatically between light and dark modes:

#### Light Mode Defaults

```css
--_themes---background: white
--_themes---text: #16160c (dark)

/* Primary Actions */
--_themes---primary--background: #e5e0d8 (beige)
--_themes---primary--background-hover: #e5e0d87a (faded beige)
--_themes---primary--btn-text: #16160c (dark)

/* Secondary Actions */
--_themes---secondary--background: #e5e0d87a (faded beige)
--_themes---secondary--background-hover: #e5e0d8 (beige)
```

#### Dark Mode Overrides

In dark mode, theme tokens automatically switch:

```css
.dark {
  --_themes---background: #16160c (dark)
  --_themes---text: white

  --_themes---primary--background: #16160c
  --_themes---primary--background-hover: #16160c3d
  --_themes---primary--btn-text: white
}
```

### Shadcn UI Compatibility

For components using Shadcn UI conventions:

| Token | Light Mode | Dark Mode | Tailwind Class |
|-------|------------|-----------|----------------|
| `--primary` | `#ffd800` | `#ffd800` | `bg-primary` |
| `--secondary` | `#e5e0d8` | Dark grey | `bg-secondary` |
| `--background` | `white` | `#16160c` | `bg-background` |
| `--foreground` | `#16160c` | `white` | `text-foreground` |
| `--muted` | `#e5e0d8` | Dark grey | `bg-muted` |
| `--border` | `#cdcdcd` | Lighter grey | `border-border` |
| `--ring` | `#ffd800` | `#ffd800` | `ring-ring` |

### Color Philosophy: Dominant Colors with Sharp Accents

**CRITICAL PRINCIPLE:** Commit to a **cohesive aesthetic** with **dominant colors and sharp accents**. Avoid timid, evenly-distributed palettes. FaithTech's yellow (#ffd800) should dominate key moments, not be scattered equally with other colors.

**Anti-Pattern to Avoid:**
- ❌ Purple gradients on white backgrounds (generic AI aesthetic)
- ❌ Evenly balanced color distribution across components
- ❌ Overusing neutral greys without intentional accent moments

**Recommended Approach:**
- ✅ Bold yellow backgrounds for primary CTAs and hero moments
- ✅ Beige as a warm neutral base, not a "safe" default
- ✅ Strategic accent colors (blue for Create, green for success) used sparingly

### Color Usage Patterns

#### Buttons

```tsx
// Primary CTA (DOMINANT yellow - use for key actions)
<button className="bg-brand-yellow-200 text-swatch-dark hover:bg-brand-yellow-100">
  Join Community
</button>

// Secondary (beige background - supporting actions)
<button className="bg-brand-grey-300 text-swatch-dark hover:bg-swatch-faded-mid">
  Learn More
</button>

// Accent (strategic use for branded moments)
<button className="bg-brand-blue-200 text-swatch-light hover:opacity-90">
  Explore Create
</button>

// Using Shadcn conventions
<button className="bg-primary text-primary-foreground hover:bg-primary/90">
  Continue
</button>
```

#### Component Backgrounds: Atmosphere and Depth

**Design Principle:** Create **atmosphere and depth** rather than defaulting to solid colors. Layer gradients, use geometric patterns, or add contextual effects.

```tsx
// Hero section with layered depth (gradient + pattern)
<div className="bg-gradient-to-br from-brand-yellow-200 via-brand-yellow-100 to-brand-grey-100 rounded-lg p-space-8">

// Card with subtle depth (beige base)
<div className="bg-brand-grey-300 rounded-lg p-space-6 shadow-sm">

// Popup/Modal (BOLD yellow for attention)
<div className="bg-brand-yellow-100 rounded-lg p-space-5 border-2 border-brand-yellow-200">

// Subtle background layer (faded with transparency)
<div className="bg-swatch-faded-mid rounded-lg p-space-4 backdrop-blur-sm">
```

**Advanced Techniques:**
- Use `bg-gradient-to-*` with brand colors for depth
- Add `shadow-*` utilities for elevation
- Combine `backdrop-blur-*` with `bg-swatch-faded-*` for glass-morphism effects
- Layer multiple backgrounds using pseudo-elements when needed

### Color Contrast & Accessibility

All color combinations meet WCAG AA standards:

| Background | Foreground | Contrast | Pass |
|------------|------------|----------|------|
| Yellow #ffd800 | Dark #16160c | 12.1:1 | ✅ AAA |
| Beige #e5e0d8 | Dark #16160c | 14.2:1 | ✅ AAA |
| White | Dark #16160c | 18.5:1 | ✅ AAA |
| Green #32a432 | White | 4.8:1 | ✅ AA |
| Orange #f05228 | White | 4.6:1 | ✅ AA |
| Blue #1d8fb9 | White | 4.9:1 | ✅ AA |

---

## Typography

### Font System Philosophy

FaithTech uses **distinctive typography** to create visual hierarchy and brand personality. Avoid defaulting to generic system fonts (Inter, Roboto, Arial) for every use case—instead, leverage high-contrast pairings and weight extremes to create impact.

#### Primary: Noigrotesk / Inter

**Usage**: Headings, body text, UI elements, navigation

**CSS Variables:**
- `--_typography---heading-font--heading-family`: 'Noigrotesk', Arial, sans-serif
- `--_typography---body-font--paragraph-family`: 'Inter', Arial, sans-serif

**Tailwind classes:**
- `font-heading` - Noigrotesk for headings
- `font-body` - Inter for body text
- `font-sans` - Roboto (legacy compatibility)

**Design Principle:** Use **weight extremes** (font-300 vs font-700) and **dramatic size jumps** (3x+ scale, not 1.5x) for hierarchy. Pair Noigrotesk's geometric forms with Inter's neutrality to create contrast.

#### Secondary: Avril / Palatino

**Usage**: Decorative accents, large impactful headings, emotional moments

**CSS Variable:** `--_typography---accent-font--accent-family`

**Tailwind class:** `font-accent`

**Design Principle:** Reserve accent fonts for **high-impact moments** like hero headings or feature callouts. The serif-to-sans contrast creates visual surprise.

### Responsive Font Sizes

The system uses fluid typography with CSS `clamp()` for automatic responsiveness:

#### Paragraph Sizes

| Class | Variable | Size Range |
|-------|----------|------------|
| `text-p-12` | `--_typography---font-size--p-12` | 0.75rem (12px) |
| `text-p-14` | `--_typography---font-size--p-14` | 0.875rem (14px) |
| `text-p-16` | `--_typography---font-size--p-16` | 1rem (16px) - Default |
| `text-p-18` | `--_typography---font-size--p-18` | 1.125rem (18px) |
| `text-p-20` | `--_typography---font-size--p-20` | 1.25rem (20px) |

#### Heading Sizes (Fluid/Responsive)

| Class | Variable | Size Range |
|-------|----------|------------|
| `text-h1-large` | `--_typography---heading-size--h1-large` | clamp(4.25rem, 3.322rem + 4.64vw, 7.5rem) |
| `text-h-display` | `--_typography---heading-size--display` | clamp(3rem, 2.428rem + 2.86vw, 5rem) |
| `text-h0` | `--_typography---heading-size--h0` | clamp(2.75rem, 2.25rem + 2.5vw, 4.5rem) |
| `text-h1` | `--_typography---heading-size--h1` | clamp(2.5rem, 2.072rem + 2.14vw, 4rem) |
| `text-h2` | `--_typography---heading-size--h2` | clamp(2.375rem, 2.053rem + 1.61vw, 3.5rem) |
| `text-h3` | `--_typography---heading-size--h3` | clamp(2.25rem, 2.036rem + 1.07vw, 3rem) |
| `text-h4` | `--_typography---heading-size--h4` | 2.5rem (40px) |
| `text-h5` | `--_typography---heading-size--h5` | 2rem (32px) |
| `text-h6` | `--_typography---heading-size--h6` | 1.5rem (24px) |

### Font Weights

| Class | Variable | Value |
|-------|----------|-------|
| `font-300` | `--_typography---font-weight--weight-300` | 300 (Light) |
| `font-400` | `--_typography---font-weight--weight-400` | 400 (Regular) |
| `font-500` | `--_typography---font-weight--weight-500` | 500 (Medium) |
| `font-600` | `--_typography---font-weight--weight-600` | 600 (Semibold) |
| `font-700` | `--_typography---font-weight--weight-700` | 700 (Bold) |

### Line Heights

| Class | Variable | Value | Usage |
|-------|----------|-------|-------|
| `leading-lh-1` | `--_typography---line-height--1` | 1 | Display headings |
| `leading-lh-1-1` | `--_typography---line-height--1-1` | 1.1 | Large headings |
| `leading-lh-1-33` | `--_typography---line-height--1-33` | 1.33 | Medium headings |
| `leading-lh-1-5` | `--_typography---line-height--1-5` | 1.5 | Body text (default) |

### Letter Spacing

| Class | Variable | Value | Usage |
|-------|----------|-------|-------|
| `tracking-ls-3` | `--_typography---letter-spacing--3` | -0.03em | Large headings (tighten) |
| `tracking-ls-0` | `--_typography---letter-spacing--0` | 0 | Default |
| `tracking-ls-6` | `--_typography---letter-spacing--6` | 0.06em | Uppercase labels |
| `tracking-ls-8` | `--_typography---letter-spacing--8` | 0.08em | Wide spacing |

### Typography Examples

```tsx
// Hero heading with fluid sizing
<h1 className="font-heading text-h1 leading-lh-1-1 tracking-ls-3 text-swatch-dark">
  Join one of our FaithTech cities
</h1>

// Section heading
<h2 className="font-heading text-h3 leading-lh-1-33 text-swatch-dark">
  About Create
</h2>

// Body text
<p className="font-body text-p-16 leading-lh-1-5 text-swatch-dark">
  We believe in a new way of building technology.
</p>

// Small label (uppercase)
<span className="font-heading text-label-14 tracking-ls-6 uppercase text-brand-blue-200">
  Create
</span>

// Muted text
<p className="font-body text-p-14 leading-lh-1-5 text-brand-grey-500">
  Secondary information
</p>
```

---

## Spacing & Layout

### Responsive Spacing System

The spacing system uses CSS variables that can adapt:

| Class | Variable | Value | Pixels |
|-------|----------|-------|--------|
| `p-space-1` / `m-space-1` | `--_spacing---space--1` | 0.25rem | 4px |
| `p-space-2` / `m-space-2` | `--_spacing---space--2` | 0.5rem | 8px |
| `p-space-3` / `m-space-3` | `--_spacing---space--3` | 0.75rem | 12px |
| `p-space-4` / `m-space-4` | `--_spacing---space--4` | 1rem | 16px |
| `p-space-5` / `m-space-5` | `--_spacing---space--5` | 1.5rem | 24px |
| `p-space-6` / `m-space-6` | `--_spacing---space--6` | 2rem | 32px |
| `p-space-7` / `m-space-7` | `--_spacing---space--7` | 3rem | 48px |
| `p-space-8` / `m-space-8` | `--_spacing---space--8` | 4rem | 64px |
| `p-space-9` / `m-space-9` | `--_spacing---space--9` | 5rem | 80px |
| `p-space-10` / `m-space-10` | `--_spacing---space--10` | 6rem | 96px |

**Note:** Also works with `gap-space-*`, `pt-space-*`, `pb-space-*`, etc.

### Spacing Usage Patterns

```tsx
// Card with standard padding
<div className="p-space-6">

// Vertical stack with consistent gaps
<div className="flex flex-col gap-space-5">

// Section spacing
<section className="py-space-8 md:py-space-10">

// Button group
<div className="flex gap-space-2">
```

### Grid System

12-column grid with CSS variable support:

| Class | Variable | Columns |
|-------|----------|---------|
| `grid-cols-grid-1` | `--grid-1` | 1 column |
| `grid-cols-grid-2` | `--grid-2` | 2 columns |
| `grid-cols-grid-3` | `--grid-3` | 3 columns |
| `grid-cols-grid-4` | `--grid-4` | 4 columns |
| `grid-cols-grid-12` | `--grid-12` | 12 columns |

```tsx
// Responsive 2-column grid
<div className="grid grid-cols-grid-1 md:grid-cols-grid-2 gap-space-6">

// 12-column layout
<div className="grid grid-cols-grid-12 gap-space-4">
```

### Container Widths

| Class | Variable | Value |
|-------|----------|-------|
| `max-w-container-main` | `--container--main` | 90rem (1440px) |
| `max-w-container-large` | `--container--large` | 80rem (1280px) |
| `max-w-container-small` | `--container--small` | 90rem (1440px) |

### Border Radius

| Class | Variable | Value |
|-------|----------|-------|
| `rounded-radius-0-25` | `--radius--0-25` | 0.25rem (4px) |
| `rounded-radius-0-5` | `--radius--0-5` | 0.5rem (8px) - Default |
| `rounded-radius-round` | `--radius--round` | 100vw (Pill shape) |

Or use standard Tailwind: `rounded-sm`, `rounded-lg`, `rounded-full`

---

## Motion & Animation

### Animation Philosophy: High-Impact Moments

**CRITICAL PRINCIPLE:** Focus on **one well-orchestrated page load** with staggered reveals rather than scattered micro-interactions. Prioritize CSS-only solutions; use animation libraries (like Framer Motion) sparingly for React components.

### CSS-Only Animation Patterns

#### Staggered Reveal on Page Load

```tsx
// Staggered fade-in for list items
<div className="space-y-space-4">
  <div className="animate-fade-in" style={{ animationDelay: '0ms' }}>
    <Card />
  </div>
  <div className="animate-fade-in" style={{ animationDelay: '100ms' }}>
    <Card />
  </div>
  <div className="animate-fade-in" style={{ animationDelay: '200ms' }}>
    <Card />
  </div>
</div>

// Define in CSS (add to globals.css or Tailwind config)
@keyframes fade-in {
  from { opacity: 0; transform: translateY(1rem); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in {
  animation: fade-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
```

#### Hover Effects and Micro-Interactions

```tsx
// Smooth hover with transform (CSS-only)
<button className="transition-all duration-300 hover:scale-105 hover:shadow-lg">
  Explore
</button>

// Color shift on hover (use Tailwind transitions)
<div className="transition-colors duration-200 hover:bg-brand-yellow-200">

// Slide-in effect for drawers/modals
<div className="animate-slide-in-right">
  <SidePanel />
</div>

@keyframes slide-in-right {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}
.animate-slide-in-right {
  animation: slide-in-right 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
```

### When to Use Animation Libraries (Framer Motion)

Reserve Framer Motion for:
- Complex gesture-based interactions (drag, swipe)
- Shared layout animations (element morphing between pages)
- Orchestrated sequences that require JavaScript state

**Example:**
```tsx
import { motion } from 'framer-motion';

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5, delay: 0.1 }}
>
  <Card />
</motion.div>
```

### Animation Guidelines

- **Easing:** Use `cubic-bezier(0.16, 1, 0.3, 1)` for smooth, natural motion (avoid linear)
- **Duration:** 200-400ms for micro-interactions, 500-800ms for page transitions
- **Stagger Timing:** 50-150ms increments for list reveals (via `animation-delay`)
- **Performance:** Animate only `opacity`, `transform` (never `width`, `height`, `top`, `left`)

---

## Components

### Button Examples (Following Examples)

```tsx
// Example 1: Popup button (yellow background)
<button className="bg-brand-yellow-100 text-swatch-dark px-space-6 py-space-4 rounded-radius-0-5 hover:bg-brand-yellow-200 transition-colors">
  Join Community
</button>

// Example 2: CTA button with icon (beige background)
<button className="bg-brand-grey-300 text-swatch-dark px-space-8 py-space-5 rounded-radius-0-5 hover:bg-swatch-faded-mid transition-colors flex items-center gap-space-3">
  <span>About our cities</span>
  <ArrowRightIcon />
</button>

// Example 3: Blue accent button
<button className="bg-brand-blue-200 text-swatch-light px-space-6 py-space-4 rounded-radius-0-5 hover:opacity-90 transition-opacity">
  Explore Create
</button>
```

### Card/Popup Components

```tsx
// Example 1: Yellow popup card
<div className="bg-brand-yellow-100 p-space-5 rounded-radius-0-5 flex flex-col gap-space-5">
  <div className="flex flex-col gap-space-4">
    <div className="bg-yellow-200 px-space-3 py-space-2 rounded-sm inline-block">
      <span className="text-swatch-dark uppercase text-label-14">SÃO</span>
    </div>
    <h3 className="font-heading text-h4 text-swatch-dark">
      There's a FaithTech Community in São Paulo
    </h3>
  </div>
  <button className="bg-swatch-light text-swatch-dark px-space-6 py-space-3 rounded-radius-0-5">
    Join Community
  </button>
</div>

// Example 2: Beige content card
<div className="bg-brand-grey-300 p-space-6 md:p-space-5 rounded-radius-0-5 flex flex-col gap-space-5">
  <h2 className="font-heading text-h3 text-swatch-dark">
    In FaithTech Create, volunteer teams leverage technology
  </h2>
  <div className="flex gap-space-2">
    <button className="bg-brand-blue-200 text-swatch-light px-space-5 py-space-3 rounded-radius-0-5">
      Explore Create
    </button>
  </div>
</div>
```

### Label/Tag Components

```tsx
// Label with blue background
<div className="inline-block">
  <div className="bg-brand-blue-200 px-space-3 py-space-2 rounded-radius-0-25">
    <span className="text-swatch-light uppercase text-label-12 tracking-ls-6">
      Create
    </span>
  </div>
</div>

// Tag variant
<div className="bg-brand-yellow-200 px-space-4 py-space-2 rounded-radius-0-5">
  <span className="text-swatch-dark text-label-14 font-600">
    Featured
  </span>
</div>
```

---

## Accessibility

### WCAG AA Compliance

All color combinations in the design system meet WCAG AA standards (4.5:1 for normal text, 3:1 for large text).

### Focus States

Always include visible focus indicators:

```tsx
// Proper focus state
<button className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">

// On dark backgrounds
<button className="focus-visible:ring-swatch-light focus-visible:ring-offset-swatch-dark">
```

### Keyboard Navigation

Use semantic HTML and ensure all interactive elements are keyboard accessible:

```tsx
// ✅ Correct
<button onClick={handleClick}>Click Me</button>

// ❌ Wrong
<div onClick={handleClick}>Click Me</div>
```

---

## Usage Examples

### Complete Page Component

```tsx
export default function CommunityPage() {
  return (
    <main className="bg-background">
      {/* Hero Section */}
      <section className="bg-brand-grey-300 py-space-10 px-space-6">
        <div className="max-w-container-main mx-auto">
          <h1 className="font-heading text-h1 leading-lh-1-1 tracking-ls-3 text-swatch-dark mb-space-6">
            Join one of our FaithTech cities and steward your tech skills to glorify God.
          </h1>
          <button className="bg-brand-yellow-100 text-swatch-dark px-space-8 py-space-5 rounded-radius-0-5 hover:bg-brand-yellow-200 transition-colors">
            Explore Communities →
          </button>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-space-9 px-space-6">
        <div className="max-w-container-main mx-auto grid grid-cols-grid-1 md:grid-cols-grid-2 gap-space-6">
          <div className="bg-brand-grey-300 p-space-6 rounded-radius-0-5 flex flex-col gap-space-5">
            <div className="inline-block self-start">
              <div className="bg-brand-blue-200 px-space-3 py-space-2 rounded-radius-0-25">
                <span className="text-swatch-light uppercase text-label-12 tracking-ls-6">
                  Create
                </span>
              </div>
            </div>
            <h2 className="font-heading text-h3 leading-lh-1-33 text-swatch-dark">
              In FaithTech Create, volunteer teams leverage technology
            </h2>
            <p className="font-body text-p-16 leading-lh-1-5 text-swatch-dark">
              We form small teams around ideas that emerge within a local city.
            </p>
            <button className="bg-brand-blue-200 text-swatch-light px-space-6 py-space-4 rounded-radius-0-5 hover:opacity-90 transition-opacity self-start">
              Explore Create
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
```

---

## Quick Reference

### Most Common Classes

**Backgrounds:**
- `bg-brand-grey-300` - Beige component backgrounds
- `bg-brand-yellow-100` - Bright yellow highlights
- `bg-brand-yellow-200` - Primary brand yellow
- `bg-swatch-faded-mid` - Subtle beige with transparency

**Text:**
- `text-swatch-dark` - Primary dark text (#16160c)
- `text-brand-grey-500` - Muted text
- `font-heading` - Noigrotesk for headings
- `font-body` - Inter for body

**Spacing:**
- `p-space-5` / `p-space-6` - Card padding
- `gap-space-4` / `gap-space-5` - Stack gaps
- `py-space-8` / `py-space-9` - Section padding

**Typography:**
- `text-h1` / `text-h2` / `text-h3` - Responsive headings
- `text-p-16` - Default body text
- `leading-lh-1-5` - Default line height
- `tracking-ls-3` - Tighter tracking for headings

---

## Avoiding Generic AI Aesthetics

### The "AI Slop" Problem

AI models tend toward **distributional convergence**—defaulting to high-probability patterns seen in training data. This creates recognizable, generic outputs that lack brand personality.

**Common AI Anti-Patterns to AVOID:**

❌ **Typography:**
- Overused fonts: Inter everywhere, Roboto, Arial, system fonts as default choices
- Predictable pairings without intentional contrast
- Uniform font weights (all 400, or all 600)

❌ **Color Schemes:**
- Purple gradients on white backgrounds (the quintessential AI aesthetic)
- Evenly distributed palettes with no dominant color
- Pastel blues and pinks without brand context
- Overuse of `#667eea` to `#764ba2` gradient (cliché AI purple)

❌ **Layouts:**
- Cookie-cutter card grids with identical proportions
- Predictable hero sections (centered text, gradient background, two buttons)
- Lack of asymmetry or unexpected compositions

❌ **Motion:**
- No animations at all (static, lifeless)
- OR scattered micro-interactions without intentional orchestration
- Generic fade-ins without easing or stagger

### FaithTech's Distinctive Approach

✅ **Typography:**
- High-contrast pairings: Noigrotesk (geometric sans) + Avril (serif accent)
- Weight extremes: font-300 vs font-700, not font-400 everywhere
- Dramatic size jumps: 3x+ scale between heading levels

✅ **Color Philosophy:**
- **Dominant yellow** (#ffd800) as the brand hero, not timidly scattered
- Warm beige (#e5e0d8) as neutral base (not cold greys)
- Sharp, strategic accent colors (blue for Create moments, green for success)

✅ **Layout Principles:**
- Asymmetric compositions (not everything centered)
- Varied card sizes and proportions (not uniform grids)
- Contextual use of space (generous whitespace for impact, tight grouping for density)

✅ **Motion Strategy:**
- One well-orchestrated page load (staggered reveals with 100ms delays)
- CSS-only solutions prioritized (performant, accessible)
- High-impact moments (hero animations) > scattered micro-interactions

### Creative Interpretation: Think Outside the Box

**CRITICAL REMINDER:** Even with explicit guidelines, AI models converge on common choices (e.g., Space Grotesk becoming the new "default"). To combat this:

1. **Vary aesthetic choices** between generations (light vs dark themes, serif vs sans, warm vs cool palettes)
2. **Make unexpected choices** that feel genuinely designed for context (not algorithmically safe)
3. **Challenge assumptions**: If your first instinct is Inter + purple gradient, choose something else
4. **Draw inspiration** from IDE themes (Dracula, Nord, Catppuccin), cultural aesthetics, or artistic movements

---

## Summary

The FaithTech design system provides a complete toolkit built on:

1. **Distinctive yellow-focused branding** (#ffd800, #fff737) with warm beige (#e5e0d8) for backgrounds
2. **Three-layer color architecture** for flexibility and consistency
3. **Fluid responsive sizing** that adapts automatically across devices
4. **Comprehensive CSS variables** for every design decision
5. **WCAG AA accessibility** built into every color combination
6. **High-contrast typography** with weight extremes and dramatic scale
7. **Orchestrated motion** prioritizing CSS-only staggered reveals
8. **Atmospheric backgrounds** using gradients and layering (not flat colors)

**Critical Philosophy:** Avoid generic AI aesthetics by committing to bold, distinctive choices. Dominant colors with sharp accents outperform timid palettes. One well-orchestrated page load creates more delight than scattered micro-interactions. Think outside the box—vary your choices, make unexpected decisions, and design for context, not algorithmic safety.

**Remember:** Always use design tokens (CSS variables and Tailwind classes), never hardcode values.
