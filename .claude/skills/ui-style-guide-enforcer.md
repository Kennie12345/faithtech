# UI/UX Style Guide Enforcer

## Purpose
Enforce consistent UI/UX patterns across the application by checking against a style guide. This skill ensures components reuse existing design tokens, follow established patterns, and maintain visual consistency.

## When to Activate
This skill is **ALWAYS ACTIVE** when:
- Writing UI components (React components, pages, layouts)
- Modifying existing components
- Adding styling (Tailwind classes, CSS)
- Creating new pages or layouts
- Before presenting UI code to user

## Prerequisites

### Step 1: Check for Style Guide
**BEFORE enforcing any rules, check if `docs/style_guide.md` exists.**

**If it exists**: Read it and enforce the rules defined within.

**If it does NOT exist**: Use the **Documentation Interviewer skill** to create it.

### Step 2: Create Style Guide (If Missing)
**Activate Documentation Interviewer skill** and ask questions to create `docs/style_guide.md`:

**Questions to ask** (one at a time):
1. "I notice there's no style_guide.md yet. Let me create one by understanding your current UI patterns. What UI component library are you using? (I see Shadcn UI - are there any other component sources?)"

2. "What's your color system? Do you use Tailwind's default palette, or do you have custom CSS variables defined?"

3. "What spacing scale do you follow for margins and padding? (Tailwind's default 0, 1, 2, 4, 8, etc., or custom?)"

4. "What typography scale do you use? (Tailwind's text-sm, text-base, text-lg, etc., or custom?)"

5. "What are the most common UI patterns or components in your app? (Cards, Buttons, Forms, etc.)"

6. "What are common UI mistakes or inconsistencies you've noticed? (Examples: adding new colors instead of using existing ones, not using existing components, etc.)"

7. "Are there specific accessibility standards to enforce? (ARIA labels, keyboard navigation, focus states, etc.)"

8. "Are there any design patterns or conventions I should enforce? (Button variants, card styles, form layouts, etc.)"

**After gathering answers, create `docs/style_guide.md`** with structure:
```markdown
# UI/UX Style Guide

## Colors
[Document color palette from CSS variables or Tailwind config]

## Typography
[Document text scales and font families]

## Spacing
[Document spacing scale]

## Components
[Document when to use which components]

## Common Patterns
[Document established UI patterns]

## Violations to Avoid
[Document common mistakes]

## Accessibility
[Document accessibility requirements]
```

**Once created, proceed to enforcement.**

## Core Rules

### 1. Reuse Existing Design Tokens
**Rule**: NEVER add new colors, spacing values, or text sizes unless absolutely necessary. Always check if existing tokens can be used.

**Common Violations**:
- Adding new color values instead of using CSS variables
- Using arbitrary Tailwind values (e.g., `w-[347px]`) instead of standard scale
- Creating new CSS variables when existing ones suffice

**Auto-Fix Strategy**:
1. **Check existing tokens**: Look in `globals.css` for CSS variables, `tailwind.config.ts` for theme
2. **Map to existing**: Find closest existing token
3. **Replace**: Use existing token instead of new value
4. **If truly needed**: Ask user before adding new token

**Examples**:

❌ **VIOLATION** (Adding new color):
```tsx
<div className="bg-blue-450 text-gray-650">
  {/* Custom blue/gray values not in design system */}
</div>

<style jsx>{`
  .custom-button {
    background-color: #3b82f6;
    color: #1e40af;
  }
`}</style>
```

✅ **AUTO-FIX TO** (Using existing):
```tsx
<div className="bg-primary text-muted-foreground">
  {/* Uses CSS variables from design system */}
</div>

{/* Or if standard Tailwind: */}
<div className="bg-blue-500 text-gray-600">
  {/* Uses standard Tailwind colors */}
</div>
```

❌ **VIOLATION** (Arbitrary values):
```tsx
<div className="w-[347px] h-[89px] mt-[23px]">
  {/* Arbitrary values instead of design scale */}
</div>
```

✅ **AUTO-FIX TO** (Design scale):
```tsx
<div className="w-80 h-20 mt-6">
  {/* w-80 = 320px (close to 347px), h-20 = 80px, mt-6 = 24px */}
</div>

{/* Or if responsive: */}
<div className="w-full max-w-sm h-20 mt-6">
  {/* Fluid width with max constraint */}
</div>
```

### 2. Reuse Existing Components
**Rule**: Before creating a new component, check if an existing component can be used or extended.

**Common Violations**:
- Creating custom buttons when Shadcn Button exists
- Creating custom cards when Shadcn Card exists
- Duplicating form field patterns

**Auto-Fix Strategy**:
1. **Check `components/ui/`**: Are there Shadcn components?
2. **Check feature components**: Is there a similar component in another feature?
3. **Reuse or extend**: Use existing component with props/variants
4. **Extract common patterns**: If duplicating, extract to shared component

**Examples**:

❌ **VIOLATION** (Custom button):
```tsx
export function DeleteButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
    >
      Delete
    </button>
  );
}
```

✅ **AUTO-FIX TO** (Using Shadcn Button):
```tsx
import { Button } from '@/components/ui/button';

export function DeleteButton({ onClick }: { onClick: () => void }) {
  return (
    <Button onClick={onClick} variant="destructive">
      Delete
    </Button>
  );
}
```

❌ **VIOLATION** (Custom card):
```tsx
export function EventCard({ event }: { event: Event }) {
  return (
    <div className="border rounded-lg p-4 shadow-sm bg-white">
      <h3 className="text-lg font-semibold">{event.title}</h3>
      <p className="text-gray-600">{event.description}</p>
    </div>
  );
}
```

✅ **AUTO-FIX TO** (Using Shadcn Card):
```tsx
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export function EventCard({ event }: { event: Event }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{event.title}</CardTitle>
        <CardDescription>{event.description}</CardDescription>
      </CardHeader>
    </Card>
  );
}
```

### 3. Avoid Adding New CSS Variables Unnecessarily
**Rule**: Only add new CSS variables if truly needed for theming. Check existing variables first.

**Auto-Fix Strategy**:
1. **Check `globals.css`**: Read existing CSS variables
2. **Map to existing**: Can an existing variable be used?
3. **Justify new variables**: Only add if it's a new themeable concept

**Examples**:

❌ **VIOLATION** (Unnecessary new variable):
```css
/* globals.css */
:root {
  --primary: 222.2 47.4% 11.2%;
  /* ... existing variables */

  /* NEW - but unnecessary! */
  --event-card-bg: 0 0% 100%;
  --event-card-border: 214.3 31.8% 91.4%;
}
```

```tsx
<div className="bg-[--event-card-bg] border-[--event-card-border]">
```

✅ **AUTO-FIX TO** (Using existing):
```tsx
<div className="bg-card border-border">
  {/* Uses existing --card and --border variables */}
</div>
```

### 4. Follow Established Component Patterns
**Rule**: When similar components exist, follow their patterns exactly.

**Pattern Discovery**:
1. Look at existing components in the same feature
2. Look at components in other features with similar purpose
3. Follow the same structure, props, and styling approach

**Examples**:

If `components/events/EventCard.tsx` exists with this pattern:
```tsx
interface EventCardProps {
  event: Event;
  variant?: 'default' | 'featured';
}

export function EventCard({ event, variant = 'default' }: EventCardProps) {
  return (
    <Card className={cn(variant === 'featured' && 'border-primary')}>
      {/* ... */}
    </Card>
  );
}
```

Then `components/projects/ProjectCard.tsx` should follow the SAME pattern:
```tsx
interface ProjectCardProps {
  project: Project;
  variant?: 'default' | 'featured';
}

export function ProjectCard({ project, variant = 'default' }: ProjectCardProps) {
  return (
    <Card className={cn(variant === 'featured' && 'border-primary')}>
      {/* ... */}
    </Card>
  );
}
```

### 5. Maintain Accessibility Standards
**Rule**: All interactive elements must be accessible.

**Requirements**:
- Buttons have proper ARIA labels when icon-only
- Forms have proper labels (no placeholder-only inputs)
- Keyboard navigation works (focus states visible)
- Semantic HTML (button, nav, main, article, etc.)
- Alt text for images
- Proper heading hierarchy (h1 → h2 → h3)

**Auto-Fix Strategy**:
1. **Add ARIA labels**: For icon buttons
2. **Add labels**: For form inputs (use Shadcn Label)
3. **Use semantic elements**: Replace divs with proper HTML5 tags
4. **Add focus styles**: Use `focus-visible:` utilities

**Examples**:

❌ **VIOLATION**:
```tsx
<div onClick={handleDelete}>
  <TrashIcon />
</div>

<input type="text" placeholder="Event title" />
```

✅ **AUTO-FIX TO**:
```tsx
<Button
  onClick={handleDelete}
  variant="ghost"
  size="icon"
  aria-label="Delete event"
>
  <TrashIcon />
</Button>

<Label htmlFor="event-title">Event Title</Label>
<Input
  id="event-title"
  type="text"
  placeholder="Event title"
  aria-required="true"
/>
```

### 6. DRY Principle for Styles
**Rule**: No repeated Tailwind class combinations. Extract to components or variants.

**Common Violations**:
- Same class combinations repeated across multiple components
- Inline complex class strings

**Auto-Fix Strategy**:
1. **Identify repeated patterns**: Same 5+ classes appearing multiple times
2. **Extract to component**: Create reusable component
3. **Or use variants**: Add variant to existing component

**Examples**:

❌ **VIOLATION** (Repeated classes):
```tsx
// Multiple files with same pattern
<div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-white shadow-sm">

<div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-white shadow-sm">

<div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-white shadow-sm">
```

✅ **AUTO-FIX TO** (Extracted component):
```tsx
// components/ui/list-item.tsx
export function ListItem({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-white shadow-sm">
      {children}
    </div>
  );
}

// Usage
<ListItem>Content</ListItem>
<ListItem>Content</ListItem>
<ListItem>Content</ListItem>
```

## Enforcement Process

### Step 1: Check for Style Guide
```
IF `docs/style_guide.md` DOES NOT EXIST:
  ACTIVATE Documentation Interviewer skill
  CREATE style_guide.md
END IF
```

### Step 2: Load Style Guide
Read `docs/style_guide.md` and internalize rules.

### Step 3: Before Presenting UI Code
1. **Scan for new colors**: Are there hardcoded colors not in design system?
2. **Check for arbitrary values**: Any `[...]` arbitrary Tailwind values?
3. **Check for custom components**: Could Shadcn component be used instead?
4. **Check for CSS variables**: Any new variables that duplicate existing?
5. **Check accessibility**: Missing ARIA labels, labels, semantic HTML?
6. **Check for duplication**: Repeated class patterns?

### Step 4: Auto-Fix Violations
1. **Replace with existing tokens**: Map new values to existing
2. **Use existing components**: Replace custom with Shadcn
3. **Add accessibility**: ARIA labels, labels, semantic HTML
4. **Extract repeated patterns**: Create reusable components

### Step 5: Explain Improvements
Briefly mention style improvements made:
```
"I've updated the component to use the existing Button component from Shadcn UI instead of a custom button, and added proper ARIA labels for accessibility."
```

## Integration with Style Guide

**The style guide is the source of truth.**

This skill enforces whatever is documented in `docs/style_guide.md`. If the user's style guide says:
- "Always use `bg-primary` for primary backgrounds" → Enforce this
- "Never use arbitrary values" → Enforce this
- "All buttons must use Shadcn Button component" → Enforce this

**Keep this skill generic - specific rules come from the style guide.**

## Success Criteria
- `docs/style_guide.md` exists and is comprehensive
- No new colors added without justification
- No arbitrary Tailwind values (except truly one-off cases)
- Existing components are reused (no duplicate custom components)
- No new CSS variables that duplicate existing ones
- All UI code follows patterns documented in style guide
- All interactive elements are accessible
- Repeated style patterns are extracted to components
