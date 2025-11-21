# First Principles Thinker

## Purpose
Enforce deep, methodical thinking before implementation. This skill ensures Claude breaks down problems to fundamentals, considers alternatives, and aligns solutions with the project's vision before writing any code.

## When to Activate
This skill is **ALWAYS ACTIVE** when:
- User requests implementation of a feature or fix
- User asks for architectural decisions
- User requests refactoring or optimization
- Any non-trivial task that requires code changes

## Core Philosophy

**NEVER jump straight to code.** Always think first, show your reasoning, then implement.

## Project Vision & Aims

Before solving any problem, ground your thinking in the project's core aims:

### Project Mission (from docs/1-vision/mission-and-vision.md)
- **Empower local FaithTech communities** with technology
- **Lower barrier to entry** for cities to launch community sites
- **"Batteries included" philosophy** - works out of the box
- **Extensibility through plugins** - stable core + rich ecosystem
- **Inclusive for developers** - SDK enables contribution without understanding core

### Architectural Principles (from docs/1-vision/architectural-principles.md)
1. **Security First** - Multi-tenant isolation, RLS policies, schema-per-plugin
2. **Developer Experience** - Clear patterns, comprehensive docs, fast iteration
3. **Performance** - Optimized for Vercel Edge, efficient database queries
4. **Simplicity** - Convention over configuration, sensible defaults
5. **Stability** - Core remains stable while plugins innovate

### Key Design Decisions
- **Multi-tenant from day one** - City isolation is fundamental
- **Server Components by default** - Client Components only when needed
- **Per-request Supabase clients** - Serverless-friendly
- **Event Bus for cross-feature communication** - Loose coupling
- **Zod for all data validation** - Type-safe boundaries

## First Principles Thinking Process

### Step 1: Understand the Problem
**Before any implementation, answer**:
1. What problem are we actually solving?
2. Why is this a problem? What's the root cause?
3. What are the constraints? (Technical, architectural, user experience)
4. How does this align with project vision?

**Show this thinking explicitly.**

### Step 2: Break Down to Fundamentals
**Decompose the problem**:
1. What are the essential components?
2. What are the core operations needed?
3. What data needs to flow through the system?
4. Where do side effects occur?

**Think from first principles, not by analogy to similar features.**

### Step 3: Consider Alternatives
**Explore multiple approaches**:
1. What are 2-3 different ways to solve this?
2. What are the tradeoffs of each approach?
3. Which approach best aligns with:
   - Project architectural principles?
   - Existing patterns in the codebase?
   - Long-term maintainability?
   - Developer experience?

**Show this comparison explicitly.**

### Step 4: Reason About Architecture
**Before proposing a solution**:
1. Does this fit the multi-tenant model?
2. Does this maintain security (RLS, auth)?
3. Is this extensible for future plugins?
4. Does this follow the "core + plugin" philosophy?
5. Will this work on serverless (Vercel Edge)?

**Explain your architectural reasoning.**

### Step 5: Design the Solution
**Only after steps 1-4, design**:
1. What data model is needed? (Tables, relationships, constraints)
2. What RLS policies ensure security?
3. What server actions expose this functionality?
4. What UI components present this to users?
5. How does this integrate with existing features? (Event Bus)

**Outline the approach clearly before coding.**

### Step 6: Explain the Approach
**Before writing code, explain**:
1. Here's what I'm going to build and why
2. Here's how it fits into the existing architecture
3. Here's what tradeoffs I'm making
4. Here's what you should review carefully

**Get implicit approval before proceeding to implementation.**

## Examples of First Principles Thinking

### Example 1: Adding a "Featured Events" Feature

❌ **WRONG** (Jumping to code):
```
"Let me add a `featured` boolean column to the events table and update the queries."
[Starts coding immediately]
```

✅ **CORRECT** (First principles):
```
Let me think through this from first principles:

**Problem**: We need to highlight certain events prominently on the homepage.

**Fundamental Questions**:
1. What makes an event "featured"? Is it:
   - Admin decision (manual curation)?
   - Algorithmic (most RSVPs, soonest)?
   - Time-based (featured for a duration)?

2. Where should featured events appear?
   - Homepage only?
   - City-specific pages?
   - Multiple locations?

3. Should there be a limit?
   - Max 3 featured events per city?
   - No limit?

**Architectural Considerations**:
- Multi-tenancy: Featured is per-city, not global
- Authorization: Only City Admins can mark events as featured
- Performance: Need efficient query (index on `featured` + `city_id`)

**Alternative Approaches**:

Approach A: Boolean flag
- Pros: Simple, fast queries
- Cons: No control over order, no time-based featuring

Approach B: Featured table with order/priority
- Pros: Explicit ordering, can add time ranges
- Cons: More complex, join queries

Approach C: Use existing `created_at` + RSVP count
- Pros: No schema changes, algorithmic
- Cons: Not curated, may not match community priorities

**Recommendation**: Approach A for Phase 1 (simple boolean)
- Aligns with existing patterns (projects also have `featured`)
- Can evolve to Approach B in Phase 2 if needed
- Keeps core simple (architectural principle)

**Implementation Plan**:
1. Add `featured` column to events table (default false)
2. Add index on (city_id, featured, starts_at)
3. Update RLS policies (only City Admins can set featured)
4. Add `toggleFeatured` server action
5. Update home page query to prioritize featured events
6. Add UI toggle in admin panel

Does this approach align with your vision?
```

### Example 2: Performance Optimization Request

❌ **WRONG**:
```
"I'll add caching to speed this up."
[Adds Redis immediately]
```

✅ **CORRECT**:
```
Let me diagnose this from first principles:

**Problem**: Events page loads slowly (3+ seconds reported)

**Root Cause Analysis**:
1. Is it database query time? (Check Supabase logs)
2. Is it network latency? (Check Vercel analytics)
3. Is it component rendering? (Too many re-renders?)
4. Is it data size? (Fetching too much data?)

**Fundamental Questions**:
- What's the actual bottleneck? (Measure, don't guess)
- How many events are we loading? (Pagination needed?)
- Are we over-fetching fields? (SELECT * vs specific columns)
- Are we making N+1 queries? (Missing joins?)

**Before adding complexity (caching), let's check**:
1. Is the query indexed properly?
2. Are we using Server Components (no client-side fetching)?
3. Are we leveraging Next.js caching (fetch cache)?

**Hypothesis**: Likely missing index or over-fetching.

**Investigation Plan**:
1. Check current query structure
2. Check indexes on events table
3. Measure query time in Supabase
4. Check if we need pagination vs infinite scroll

[After investigation, then propose solution based on findings]
```

## When to Show Thinking

**ALWAYS show thinking for**:
- New feature implementation
- Architectural decisions
- Performance optimization
- Security-sensitive changes
- Refactoring existing code
- Any ambiguous request

**Can skip thinking for**:
- Trivial changes (fixing typos, updating copy)
- Direct requests with clear intent ("change this button color to blue")
- Following exact specifications already provided

**When in doubt, think first.**

## Thinking Format

Use clear sections:
```
## Problem
[What we're solving]

## Fundamental Questions
[Core questions to answer]

## Architectural Alignment
[How this fits project vision]

## Alternative Approaches
[2-3 options with tradeoffs]

## Recommended Approach
[Chosen solution with reasoning]

## Implementation Plan
[Step-by-step outline]
```

## Integration with Other Skills

This skill runs **BEFORE** other skills:
1. **First Principles Thinker** - Analyze and design
2. **TypeScript Strict Enforcer** - Implement with strict types
3. **Functional Programming Enforcer** - Write pure, declarative code
4. **Code Quality Guardian** - Review for quality before presenting

## Success Criteria
- Every implementation is preceded by visible thinking
- Thinking addresses "why" not just "how"
- Alternatives are considered and compared
- Architectural alignment is explicit
- User has opportunity to course-correct before code is written
- Solutions are grounded in project vision, not just "best practices"
