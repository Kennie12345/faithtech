# Distinctive Frontend Design

## Purpose
Combat AI aesthetic convergence by creating distinctive, context-driven frontend designs that avoid generic "AI slop" patterns. This skill enforces FaithTech's bold design philosophy: dominant colors with sharp accents, high-contrast typography, orchestrated motion, and atmospheric backgrounds.

## When to Activate
Activate when:
- Designing new UI components or pages
- Creating hero sections, landing pages, or high-impact moments
- Choosing typography, colors, or animations
- User requests "make this more distinctive" or "avoid generic design"
- Building components that feel too safe or algorithmic

## Core Philosophy: Escape Distributional Convergence

AI models default to high-probability patterns (Inter fonts, purple gradients, centered layouts). **Your mission: make unexpected, context-driven choices that surprise and delight.**

## Typography: High-Contrast Pairings & Weight Extremes

### Principles
- **Weight extremes**: Use font-300 vs font-700, never uniform font-400
- **Dramatic scale jumps**: 3x+ between heading levels, not timid 1.5x
- **High-contrast pairings**: Geometric sans (Noigrotesk) + serif accent (Avril)

### FaithTech System
**Primary**: Noigrotesk (headings), Inter (body)
**Accent**: Avril (hero moments, emotional callouts)

### Anti-Patterns to AVOID
❌ Inter/Roboto/Arial as default everywhere
❌ Space Grotesk (becoming the new "AI default")
❌ Predictable pairings without intentional contrast
❌ Uniform weights across all text

### Implementation
```tsx
// ✅ Hero with weight extremes and accent font
<h1 className="font-accent text-h1 font-300 tracking-ls-3">
  Join one of our FaithTech cities
</h1>
<p className="font-body text-p-20 font-700 text-brand-grey-500">
  Supporting text with bold weight for contrast
</p>

// ✅ Dramatic size jump (h1 → body = 4x scale)
<h1 className="text-h1">Main Heading</h1>  {/* 64px */}
<p className="text-p-16">Body text</p>       {/* 16px = 4x jump */}

// ❌ Avoid timid, uniform typography
<h1 className="font-body text-2xl font-400">Heading</h1>
<p className="font-body text-lg font-400">Text</p>
```

## Color: Dominant Colors with Sharp Accents

### Principles
- **Commit to cohesive aesthetics**: Dominant brand color (yellow #ffd800), not evenly distributed
- **Sharp accents**: Strategic blue for "Create" moments, green for success
- **Warm neutrals**: Beige (#e5e0d8) as base, not cold greys

### Anti-Patterns to AVOID
❌ Purple gradients on white (#667eea to #764ba2)
❌ Evenly balanced color distribution
❌ Pastel blues/pinks without brand context
❌ Generic Tailwind defaults (blue-500, gray-200)

### Implementation
```tsx
// ✅ DOMINANT yellow for primary CTAs (bold choice)
<button className="bg-brand-yellow-200 text-swatch-dark px-space-8 py-space-5 hover:bg-brand-yellow-100 transition-colors">
  Join Community
</button>

// ✅ Strategic accent color (blue = "Create" brand moment)
<div className="inline-block bg-brand-blue-200 px-space-3 py-space-2 rounded-radius-0-25">
  <span className="text-swatch-light uppercase text-label-12 tracking-ls-6">CREATE</span>
</div>

// ✅ Warm beige as neutral base (not cold grey)
<div className="bg-brand-grey-300 p-space-6 rounded-lg">

// ❌ Avoid generic purple gradient
<div className="bg-gradient-to-r from-purple-400 to-pink-600">
```

## Backgrounds: Atmosphere and Depth

### Principles
- **Layer gradients** with brand colors for depth
- **Geometric patterns** or contextual effects
- **Glass-morphism**: Combine backdrop-blur with faded swatches

### Anti-Patterns to AVOID
❌ Flat solid colors everywhere
❌ White backgrounds with no texture
❌ Generic radial gradients

### Implementation
```tsx
// ✅ Layered gradient for hero depth
<section className="bg-gradient-to-br from-brand-yellow-200 via-brand-yellow-100 to-brand-grey-100 py-space-10">

// ✅ Glass-morphism effect
<div className="bg-swatch-faded-mid backdrop-blur-sm rounded-lg p-space-6 shadow-lg">

// ✅ Shadow for elevation (not just borders)
<div className="bg-brand-grey-300 rounded-lg p-space-6 shadow-md hover:shadow-xl transition-shadow">

// ❌ Avoid flat, lifeless backgrounds
<div className="bg-white p-4">
```

## Motion: Orchestrated Reveals over Scattered Micro-Interactions

### Principles
- **One well-orchestrated page load**: Staggered reveals with 100ms delays
- **CSS-only prioritized**: Performant, accessible
- **High-impact moments**: Hero animations > scattered hovers

### Animation Guidelines
- **Easing**: `cubic-bezier(0.16, 1, 0.3, 1)` (never linear)
- **Duration**: 200-400ms (micro), 500-800ms (page transitions)
- **Stagger**: 50-150ms increments via `animation-delay`
- **Performance**: Only animate `opacity`, `transform`

### Implementation
```tsx
// ✅ Staggered reveal on page load
<div className="space-y-space-4">
  <Card className="animate-fade-in" style={{ animationDelay: '0ms' }} />
  <Card className="animate-fade-in" style={{ animationDelay: '100ms' }} />
  <Card className="animate-fade-in" style={{ animationDelay: '200ms' }} />
</div>

// CSS (add to globals.css)
@keyframes fade-in {
  from { opacity: 0; transform: translateY(1rem); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in {
  animation: fade-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

// ✅ High-impact hover (scale + shadow)
<button className="transition-all duration-300 hover:scale-105 hover:shadow-lg">
  Explore
</button>

// ❌ Avoid scattered, generic fade-ins
<div className="fade-in">  {/* No stagger, no easing */}
```

## Layout: Asymmetry and Unexpected Compositions

### Principles
- **Asymmetric compositions**: Not everything centered
- **Varied proportions**: Mixed card sizes, not uniform grids
- **Contextual spacing**: Generous whitespace for impact, tight for density

### Anti-Patterns to AVOID
❌ Cookie-cutter card grids (identical 3-column layouts)
❌ Predictable hero sections (centered text, gradient, two buttons)
❌ Uniform padding/margins everywhere

### Implementation
```tsx
// ✅ Asymmetric grid (varied column spans)
<div className="grid grid-cols-12 gap-space-6">
  <div className="col-span-7 bg-brand-yellow-100 p-space-8">Large feature</div>
  <div className="col-span-5 bg-brand-grey-300 p-space-6">Supporting content</div>
</div>

// ✅ Varied card sizes (not uniform)
<div className="grid grid-cols-3 gap-space-5 auto-rows-auto">
  <Card className="row-span-2" />  {/* Tall card */}
  <Card />                          {/* Standard */}
  <Card />                          {/* Standard */}
</div>

// ❌ Avoid predictable centering
<div className="flex items-center justify-center min-h-screen">
  <div className="text-center max-w-2xl">
    <h1>Centered Title</h1>
    <p>Centered description</p>
    <div className="flex gap-4 justify-center">
      <Button>Primary</Button>
      <Button>Secondary</Button>
    </div>
  </div>
</div>
```

## Critical Reminder: Think Outside the Box

**Even with explicit guidelines, you will converge on common choices.** To combat this:

1. **Vary aesthetic choices**: Alternate light/dark themes, serif/sans, warm/cool palettes
2. **Make unexpected choices**: If first instinct is Inter + centered layout, choose differently
3. **Challenge assumptions**: "Is this the algorithmic safe choice, or genuinely designed for context?"
4. **Draw inspiration**: IDE themes (Dracula, Nord, Catppuccin), cultural aesthetics, artistic movements

## Enforcement Checklist

Before presenting frontend code, verify:

- [ ] **Typography**: Using weight extremes (300 vs 700)? Dramatic size jumps (3x+)? Accent font for hero moments?
- [ ] **Color**: Dominant yellow for CTAs? Strategic accents (blue/green)? Warm beige base (not cold grey)?
- [ ] **Backgrounds**: Gradients/patterns for depth? Not flat white/grey?
- [ ] **Motion**: Staggered reveals with delays? CSS-only? Proper easing?
- [ ] **Layout**: Asymmetric composition? Varied proportions? Not cookie-cutter centered?
- [ ] **Anti-Patterns Avoided**: No purple gradients? No Inter everywhere? No uniform grids?

## FaithTech Design Tokens Reference

### Colors (Use These, Not Defaults)
- **Primary CTA**: `bg-brand-yellow-200` (#ffd800)
- **Secondary**: `bg-brand-grey-300` (#e5e0d8 beige)
- **Accent - Create**: `bg-brand-blue-200` (#1d8fb9)
- **Accent - Success**: `bg-brand-green-200` (#32a432)
- **Text**: `text-swatch-dark` (#16160c)

### Typography (Use These Classes)
- **Headings**: `font-heading` (Noigrotesk), `font-accent` (Avril for hero)
- **Body**: `font-body` (Inter)
- **Sizes**: `text-h1` (fluid 64px), `text-h2`, `text-p-16`
- **Weights**: `font-300`, `font-700` (extremes, not font-400)
- **Tracking**: `tracking-ls-3` (tight for headings)

### Spacing
- **Padding**: `p-space-6` (32px), `p-space-8` (64px)
- **Gaps**: `gap-space-5` (24px)
- **Sections**: `py-space-9` (80px), `py-space-10` (96px)

### Animation
- **Easing**: `cubic-bezier(0.16, 1, 0.3, 1)`
- **Duration**: `duration-300` (micro), `duration-500` (transitions)
- **Stagger**: 50-150ms via inline `style={{ animationDelay }}`

## Success Criteria

UI feels:
- ✅ **Distinctive**: Immediately recognizable as FaithTech, not generic AI
- ✅ **Bold**: Dominant yellow, weight extremes, dramatic scale
- ✅ **Orchestrated**: Smooth page load with staggered reveals
- ✅ **Atmospheric**: Depth via gradients, shadows, glass-morphism
- ✅ **Unexpected**: Asymmetric layouts, varied proportions

UI avoids:
- ❌ Purple gradients, Inter defaults, centered everything
- ❌ Uniform grids, flat backgrounds, scattered animations
- ❌ Generic, algorithmic, "safe" design choices
