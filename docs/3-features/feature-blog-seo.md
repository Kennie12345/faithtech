# Feature: SEO-Ready Blog

**Priority:** High (Phase 2)
**Complexity:** Medium
**Dependencies:** [core/01-data-model.md](../core/01-data-model.md)

---

## Purpose

City-scoped blog for announcements, testimonies, tech articles written by local community.

**Scope:** Markdown editor, publish/draft, SEO metadata

**Out of Scope:** Comments, tags, multi-author attribution

---

## User Stories

1. **As a** city admin, **I want** to publish blog posts, **So that** I can share news and stories with my community.
2. **As a** visitor, **I want** to read blog posts, **So that** I learn about the local FaithTech community.
3. **As a** search engine, **I want** structured metadata, **So that** I can index and rank posts correctly.

---

## Data Model

```sql
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id UUID NOT NULL REFERENCES cities(id) ON DELETE CASCADE,

  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  content_markdown TEXT,  -- Markdown body
  excerpt TEXT,           -- Summary for list views

  -- SEO
  meta_description TEXT,
  og_image_url TEXT,

  -- Publishing
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  published_at TIMESTAMPTZ,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  author_id UUID REFERENCES auth.users(id),

  UNIQUE(city_id, slug)
);

CREATE INDEX posts_city_idx ON posts(city_id);
CREATE INDEX posts_published_idx ON posts(published_at DESC) WHERE status = 'published';
```

---

## RLS Policies

```sql
-- SELECT: Published posts visible to all, drafts only to city admin
CREATE POLICY "posts_select" ON posts FOR SELECT USING (
  status = 'published' OR auth.user_role(city_id) IN ('city_admin', 'super_admin')
);

-- INSERT/UPDATE/DELETE: City admins only
CREATE POLICY "posts_insert" ON posts FOR INSERT WITH CHECK (
  city_id = auth.current_city() AND auth.user_role(city_id) IN ('city_admin', 'super_admin')
);

CREATE POLICY "posts_update" ON posts FOR UPDATE USING (
  auth.user_role(city_id) IN ('city_admin', 'super_admin')
);

CREATE POLICY "posts_delete" ON posts FOR DELETE USING (
  auth.user_role(city_id) IN ('city_admin', 'super_admin')
);
```

---

## Server Actions

```typescript
'use server'
export async function createPost(formData: FormData) {
  const cityId = await CoreAPI.getCurrentCity();
  const isAdmin = await CoreAPI.isAdmin(cityId);
  if (!isAdmin) return { error: 'Unauthorized' };

  const { data, error } = await supabase.from('posts').insert({
    city_id: cityId,
    title: formData.get('title'),
    slug: generateSlug(formData.get('title')),
    content_markdown: formData.get('content'),
    excerpt: formData.get('excerpt'),
    status: formData.get('status') || 'draft',
    published_at: formData.get('status') === 'published' ? new Date() : null,
    author_id: (await CoreAPI.getUser()).id,
  }).select().single();

  if (!error && data.status === 'published') {
    await events.emit('post:published', { postId: data.id, cityId, title: data.title });
  }

  return { data, error };
}

export async function publishPost(postId: string) {
  const { data, error } = await supabase
    .from('posts')
    .update({ status: 'published', published_at: new Date() })
    .eq('id', postId)
    .select().single();

  if (!error) {
    await events.emit('post:published', { postId, cityId: data.city_id, title: data.title });
  }

  return { data, error };
}
```

---

## UI Routes

| Route | Access | Purpose |
|-------|--------|---------|
| `/protected/admin/blog` | City Admin | Manage posts |
| `/protected/admin/blog/new` | City Admin | Write post |
| `/protected/admin/blog/[id]` | City Admin | Edit post |
| `/[citySlug]/blog` | Public | View posts |
| `/[citySlug]/blog/[slug]` | Public | Read post (with SEO) |

---

## SEO Implementation

```typescript
// app/[citySlug]/blog/[slug]/page.tsx
export async function generateMetadata({ params }): Promise<Metadata> {
  const { data: post } = await supabase
    .from('posts')
    .select('*')
    .eq('slug', params.slug)
    .eq('status', 'published')
    .single();

  return {
    title: post.title,
    description: post.meta_description || post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [post.og_image_url],
      type: 'article',
      publishedTime: post.published_at,
    },
  };
}
```

---

## Event Bus

**Emits:**
- `post:published` - Post published
- `post:unpublished` - Post reverted to draft

**Listens:**
- None (standalone feature)

---

## Acceptance Criteria

- [x] City admins can write posts in Markdown
- [x] Draft/publish workflow
- [x] Public can view published posts only
- [x] SEO metadata (title, description, OG tags)
- [x] Posts scoped to city

---

## Summary

Blog feature provides:
- ✅ Share city news and stories
- ✅ SEO-optimized for discoverability
- ✅ Markdown editor for easy writing
