# TypeScript Strict Mode Enforcer

## Purpose
Automatically enforce strict TypeScript typing standards in the FaithTech codebase. This skill ensures type safety at all data boundaries and eliminates weak typing patterns.

## When to Activate
This skill is **ALWAYS ACTIVE** when:
- Writing any TypeScript code
- Reviewing code before presenting to user
- Editing existing TypeScript files
- Creating new components, functions, or modules

## Core Rules

### 1. NEVER Use `any` Type
**Rule**: The `any` type is **FORBIDDEN** in all code.

**Auto-Fix Strategy**:
- For function parameters: Infer proper type from usage or use generic type parameter
- For API responses: Use Zod schema validation and `.parse()` to derive type
- For unknown external data: Use `unknown` with proper type narrowing
- For complex types: Define explicit interface or type alias

**Examples**:

❌ **WRONG**:
```typescript
function processData(data: any) {
  return data.value;
}

const response: any = await fetch('/api/data');
```

✅ **AUTO-FIX TO**:
```typescript
interface DataInput {
  value: string;
}

function processData(data: DataInput) {
  return data.value;
}

// For API responses, ALWAYS use Zod
const ResponseSchema = z.object({
  value: z.string(),
}).strict();

const response = ResponseSchema.parse(await fetch('/api/data').then(r => r.json()));
```

### 2. Always Use `.strict()` on Zod Schemas
**Rule**: ALL Zod schemas MUST use `.strict()` to prevent unexpected properties.

**Auto-Fix Strategy**:
- Add `.strict()` to all `z.object()` definitions
- This prevents silent failures from typos or extra properties

**Examples**:

❌ **WRONG**:
```typescript
const EventSchema = z.object({
  title: z.string(),
  description: z.string(),
});
```

✅ **AUTO-FIX TO**:
```typescript
const EventSchema = z.object({
  title: z.string(),
  description: z.string(),
}).strict();
```

### 3. Explicit Return Types
**Rule**: All exported functions MUST have explicit return types.

**Auto-Fix Strategy**:
- Infer return type and make it explicit
- For async functions, use `Promise<Type>`
- For server actions, use standard return pattern: `Promise<{ data?: T; error?: string }>`

**Examples**:

❌ **WRONG**:
```typescript
export function getCurrentUser() {
  return supabase.auth.getUser();
}
```

✅ **AUTO-FIX TO**:
```typescript
export async function getCurrentUser(): Promise<{ data: { user: User | null }; error: Error | null }> {
  return supabase.auth.getUser();
}
```

### 4. Type Data Boundaries
**Rule**: ALL data crossing boundaries MUST be validated with Zod.

**Data Boundaries**:
- API responses (external APIs, Supabase queries)
- Form data (FormData, user input)
- Environment variables
- File system data
- Query parameters / route params

**Auto-Fix Strategy**:
- Create Zod schema for the expected data shape
- Use `.parse()` (not `.safeParse()`) to throw on invalid data
- Let errors bubble up to error boundaries

**Examples**:

❌ **WRONG**:
```typescript
export async function getEvent(slug: string) {
  const { data } = await supabase
    .from('events')
    .select('*')
    .eq('slug', slug)
    .single();

  return data;
}
```

✅ **AUTO-FIX TO**:
```typescript
const EventSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  starts_at: z.string().datetime(),
  // ... all fields
}).strict();

export async function getEvent(slug: string): Promise<z.infer<typeof EventSchema> | null> {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !data) return null;

  return EventSchema.parse(data);
}
```

### 5. No Implicit `any` from External Libraries
**Rule**: If a third-party library returns `any`, wrap it with proper types immediately.

**Auto-Fix Strategy**:
- Create type wrapper or assertion
- Document why the library doesn't provide types
- Consider if a better-typed alternative exists

### 6. Generic Type Parameters Over `unknown`
**Rule**: Prefer generic type parameters for reusable functions over `unknown`.

**Examples**:

❌ **ACCEPTABLE BUT NOT IDEAL**:
```typescript
function identity(value: unknown): unknown {
  return value;
}
```

✅ **BETTER**:
```typescript
function identity<T>(value: T): T {
  return value;
}
```

## Enforcement Process

### Before Presenting Code
1. **Scan for `any` keywords** in code about to be shown
2. **Auto-fix** all instances using strategies above
3. **Verify** all Zod schemas use `.strict()`
4. **Check** all exported functions have return types
5. **Only then** present code to user

### When Reviewing Existing Code
If asked to review or refactor code:
1. **Identify** all type violations
2. **Auto-fix** them as part of the changes
3. **Explain** what was improved (briefly)

## Integration with Project Patterns

### Server Actions Pattern
Server actions should always follow this type signature:
```typescript
export async function actionName(formData: FormData): Promise<{ data?: T; error?: string }> {
  // Implementation
}
```

### Supabase Client Usage
Always type Supabase queries with Zod validation:
```typescript
const { data } = await supabase.from('table').select('*');
// ❌ data is `any` here!

// ✅ Always validate:
const schema = z.array(TableSchema.strict());
const validatedData = schema.parse(data);
```

### Form Data Parsing
Always validate FormData with Zod:
```typescript
const FormSchema = z.object({
  title: z.string().min(1),
  description: z.string(),
}).strict();

const formData = Object.fromEntries(formDataInput);
const validated = FormSchema.parse(formData);
```

## Exceptions
**THERE ARE NO EXCEPTIONS.** `any` is never acceptable in this codebase.

If you encounter a situation where types seem impossible to figure out:
1. **Stop and think** - there's always a way to type it properly
2. **Use `unknown` with type guards** if truly dynamic
3. **Ask the user** if you're genuinely stuck (extremely rare)

## Success Criteria
- Zero `any` types in the codebase
- All Zod schemas use `.strict()`
- All data boundaries are validated
- All exported functions have explicit return types
- TypeScript compiler produces zero type errors
