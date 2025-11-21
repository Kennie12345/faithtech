# Homepage Design Specification

**Feature:** Regional Hub Homepage
**Status:** ✅ Implemented (Phase 3, Task 42-44)
**Date:** 2025-01-13

---

## Overview

The homepage serves as the primary entry point for the FaithTech Regional Hub platform. It implements a **geo-location aware routing strategy** that automatically directs users to their local city community when possible, or presents a city directory for manual selection.

### Design Goals

1. **Welcoming & Mission-Driven**: Clearly communicate FaithTech's purpose and values
2. **Geo-Intelligent**: Route users to relevant content based on location
3. **Multi-Tenant Aware**: Support both single-city and multi-city deployments
4. **Feature Discovery**: Highlight Events, Projects, and Blog capabilities
5. **Conversion-Focused**: Drive users to join their local community
6. **Brand-Consistent**: Follow FaithTech style guide precisely
7. **Accessible & Responsive**: WCAG AA compliance, mobile-first design

---

## Routing Strategy

### Geo-Location Detection

**Implementation:** Vercel Edge Network geo headers

```typescript
// Pseudocode
const geo = request.geo; // { city, country, region }
const detectedCity = await matchGeoToCity(geo);

if (detectedCity) {
  redirect(`/${detectedCity.slug}`);
} else {
  // Render city directory page
}
```

**Decision Rationale:**
- **Server-side detection** via Vercel geo headers (no client permission required)
- **Privacy-friendly**: IP-based approximation, no precise tracking
- **Fallback-safe**: Defaults to directory page if geo unavailable
- **Override option**: Users can manually select different city anytime

**Documented Decision:** This approach balances user experience (automatic routing) with privacy (no browser geolocation API) and reliability (always has fallback). For local development where geo headers are unavailable, the directory page is shown.

### Route Architecture

```
/ (Root)
├─ Geo-detect → ✅ Match → Redirect to /[citySlug]
└─ Geo-detect → ❌ No match → Render Directory Page

/[citySlug] (City Homepage)
├─ Validate city exists
├─ Render city-specific homepage
└─ 404 if city not found
```

---

## Page Specifications

### 1. Root Homepage (Multi-City Directory)

**Route:** `/`
**Component:** `app/page.tsx`
**Type:** Server Component
**Purpose:** Global landing page showcasing all FaithTech cities

#### Sections

##### 1.1 Hero Section
**Design:**
- Full-width section with light grey background (`bg-background-alt`)
- Large serif heading using Palatino Linotype
- Eyebrow text using Tangerine (decorative font)
- Two-column layout: Text (left) + Image/Visual (right) on desktop
- Centered single column on mobile

**Content:**
```
Eyebrow: "A Global Movement" (font-decorative, italic)
Heading: "We exist to see a Jesus revival awakened in and through tech" (font-serif, text-5xl md:text-6xl lg:text-7xl)
Description: "FaithTech is a practicing community connecting Christian technologists across cities and regions to redemptively change the world."
CTAs:
  - "Explore Cities" (primary)
  - "Learn More" (secondary/ghost)
```

**Styling:**
- Container: `max-w-6xl mx-auto`
- Padding: `py-16 md:py-20 lg:py-24`
- Text max-width: `max-w-3xl`
- CTA gap: `gap-4`

##### 1.2 City Directory
**Design:**
- Grid of city cards with hero images
- 1 column mobile, 2 columns tablet, 3 columns desktop
- Consistent card height for visual harmony

**Card Structure:**
- City hero image as background (Unsplash)
- Dark gradient overlay for text readability
- City name (text-3xl font-serif)
- Member count badge
- Hover: Shadow elevation + subtle scale

**Styling:**
```tsx
grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6
Card: h-64 rounded-xl overflow-hidden
Overlay: bg-gradient-to-t from-dark/80 to-dark/20
```

##### 1.3 Feature Highlights
**Design:**
- 3-column grid showcasing platform capabilities
- Icon + Title + Description per feature
- Subtle hover effects

**Features:**
1. **Events & Gatherings** (Calendar icon)
2. **Project Showcase** (Rocket icon)
3. **Blog & Resources** (BookOpen icon)

**Styling:**
```tsx
grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6
Card: bg-light border rounded-xl p-8
Icon: w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center
Hover: border-primary transition-colors
```

##### 1.4 Mission & Values Section
**Design:**
- Two-column layout (text + visual element)
- Serif heading for impact
- Body text with generous line-height

**Content: "The Stone Soup Strategy"**
```
"We're building something compelling that others want to contribute to.
By creating an excellent platform for FaithTech Australia, we attract
developers worldwide to build features that benefit all cities."

Principles:
- Stable core, flexible periphery
- Plugin ecosystem for extensibility
- Global collaboration, local impact
- Excellence in execution
```

**Styling:**
- 2-col grid: `grid-cols-1 lg:grid-cols-2 gap-12`
- Text side: `max-w-2xl`
- Visual: Stats or illustration

##### 1.5 Global Stats Display
**Design:**
- Centered stats grid
- Large numbers with small labels
- 2x2 grid mobile, 1x4 row desktop

**Stats (Real-Time Aggregation):**
- Total Cities Active
- Total Community Members
- Total Projects Built
- Total Events This Year

**Styling:**
```tsx
grid-cols-2 md:grid-cols-4 gap-8
Stat: text-center
Number: text-4xl md:text-5xl font-bold text-primary
Label: text-sm text-muted-foreground uppercase tracking-wide
```

##### 1.6 Call-to-Action Section
**Design:**
- Full-width section with primary background
- Centered content
- Large heading + supporting text + button(s)

**Content:**
```
Heading: "Join the Movement"
Text: "Whether you're a developer, designer, or technologist, there's a place for you in the FaithTech community."
CTAs:
  - "Find Your City" (primary white button)
  - "Start a New City" (secondary outline button)
```

**Styling:**
```tsx
bg-primary text-primary-foreground
py-16 md:py-20
max-w-4xl mx-auto text-center
```

##### 1.7 Footer
**Design:**
- Light grey background (`bg-background-alt`)
- 4-column grid desktop, stacked mobile
- Newsletter signup integration (placeholder)

**Columns:**
1. **About** - Logo, brief description, social links
2. **Quick Links** - Cities, Events, Projects, Blog, Admin
3. **Resources** - Documentation, GitHub, Support, Contact
4. **Newsletter** - Email signup form (placeholder UI)

**Footer Bottom:**
- Copyright notice
- Privacy Policy / Terms links
- Theme switcher

---

### 2. City Homepage

**Route:** `/[citySlug]`
**Component:** `app/[citySlug]/page.tsx`
**Type:** Server Component
**Purpose:** City-specific community homepage

#### Validation
```typescript
const city = await getCityBySlug(params.citySlug);
if (!city || !city.is_active) {
  notFound(); // 404
}
```

#### Sections

##### 2.1 City Hero
**Design:**
- City hero image as background (parallax optional)
- Dark overlay for text contrast
- City name as large serif heading
- City-specific tagline or about excerpt
- Primary CTAs

**Content:**
```
Eyebrow: "FaithTech {CityName}"
Heading: "Connecting Christian Technologists in {CityName}"
Description: {city.about_markdown excerpt - first 200 chars}
CTAs:
  - "Join Our Community" (primary)
  - "Upcoming Events" (secondary)
```

**Styling:**
```tsx
min-h-[500px] md:min-h-[600px]
bg-cover bg-center bg-no-repeat
Overlay: bg-dark/70
Text: text-white with proper contrast
```

##### 2.2 Featured Events (Upcoming)
**Design:**
- Horizontal scroll on mobile, grid on desktop
- 3 featured/upcoming events max
- "View All Events" link

**Query:**
```typescript
const events = await getEvents(city.id, {
  featuredOnly: true,
  upcomingOnly: true,
  limit: 3
});
// Fallback to recent if no featured
```

**Empty State:**
```
"No upcoming events yet. Check back soon!"
```

##### 2.3 Featured Projects
**Design:**
- Grid of project cards
- 3 projects max (featured or recent)
- Project image, title, description excerpt

**Query:**
```typescript
const projects = await getProjects(city.id, {
  featured: true,
  limit: 3
});
```

##### 2.4 Latest Blog Posts
**Design:**
- List or grid of recent posts
- 3 posts max
- Post card: Title, excerpt, date, author, "Read More"

**Query:**
```typescript
const posts = await getPosts(city.id, {
  status: 'published',
  limit: 3,
  orderBy: 'created_at'
});
```

##### 2.5 Community Stats
**Design:**
- Centered grid similar to global stats
- City-specific counts

**Stats (City-Level Aggregation):**
- X Active Members
- X Events This Year
- X Projects Built
- X Blog Posts Published

**Query:**
```typescript
const stats = await getCityStats(city.id);
// Real-time COUNT queries
```

##### 2.6 Join/Get Involved CTA
**Design:**
- Similar to root CTA but city-specific
- Background: City accent color or primary

**Content:**
```
Heading: "Join the {CityName} Community"
Text: "Connect with Christian technologists in your city. Attend events, collaborate on projects, and grow in faith and tech together."
CTA: "Sign Up Now" (links to /auth/sign-up with city pre-selected)
```

##### 2.7 Footer
**Design:**
- Same footer component as root
- City-specific links where applicable
- Newsletter signup (placeholder)

---

## Component Breakdown

### Layout Components

#### `components/layout/SiteNav.tsx`
**Type:** Server Component
**Purpose:** Primary navigation for public pages

**Props:**
```typescript
interface SiteNavProps {
  mode: 'simple' | 'comprehensive';
  currentCity?: City;
}
```

**Modes:**
- **Simple** (City pages): Logo, Events, Projects, Blog, Login, Theme
- **Comprehensive** (Root page): Add Cities dropdown, Resources dropdown

**Behavior:**
- Sticky positioning (`sticky top-0 z-50`)
- Responsive: Hamburger menu on mobile, full nav on desktop
- Active link highlighting
- City switcher dropdown (if user belongs to multiple cities)

**Styling:**
```tsx
border-b border-border bg-background/95 backdrop-blur
h-16 flex items-center
```

#### `components/layout/SiteFooter.tsx`
**Type:** Server Component
**Purpose:** Site-wide footer with links and newsletter

**Props:**
```typescript
interface SiteFooterProps {
  showNewsletter?: boolean;
  currentCity?: City;
}
```

**Structure:**
- 4-column grid (responsive stack)
- Columns: About, Quick Links, Resources, Newsletter
- Footer bottom: Copyright, legal links, theme switcher

**Styling:**
```tsx
bg-background-alt border-t border-border
py-12 md:py-16
grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8
```

---

### Homepage Components

#### `components/homepage/HeroSection.tsx`
**Type:** Server Component
**Purpose:** Reusable hero section for both root and city pages

**Props:**
```typescript
interface HeroSectionProps {
  eyebrow?: string;
  title: string;
  description: string;
  ctas: Array<{
    label: string;
    href: string;
    variant: 'default' | 'secondary' | 'ghost';
  }>;
  backgroundImage?: string;
  overlay?: boolean;
  alignment?: 'left' | 'center';
}
```

**Styling:**
- Responsive typography scale: `text-4xl → text-7xl`
- Padding: `py-16 md:py-20 lg:py-24`
- Background: Image with overlay or solid color
- Eyebrow: `font-decorative text-lg italic`
- Title: `font-serif leading-tight`

#### `components/homepage/CityCard.tsx`
**Type:** Server Component
**Purpose:** City selector card for directory

**Props:**
```typescript
interface CityCardProps {
  city: {
    name: string;
    slug: string;
    hero_image_url: string | null;
    accent_color: string;
  };
  memberCount: number;
}
```

**Design:**
- Card height: `h-64`
- Background: City hero image or gradient fallback
- Overlay: Dark gradient from bottom
- Content: City name (serif), member count badge
- Hover: `shadow-lg scale-[1.02] transition-transform`

**Link:** Wraps entire card linking to `/[citySlug]`

#### `components/homepage/FeatureCard.tsx`
**Type:** Server Component
**Purpose:** Feature highlight card with icon

**Props:**
```typescript
interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  href: string;
}
```

**Design:**
- Icon container: `w-12 h-12 bg-primary/10 rounded-lg`
- Card: `bg-light border border-border rounded-xl p-8`
- Hover: `border-primary transition-colors`
- Title: `font-sans text-2xl font-semibold`

#### `components/homepage/StatsDisplay.tsx`
**Type:** Server Component
**Purpose:** Statistics grid with real-time counts

**Props:**
```typescript
interface StatsDisplayProps {
  stats: Array<{
    label: string;
    value: number;
  }>;
}
```

**Design:**
- Grid: `grid-cols-2 md:grid-cols-4 gap-8`
- Number: `text-4xl md:text-5xl font-bold text-primary`
- Label: `text-sm text-muted-foreground uppercase tracking-wide`
- Center-aligned

**Data Source:** Fetches via CoreAPI `getCityStats()` or `getGlobalStats()`

#### `components/homepage/FeaturedEvents.tsx`
**Type:** Server Component
**Purpose:** Display featured/upcoming events

**Props:**
```typescript
interface FeaturedEventsProps {
  citySlug: string;
  limit?: number;
}
```

**Query Logic:**
```typescript
// 1. Try featured events first
const featured = await getEvents(cityId, {
  featuredOnly: true,
  upcomingOnly: true,
  limit
});

// 2. Fallback to recent upcoming if no featured
if (featured.length === 0) {
  return await getEvents(cityId, {
    upcomingOnly: true,
    limit
  });
}
```

**Design:**
- Uses existing `EventCard` component
- Grid: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`
- "View All Events" link to `/[citySlug]/events`

#### `components/homepage/FeaturedProjects.tsx`
**Type:** Server Component
**Purpose:** Display featured projects

**Props:**
```typescript
interface FeaturedProjectsProps {
  citySlug: string;
  limit?: number;
}
```

**Query Logic:**
```typescript
const projects = await getProjects(cityId, {
  featured: true,
  limit
});
// Fallback to recent if no featured
```

**Design:**
- Project card with image, title, description
- Grid: Same as events
- "View All Projects" link

#### `components/homepage/LatestPosts.tsx`
**Type:** Server Component
**Purpose:** Display recent blog posts

**Props:**
```typescript
interface LatestPostsProps {
  citySlug: string;
  limit?: number;
}
```

**Query Logic:**
```typescript
const posts = await getPosts(cityId, {
  status: 'published',
  limit,
  orderBy: 'created_at'
});
```

**Design:**
- Post card: Title, excerpt, date, author avatar, "Read More"
- List layout or grid
- "View All Posts" link

#### `components/homepage/NewsletterSignup.tsx`
**Type:** Client Component ⚠️
**Purpose:** Newsletter email collection (placeholder UI)

**Props:**
```typescript
interface NewsletterSignupProps {
  cityId?: string; // Optional city context
}
```

**Behavior:**
- Email input with validation (client-side only)
- Submit button shows "Coming Soon" tooltip
- On submit: Display message "Newsletter feature coming soon! We'll notify you when it's ready."
- Form is disabled but visually demonstrates the feature
- Helpful text: "We're building newsletter functionality - check back soon!"

**Styling:**
```tsx
<form className="flex gap-2 max-w-md">
  <Input
    type="email"
    placeholder="your@email.com"
    disabled={true}
  />
  <Button
    type="submit"
    disabled={true}
    className="relative group"
  >
    Subscribe
    <Tooltip>Coming Soon</Tooltip>
  </Button>
</form>
```

---

## Data Layer

### CoreAPI Extensions

#### Stats Aggregation Functions

**File:** `lib/core/api.ts`

##### `getCityStats(cityId: string)`
```typescript
/**
 * Get real-time statistics for a specific city
 * Uses COUNT aggregation queries
 *
 * Returns:
 * - memberCount: Active profiles in city
 * - eventCount: Total events (all time)
 * - projectCount: Total projects
 * - postCount: Published posts
 *
 * Future: Consider caching for performance optimization
 */
export async function getCityStats(cityId: string) {
  const supabase = await createClient();

  // Parallel queries for performance
  const [members, events, projects, posts] = await Promise.all([
    supabase.from('user_city_roles').select('*', { count: 'exact', head: true }).eq('city_id', cityId),
    supabase.from('events').select('*', { count: 'exact', head: true }).eq('city_id', cityId),
    supabase.from('projects').select('*', { count: 'exact', head: true }).eq('city_id', cityId),
    supabase.from('posts').select('*', { count: 'exact', head: true }).eq('city_id', cityId).eq('status', 'published')
  ]);

  return {
    memberCount: members.count || 0,
    eventCount: events.count || 0,
    projectCount: projects.count || 0,
    postCount: posts.count || 0
  };
}
```

##### `getGlobalStats()`
```typescript
/**
 * Get aggregate statistics across all active cities
 *
 * Returns:
 * - cityCount: Number of active cities
 * - memberCount: Total unique users across all cities
 * - eventCount: Total events (all cities)
 * - projectCount: Total projects
 */
export async function getGlobalStats() {
  const supabase = await createClient();

  const [cities, members, events, projects] = await Promise.all([
    supabase.from('cities').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('events').select('*', { count: 'exact', head: true }),
    supabase.from('projects').select('*', { count: 'exact', head: true })
  ]);

  return {
    cityCount: cities.count || 0,
    memberCount: members.count || 0,
    eventCount: events.count || 0,
    projectCount: projects.count || 0
  };
}
```

#### Featured Content Filtering

**Update:** `getEvents()` function

```typescript
interface GetEventsOptions {
  cityId: string;
  upcomingOnly?: boolean;
  featuredOnly?: boolean; // NEW
  limit?: number;
}

export async function getEvents(options: GetEventsOptions) {
  const { cityId, upcomingOnly, featuredOnly, limit } = options;

  let query = supabase
    .from('events')
    .select('*')
    .eq('city_id', cityId);

  if (upcomingOnly) {
    query = query.gte('start_time', new Date().toISOString());
  }

  if (featuredOnly) {
    query = query.eq('is_featured', true);
  }

  if (limit) {
    query = query.limit(limit);
  }

  return query.order('start_time', { ascending: true });
}
```

---

## Typography System

### Font Configuration

**Update:** `app/layout.tsx`

```typescript
import { Roboto, EB_Garamond } from 'next/font/google';
import localFont from 'next/font/local';

// Sans-serif (Primary)
const roboto = Roboto({
  weight: ['400', '500', '700'],
  subsets: ['latin'],
  variable: '--font-sans'
});

// Serif (Hero headings)
const garamond = EB_Garamond({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-serif'
});

// Decorative (Rare accents)
const tangerine = localFont({
  src: './fonts/Tangerine-Regular.ttf',
  variable: '--font-decorative'
});
```

**CSS Variables:** `globals.css`

```css
:root {
  --font-sans: 'Roboto', sans-serif;
  --font-serif: 'EB Garamond', serif; /* Palatino alternative */
  --font-decorative: 'Tangerine', cursive;
}
```

**Note:** EB Garamond chosen as Google Fonts alternative to Palatino Linotype (proprietary). Similar elegant serif characteristics.

### Typography Scale

**Hero Headings:**
```tsx
className="font-serif text-5xl md:text-6xl lg:text-7xl leading-tight font-normal"
```

**Section Headings:**
```tsx
className="font-serif text-4xl md:text-5xl leading-tight font-medium"
```

**Card Titles:**
```tsx
className="font-sans text-2xl font-semibold"
```

**Body Text:**
```tsx
className="text-base md:text-lg leading-relaxed"
```

**Eyebrow Labels:**
```tsx
className="font-decorative text-lg italic text-muted-foreground"
```

---

## Responsive Design Patterns

### Breakpoint Strategy

**Mobile First:** Default styles for mobile, scale up

```typescript
// Tailwind breakpoints
sm: 640px   // Small tablets
md: 768px   // Tablets
lg: 1024px  // Desktops
xl: 1280px  // Large desktops
```

### Common Patterns

**Section Padding:**
```tsx
py-12 md:py-16 lg:py-20
```

**Container:**
```tsx
max-w-6xl mx-auto px-4 md:px-6 lg:px-8
```

**Grid Progression:**
```tsx
grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6
```

**Text Scaling:**
```tsx
text-4xl md:text-5xl lg:text-7xl
```

**Navigation:**
- Mobile: Hamburger menu (slide-out drawer)
- Desktop: Horizontal navbar with dropdowns

**Hero Images:**
- Mobile: Reduce min-height, increase padding
- Desktop: Full-bleed background, larger typography

---

## Color System

### Semantic Tokens (Always Use These)

**Backgrounds:**
- `bg-background` - Primary page background (white)
- `bg-background-alt` - Alternate sections (light grey)
- `bg-light` - Card backgrounds

**Text:**
- `text-foreground` - Primary text (dark)
- `text-muted-foreground` - Secondary text (grey)

**Interactive:**
- `bg-primary` / `text-primary` - FaithTech Lime (#c6fb50)
- `hover:bg-faithtech-green-200` - Darker lime on hover
- `bg-destructive` - Error states
- `bg-success` - Success states

**Borders:**
- `border-border` - Default borders

**City Accents:**
- Cities have custom `accent_color` (Indigo, Purple, Pink, Teal)
- Use sparingly for city-specific branding (hero overlays, badges)

### Dark Mode

All sections must support dark mode:
- Color tokens automatically swap in dark mode
- Test all sections with theme switcher
- Ensure sufficient contrast (WCAG AA minimum)
- Image overlays may need adjustment for dark mode readability

---

## Accessibility Requirements

### WCAG AA Compliance

**Contrast Ratios:**
- Normal text: Minimum 4.5:1
- Large text (18px+): Minimum 3:1
- Interactive elements: Minimum 3:1

**Focus States:**
```tsx
focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2
```

**Keyboard Navigation:**
- All interactive elements must be keyboard accessible
- Logical tab order
- Skip to main content link
- Escape to close modals/dropdowns

**Semantic HTML:**
```tsx
<nav> - Navigation sections
<main> - Main content area
<section> - Distinct sections with headings
<article> - Blog posts, events
<footer> - Footer content
<h1>, <h2>, <h3> - Proper heading hierarchy
```

**Image Alt Text:**
- Informative images: Descriptive alt text
- Decorative images: Empty alt (`alt=""`) or `aria-hidden="true"`
- City hero images: "Aerial view of [CityName] skyline"

**ARIA Labels:**
- Icon-only buttons: `aria-label="Close menu"`
- Loading states: `aria-live="polite"`
- Expandable sections: `aria-expanded`, `aria-controls`

**Screen Reader Testing:**
- Test with VoiceOver (macOS) or NVDA (Windows)
- Ensure all content is readable
- Navigation landmarks properly announced

---

## Performance Optimization

### Server-Side Rendering

**All homepage components are Server Components** except:
- `NewsletterSignup` (form interaction)
- Navigation mobile menu (toggle state)

**Benefits:**
- Zero client-side JS for content rendering
- Faster initial page load
- Better SEO (fully rendered HTML)

### Image Optimization

**next/image component:**
```tsx
<Image
  src={city.hero_image_url}
  alt={`${city.name} skyline`}
  width={1200}
  height={600}
  className="object-cover"
  priority={isAboveFold} // LCP optimization
  placeholder="blur" // Optional
/>
```

**Unsplash URLs:**
- Use `?w=1200&q=80` parameters for optimized loading
- WebP format when possible

### Data Fetching

**Parallel Queries:**
```typescript
// Fetch all homepage data in parallel
const [city, events, projects, posts, stats] = await Promise.all([
  getCityBySlug(slug),
  getEvents({ cityId, featuredOnly: true, limit: 3 }),
  getProjects({ cityId, featured: true, limit: 3 }),
  getPosts({ cityId, status: 'published', limit: 3 }),
  getCityStats(cityId)
]);
```

**Caching Considerations:**
- Current: Real-time queries (fresh data)
- Future: Consider ISR (Incremental Static Regeneration) for city pages
- Future: Redis cache for stats (updated hourly)

### Code Splitting

- Lazy load below-fold sections if needed
- Dynamic imports for heavy components
- Current: Not needed (all components lightweight)

---

## SEO Strategy

### Metadata Configuration

**Root Homepage:**
```typescript
export const metadata: Metadata = {
  title: 'FaithTech Regional Hub | Christian Tech Community',
  description: 'Connecting Christian technologists across cities to redemptively change the world through tech. Join events, collaborate on projects, and grow in faith and tech together.',
  keywords: ['FaithTech', 'Christian tech', 'tech community', 'faith and technology'],
  openGraph: {
    title: 'FaithTech Regional Hub',
    description: 'A global movement of Christian technologists',
    images: ['/og-image.png'],
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FaithTech Regional Hub',
    description: 'Connecting Christian technologists globally',
    images: ['/og-image.png']
  }
};
```

**City Homepage (Dynamic):**
```typescript
export async function generateMetadata({ params }): Promise<Metadata> {
  const city = await getCityBySlug(params.citySlug);

  return {
    title: `FaithTech ${city.name} | Christian Tech Community`,
    description: `Join the FaithTech community in ${city.name}. Connect with Christian technologists, attend events, collaborate on projects, and grow in faith and tech.`,
    openGraph: {
      title: `FaithTech ${city.name}`,
      description: `Christian tech community in ${city.name}`,
      images: [city.hero_image_url || '/og-image-default.png'],
      type: 'website'
    }
  };
}
```

### Structured Data

**Organization Schema:**
```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "FaithTech Regional Hub",
  "url": "https://yoursite.com",
  "logo": "https://yoursite.com/logo.png",
  "description": "Global community of Christian technologists"
}
```

**City LocalBusiness Schema:**
```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "FaithTech Adelaide",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Adelaide",
    "addressCountry": "AU"
  }
}
```

---

## Testing Strategy

### Manual Testing Checklist

**Geo-Routing:**
- [ ] Test with Vercel geo headers present (production)
- [ ] Test without geo headers (local dev)
- [ ] Test with matched city (auto-redirect)
- [ ] Test with unmatched location (directory shown)
- [ ] Test direct city URL navigation

**Content Display:**
- [ ] Root homepage with all sections
- [ ] City homepage with featured content
- [ ] Empty states (no events/projects/posts)
- [ ] Featured content vs fallback to recent
- [ ] Stats display with real data

**Responsive Design:**
- [ ] Mobile (375px width)
- [ ] Tablet (768px)
- [ ] Desktop (1024px, 1440px)
- [ ] Grid collapse patterns
- [ ] Navigation mobile menu
- [ ] Image aspect ratios

**Accessibility:**
- [ ] Keyboard navigation (tab through all interactive elements)
- [ ] Focus states visible and clear
- [ ] Screen reader test (VoiceOver/NVDA)
- [ ] Color contrast check (browser DevTools)
- [ ] Semantic HTML structure
- [ ] ARIA labels on icon buttons

**Dark Mode:**
- [ ] All sections in dark mode
- [ ] Text contrast maintained
- [ ] Image overlays adjusted if needed
- [ ] Border visibility
- [ ] Button states

**Performance:**
- [ ] Lighthouse score (90+ Performance, 100 Accessibility)
- [ ] LCP (Largest Contentful Paint) < 2.5s
- [ ] No layout shift (CLS = 0)
- [ ] Image optimization verified

### Automated Testing

**Future:** Add Playwright tests for:
- Homepage rendering
- Geo-routing logic
- Navigation interactions
- Form submissions

---

## Migration Guide

### Database Changes

**Migration:** `020_add_events_is_featured.sql`

Adds `is_featured` boolean to events table:
```sql
ALTER TABLE events ADD COLUMN is_featured BOOLEAN DEFAULT FALSE;

-- Mark example events as featured (optional)
UPDATE events
SET is_featured = TRUE
WHERE title LIKE '%Workshop%' OR title LIKE '%Gathering%'
LIMIT 2;
```

**Seed Data Updates:** `seed.sql`

Add hero images to cities:
```sql
UPDATE cities SET hero_image_url = 'https://images.unsplash.com/photo-...' WHERE slug = 'adelaide';
-- Repeat for Sydney, Melbourne, Brisbane
```

Mark featured content:
```sql
UPDATE events SET is_featured = TRUE WHERE id IN (...);
UPDATE projects SET is_featured = TRUE WHERE id IN (...);
UPDATE posts SET is_featured = TRUE WHERE id IN (...);
```

---

## Future Enhancements

### Phase 4+ Considerations

1. **Newsletter Integration** (Task 32-37)
   - Replace placeholder with real Mailchimp/SendGrid integration
   - Store subscribers in database
   - Segment by city
   - Automated welcome emails

2. **City Switcher**
   - For users belonging to multiple cities
   - Dropdown in navigation
   - Remember last selected city (localStorage)
   - Admin users see all cities

3. **Personalized Homepage**
   - Logged-in users see their city automatically
   - Activity feed of their groups/projects
   - Upcoming events they RSVP'd to

4. **Search Functionality**
   - Global search across events, projects, posts
   - City-specific search
   - Autocomplete suggestions

5. **Analytics**
   - Track homepage CTA conversions
   - Popular cities (directory clicks)
   - Featured content engagement
   - A/B testing for CTAs

6. **Animations**
   - Scroll-triggered fade-ins (Framer Motion)
   - Parallax hero backgrounds
   - Smooth transitions between sections
   - Respect `prefers-reduced-motion`

7. **Internationalization (i18n)**
   - Multi-language support
   - City-specific language preferences
   - RTL language support

---

## Documentation Links

- [Style Guide](../style_guide.md)
- [Architectural Principles](../2-core-architecture/architectural-principles.md)
- [Multi-Tenant Strategy](../2-core-architecture/multi-tenant-data-model.md)
- [Events Feature](./events.md)
- [Projects Feature](./projects.md)
- [Blog Feature](./blog.md)

---

## Changelog

**2025-01-13:** Initial specification created
- Defined routing strategy (geo-location with directory fallback)
- Specified root and city homepage sections
- Documented all components and data layer
- Established responsive and accessibility requirements

---

**End of Document**
