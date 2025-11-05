# Feature: CREATE Projects Showcase

**Priority:** Critical (Phase 2)
**Complexity:** Medium
**Dependencies:** [core/01-data-model.md](../core/01-data-model.md)

---

## Purpose

Showcase FaithTech CREATE projects (hackathons, tech-for-good initiatives) built by local communities.

**Scope:** Project submission, display, filtering by city

**Out of Scope:** Approval workflow, team management, project voting

---

## User Stories

1. **As a** city admin, **I want** to showcase projects our community built, **So that** we attract new members and demonstrate impact.
2. **As a** member, **I want** to submit my project, **So that** it's featured on the city website.
3. **As a** visitor, **I want** to see what projects this city has built, **So that** I understand what FaithTech does.

---

## Data Model

```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id UUID NOT NULL REFERENCES cities(id) ON DELETE CASCADE,

  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  problem_statement TEXT,  -- What problem does it solve?
  solution TEXT,            -- How does it solve it?

  -- Links
  github_url TEXT,
  demo_url TEXT,
  image_url TEXT,

  -- Metadata
  is_featured BOOLEAN DEFAULT FALSE,  -- City admin can feature projects
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),

  UNIQUE(city_id, slug)
);

CREATE INDEX projects_city_idx ON projects(city_id);
CREATE INDEX projects_featured_idx ON projects(is_featured, created_at DESC);

-- Project team members
CREATE TABLE project_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'contributor',  -- 'lead', 'contributor'

  UNIQUE(project_id, user_id)
);
```

---

## RLS Policies

```sql
-- Projects: SELECT (city isolation)
CREATE POLICY "projects_select" ON projects FOR SELECT USING (city_id = auth.current_city());

-- Projects: INSERT (members can submit)
CREATE POLICY "projects_insert" ON projects FOR INSERT WITH CHECK (
  city_id = auth.current_city() AND created_by = auth.uid()
);

-- Projects: UPDATE (creator or city admin)
CREATE POLICY "projects_update" ON projects FOR UPDATE USING (
  created_by = auth.uid() OR auth.user_role(city_id) IN ('city_admin', 'super_admin')
);

-- Projects: DELETE (city admin only)
CREATE POLICY "projects_delete" ON projects FOR DELETE USING (
  auth.user_role(city_id) IN ('city_admin', 'super_admin')
);

-- Project members: Everyone can view
CREATE POLICY "project_members_select" ON project_members FOR SELECT USING (TRUE);
```

---

## Server Actions

```typescript
'use server'
export async function createProject(formData: FormData) {
  const cityId = await CoreAPI.getCurrentCity();
  const user = await CoreAPI.getUser();

  const { data, error } = await supabase.from('projects').insert({
    city_id: cityId,
    title: formData.get('title'),
    slug: generateSlug(formData.get('title')),
    description: formData.get('description'),
    github_url: formData.get('github_url'),
    demo_url: formData.get('demo_url'),
    created_by: user.id,
  }).select().single();

  if (!error) {
    await events.emit('project:submitted', { projectId: data.id, cityId });
  }

  return { data, error };
}

export async function toggleFeatured(projectId: string) {
  const isAdmin = await CoreAPI.isAdmin(await CoreAPI.getCurrentCity());
  if (!isAdmin) return { error: 'Unauthorized' };

  const { data, error } = await supabase
    .from('projects')
    .update({ is_featured: !is_featured })
    .eq('id', projectId)
    .select().single();

  return { data, error };
}
```

---

## UI Routes

| Route | Access | Purpose |
|-------|--------|---------|
| `/protected/admin/projects` | City Admin | Manage projects, toggle featured |
| `/protected/projects/new` | Member | Submit project |
| `/[citySlug]/projects` | Public | View all projects |
| `/[citySlug]/projects/[slug]` | Public | Project detail |

---

## Event Bus

**Emits:**
- `project:submitted` - Member submits project
- `project:approved` - City admin features project

**Listens:**
- None (standalone feature)

---

## Acceptance Criteria

- [x] Members can submit projects
- [x] City admins can feature/unfeature projects
- [x] Public can view projects filtered by city
- [x] Project detail shows team members
- [x] Featured projects shown on homepage

---

## Summary

Projects feature provides:
- ✅ Showcase local community impact
- ✅ Member contributions visible
- ✅ SEO-friendly project pages
