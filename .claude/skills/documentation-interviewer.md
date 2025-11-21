# Documentation Interviewer

## Purpose
Produce high-quality documentation through iterative questioning. This skill ensures documentation is comprehensive, accurate, and tailored to the actual implementation by asking clarifying questions one at a time until full understanding is achieved.

## When to Activate
This skill is **ACTIVE** when:
- User requests documentation for a feature
- User asks for API documentation
- User requests explanation of architecture or patterns
- New feature is completed and needs documenting
- Creating style guides or standards documents

## Core Philosophy

**Quality over speed.** Never rush to write documentation based on assumptions. Ask questions until you have complete understanding.

## Interview Process

### Step 1: Understand the Scope
**Ask FIRST**:
- What specifically needs to be documented?
- Who is the audience? (Developers? End users? Contributors?)
- What's the purpose? (Tutorial? Reference? Architecture decision record?)

**Wait for answer before proceeding.**

### Step 2: Gather Context Iteratively
**Ask ONE question at a time.**

Never ask:
```
❌ WRONG:
"Can you provide:
1. The purpose of this feature
2. The user stories
3. The data model
4. The API endpoints
5. The UI screenshots"
```

Instead, ask:
```
✅ CORRECT:
"What's the primary purpose of this feature? What problem does it solve for users?"

[Wait for answer]

"What are the key user interactions? Walk me through the main user flow."

[Wait for answer]

"What data does this feature work with? Are there new database tables?"

[Continue iteratively...]
```

### Step 3: Ask Follow-Up Questions
**Dig deeper when answers raise new questions**:

```
User: "This feature allows admins to manage events."

Claude: "What specific event management actions can admins perform? (Create, edit, delete, publish, etc.)"

User: "Create, edit, delete, and mark as featured."

Claude: "How does the 'featured' marking work? Can all events be featured, or is there a limit per city?"

User: "Up to 3 featured events per city."

Claude: "When an admin tries to feature a 4th event, what happens? Does it automatically un-feature the oldest, or do they choose which to replace?"

[Continue until full understanding]
```

### Step 4: Summarize Understanding
**Before writing, confirm your understanding**:

```
Based on our discussion, here's what I understand:

**Feature**: Event Management with Featured Events
**Audience**: City Admins
**Core Actions**:
- Create events with title, description, date, location, max attendees
- Edit existing events (draft or published)
- Delete events (soft delete if there are RSVPs)
- Mark up to 3 events as "featured" per city
- Featured events appear prominently on city homepage

**Data Model**:
- events table with featured boolean column
- Constraint: Max 3 featured per city (enforced in UI and server action)
- RLS policies: City Admins can manage events in their city only

**User Flow**:
1. Admin navigates to /protected/admin/events
2. Clicks "New Event" button
3. Fills form with event details
4. Optionally marks as "Featured" (if under limit)
5. Saves (creates event as draft)
6. Can publish later from events list

Is this accurate? Anything I'm missing or misunderstanding?
```

**Wait for confirmation before writing documentation.**

### Step 5: Write Documentation
**Only after steps 1-4, write the documentation.**

## Documentation Types

### Feature Documentation
**When documenting features, include**:
1. **Purpose & Scope** - What it does, why it exists
2. **User Stories** - Who uses it and how
3. **Data Model** - Tables, columns, relationships, constraints
4. **Authorization** - Who can access (RLS policies)
5. **Server Actions** - Available operations
6. **UI Components** - Admin and public interfaces
7. **Event Bus Integration** - Events emitted/consumed (if applicable)
8. **Testing Considerations** - What to test

**Do NOT force the `00-feature-template.md` structure** - adapt to what makes sense.

### API Documentation
**When documenting server actions**:
1. **Function Signature** - Name, parameters, return type
2. **Purpose** - What it does
3. **Authorization** - Who can call it
4. **Parameters** - Each parameter explained with type and validation
5. **Return Value** - Success and error cases
6. **Side Effects** - Database changes, events emitted, cache invalidation
7. **Example Usage** - Code example from actual implementation

**Format**:
```markdown
### `createEvent(formData: FormData)`

Creates a new event for the current city.

**Authorization**: City Admin or Super Admin only

**Parameters**:
- `formData` (FormData):
  - `title` (string, required): Event title (1-200 chars)
  - `description` (string, optional): Event description
  - `starts_at` (datetime, required): Event start time
  - `location_name` (string, optional): Venue name
  - `max_attendees` (number, optional): Capacity limit

**Returns**: `Promise<{ data?: Event; error?: string }>`
- Success: `{ data: Event }` with created event
- Failure: `{ error: string }` with error message

**Side Effects**:
- Inserts row into `events` table
- Emits `event:created` event to Event Bus
- Revalidates `/protected/admin/events` and city public events page

**Example**:
\`\`\`typescript
const formData = new FormData();
formData.set('title', 'FaithTech Meetup');
formData.set('starts_at', '2025-02-15T18:00:00Z');

const result = await createEvent(formData);
if (result.error) {
  console.error(result.error);
} else {
  console.log('Created event:', result.data);
}
\`\`\`
```

### Architecture Documentation
**When documenting architecture**:
1. Start with high-level overview
2. Explain the "why" behind decisions
3. Show the tradeoffs considered
4. Include diagrams if helpful (ask user to provide or describe)
5. Link to relevant code examples

### Style Guide Documentation
**When creating style guides** (see UI/UX Style Guide Enforcer skill):
1. **Use the Documentation Interviewer skill** (this skill!)
2. Ask about current patterns in the codebase
3. Ask about preferences (spacing, colors, component usage)
4. Ask about violations that occur frequently
5. Document the rules with examples

**Style guide questions to ask**:
- "What UI components do you use most often? (Shadcn, custom, etc.)"
- "What are your color palette preferences? Do you use CSS variables?"
- "What spacing scale do you follow? (Tailwind default, custom?)"
- "What accessibility standards should be enforced? (ARIA, keyboard nav, etc.)"
- "What are common mistakes or inconsistencies you've noticed in the UI?"
- "Are there any design patterns or conventions I should know about?"

## Question Quality

### Good Questions
✅ **Open-ended but specific**:
- "What happens when a user tries to RSVP to a full event?"
- "How should featured events be ordered on the homepage?"
- "What validation rules apply to event titles?"

✅ **Reveal edge cases**:
- "Can an event have zero max attendees (unlimited capacity)?"
- "Can users un-RSVP after registering?"
- "What happens to RSVPs when an event is deleted?"

✅ **Clarify ambiguity**:
- "When you say 'published', does that mean visible to the public immediately?"
- "Is 'city context' determined by URL slug or user's selected city?"

### Bad Questions
❌ **Too vague**:
- "Tell me about the feature."
- "What should I know?"

❌ **Multiple questions at once**:
- "What are the fields, validation rules, and authorization requirements?"

❌ **Assumptive**:
- "I assume this uses soft deletes, right?"
- "Probably need pagination here?"

**Ask specific, focused questions that reveal requirements.**

## Iterative Depth

### How Many Questions?
**As many as it takes** to achieve full understanding.

**Typical interview lengths**:
- Simple feature: 3-5 questions
- Medium feature: 5-10 questions
- Complex feature: 10-15+ questions
- Architecture documentation: 5-8 questions
- Style guide creation: 8-12 questions

**Stop when**:
1. You have complete understanding
2. No ambiguities remain
3. User confirms your summary is accurate
4. You can write documentation without guessing

**Don't stop early just to be fast.**

## Example Interview Flow

**User**: "Document the blog feature."

**Claude**: "What's the primary purpose of the blog feature? Is it for announcements, tutorials, community updates, or something else?"

**User**: "Community updates and announcements from city admins."

**Claude**: "Who can create blog posts? Just Super Admins, or City Admins as well?"

**User**: "City Admins can create posts for their city."

**Claude**: "Can posts be in draft state before publishing, or are they published immediately upon creation?"

**User**: "Draft state is supported. Admins can save drafts and publish later."

**Claude**: "What content can posts include? Just text, or also images, videos, code snippets?"

**User**: "Markdown content with image uploads via Supabase Storage."

**Claude**: "Are there any restrictions on post slugs? Must they be unique per city or globally?"

**User**: "Unique per city, like events."

**Claude**: "Can posts be featured on the homepage, similar to events?"

**User**: "Yes, same pattern - up to 3 featured posts per city."

**Claude**: "How are posts ordered in the public blog list? By publish date, created date, or manually?"

**User**: "Publish date, newest first."

**Claude**: "Last question: Can posts be scheduled for future publication, or only published immediately?"

**User**: "Only immediate publication for now."

**Claude**: "Perfect! Let me summarize what I understand:

**Blog Feature Summary**:
- **Purpose**: Community updates and announcements per city
- **Authors**: City Admins (per city) and Super Admins
- **Content**: Markdown with image uploads (Supabase Storage)
- **States**: Draft → Published (no scheduling)
- **Slugs**: Unique per city (not global)
- **Featured**: Up to 3 per city (same as events pattern)
- **Ordering**: Published posts by publish_date DESC
- **Multi-tenant**: Posts belong to a city, isolated by RLS

Is this accurate?"

**User**: "Yes, that's correct."

**Claude**: [Proceeds to write comprehensive documentation]

## Success Criteria
- Documentation is comprehensive and accurate
- No assumptions or guesses - everything is based on answers
- User confirms understanding before writing begins
- Documentation includes all necessary sections
- Examples are relevant and helpful
- Edge cases are documented
- No template is forced - structure fits the content
