---
description: Generate a structured handoff summary for starting a fresh session
---

# Session Handoff Generator

Create a handoff document that enables a fresh Claude session to continue your work.

## Steps

### 1. Gather Context
Run these commands to understand current state:
```bash
git status
git log --oneline -5
git diff --name-only HEAD~3
```

### 2. Create Handoff Document

Save to: `/docs/5-implementation/handoffs/handoff-YYYY-MM-DD-[feature].md`

Use this structure:

```markdown
# Session Handoff: [Feature Name]
**Date:** YYYY-MM-DD

## What Was Done
- [Achievement 1 with file references]
- [Achievement 2]
- [Achievement 3]

## Files Changed
| File | Change | Description |
|------|--------|-------------|
| `path/file.ts` | Created/Modified | Brief description |

## Key Decisions (Don't Undo)
1. **[Decision]** - [Why]
2. **[Decision]** - [Why]

## Known Issues
- [Issue and workaround if any]

## Next Steps
1. **[Task 1]** - Files: `[files]`
2. **[Task 2]** - Files: `[files]`

## Relevant Docs
- [Spec or workflow doc path]
```

### 3. Generate Continuation Prompt

Output a copy-paste prompt for the next session:

```markdown
# [NEXT TASK: Brief Summary]

Continuing work on FaithTech Regional Hub (Next.js 15, TypeScript, Supabase, Tailwind).

## Just Completed
- [What was built/fixed]

## Current State
- **Git:** [Clean/uncommitted] on `[branch]`
- **Last commit:** `[hash] [message]`

## Key Decisions (Preserve These)
1. [Decision and why]

## Next Steps
1. **[Task]** - Files: `[files]`

## Reference
- Handoff: `/docs/5-implementation/handoffs/handoff-YYYY-MM-DD-[feature].md`
- Conventions: `CLAUDE.md`

**Start by:** [First action]
```

### 4. Commit Handoff
```bash
git add docs/5-implementation/handoffs/
git commit -m "docs(handoff): [feature] session handoff YYYY-MM-DD"
```

## Output

1. Show saved handoff path
2. Display the continuation prompt for copying
