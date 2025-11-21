/**
 * Blog Feature Server Actions
 * All database operations for blog posts
 */

'use server';

import { createClient } from '@/lib/supabase/server';
import { getUser, getCurrentCityId, isAdmin } from '@/lib/core/api';
import { emitEvent } from '@/lib/core/events';
import { revalidatePath } from 'next/cache';
import { slugify, generateUniqueSlug } from '@/lib/utils/slugify';
import type { Post, PostWithAuthor, ActionResult } from './types';

// =============================================================================
// POST CRUD OPERATIONS
// =============================================================================

/**
 * Get all posts for a city
 * @param cityId - Optional city ID (defaults to current city)
 * @param publishedOnly - Filter to only show published posts (default true)
 * @returns Array of posts
 */
export async function getPosts(
  cityId?: string,
  publishedOnly: boolean = true
): Promise<Post[]> {
  const supabase = await createClient();
  const targetCityId = cityId || (await getCurrentCityId());

  if (!targetCityId) {
    console.error('getPosts: No city context');
    return [];
  }

  let query = supabase
    .from('posts')
    .select('*')
    .eq('city_id', targetCityId)
    .order('created_at', { ascending: false });

  if (publishedOnly) {
    query = query.not('published_at', 'is', null);
  }

  const { data, error } = await query;

  if (error) {
    console.error('getPosts error:', error);
    return [];
  }

  return data as Post[];
}

/**
 * Get featured posts for a city
 * @param cityId - Optional city ID (defaults to current city)
 * @returns Array of featured published posts
 */
export async function getFeaturedPosts(cityId?: string): Promise<Post[]> {
  const supabase = await createClient();
  const targetCityId = cityId || (await getCurrentCityId());

  if (!targetCityId) {
    console.error('getFeaturedPosts: No city context');
    return [];
  }

  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('city_id', targetCityId)
    .eq('is_featured', true)
    .not('published_at', 'is', null)
    .order('published_at', { ascending: false })
    .limit(6);

  if (error) {
    console.error('getFeaturedPosts error:', error);
    return [];
  }

  return data as Post[];
}

/**
 * Get a single post by ID with author profile
 * @param postId - Post UUID
 * @returns Post with author or null
 */
export async function getPost(postId: string): Promise<PostWithAuthor | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('posts')
    .select(
      `
      *,
      author:profiles!created_by(id, display_name, avatar_url, email)
    `
    )
    .eq('id', postId)
    .single();

  if (error) {
    console.error('getPost error:', error);
    return null;
  }

  return data as unknown as PostWithAuthor;
}

/**
 * Get post by slug and city with author profile
 * @param cityId - City UUID
 * @param slug - Post slug
 * @returns Post with author or null
 */
export async function getPostBySlug(
  cityId: string,
  slug: string
): Promise<PostWithAuthor | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('posts')
    .select(
      `
      *,
      author:profiles!created_by(id, display_name, avatar_url, email)
    `
    )
    .eq('city_id', cityId)
    .eq('slug', slug)
    .single();

  if (error) {
    console.error('getPostBySlug error:', error);
    return null;
  }

  return data as unknown as PostWithAuthor;
}

/**
 * Create a new post (as draft)
 * Any authenticated member can create posts
 * @param formData - Form data from post creation form
 * @returns Action result with post ID or error
 */
export async function createPost(formData: FormData): Promise<ActionResult<{ id: string }>> {
  const supabase = await createClient();

  // Get current user and city
  const user = await getUser();
  const cityId = await getCurrentCityId();

  if (!user || !cityId) {
    return { error: 'Not authenticated or no city context' };
  }

  // Parse form data
  const title = formData.get('title') as string;
  const content = (formData.get('content') as string) || null;
  const excerpt = (formData.get('excerpt') as string) || null;
  const featured_image_url = (formData.get('featured_image_url') as string) || null;

  // Generate unique slug
  const baseSlug = slugify(title);
  const slug = await generateUniqueSlug(baseSlug, async (testSlug) => {
    const { data } = await supabase
      .from('posts')
      .select('id')
      .eq('city_id', cityId)
      .eq('slug', testSlug)
      .single();
    return !!data;
  });

  // Insert post (as draft - published_at is NULL)
  const { data, error } = await supabase
    .from('posts')
    .insert({
      city_id: cityId,
      title,
      content,
      slug,
      excerpt,
      featured_image_url,
      created_by: user.id,
      // published_at is NULL by default (draft)
    })
    .select()
    .single();

  if (error) {
    console.error('createPost error:', error);
    return { error: error.message };
  }

  // NO event emission for draft creation
  // Event is emitted only when post is published

  // Revalidate cache
  revalidatePath('/protected/admin/blog');
  revalidatePath('/protected/blog');

  return { data: { id: data.id } };
}

/**
 * Update an existing post
 * Creator or city admin can edit
 * @param postId - Post UUID
 * @param formData - Form data from post edit form
 * @returns Action result with success or error
 */
export async function updatePost(postId: string, formData: FormData): Promise<ActionResult> {
  const supabase = await createClient();

  // Get current user and city
  const user = await getUser();
  const cityId = await getCurrentCityId();

  if (!user || !cityId) {
    return { error: 'Not authenticated or no city context' };
  }

  // Get existing post
  const { data: existingPost } = await supabase
    .from('posts')
    .select('city_id, created_by')
    .eq('id', postId)
    .single();

  if (!existingPost || existingPost.city_id !== cityId) {
    return { error: 'Post not found or access denied' };
  }

  // Check authorization (creator OR admin)
  const userIsAdmin = await isAdmin(cityId);
  const isCreator = existingPost.created_by === user.id;

  if (!isCreator && !userIsAdmin) {
    return { error: 'Unauthorized - only post creator or city admin can edit' };
  }

  // Parse form data
  const updates: Record<string, any> = {};
  const title = formData.get('title') as string;
  if (title) updates.title = title;

  const content = formData.get('content');
  if (content !== undefined) updates.content = content || null;

  const excerpt = formData.get('excerpt');
  if (excerpt !== undefined) updates.excerpt = excerpt || null;

  const featured_image_url = formData.get('featured_image_url');
  if (featured_image_url !== undefined) updates.featured_image_url = featured_image_url || null;

  // Update post
  const { error } = await supabase.from('posts').update(updates).eq('id', postId);

  if (error) {
    console.error('updatePost error:', error);
    return { error: error.message };
  }

  // Emit event
  emitEvent('post:updated', {
    postId,
    cityId,
    updatedBy: user.id,
  });

  // Revalidate cache
  revalidatePath('/protected/admin/blog');
  revalidatePath(`/protected/admin/blog/${postId}`);
  revalidatePath('/protected/blog');
  revalidatePath(`/[citySlug]/blog`, 'page');

  return { data: undefined };
}

/**
 * Delete a post
 * Only city admins can delete (not post creators)
 * @param postId - Post UUID
 * @returns Action result with success or error
 */
export async function deletePost(postId: string): Promise<ActionResult> {
  const supabase = await createClient();

  // Get current user and city
  const user = await getUser();
  const cityId = await getCurrentCityId();

  if (!user || !cityId) {
    return { error: 'Not authenticated or no city context' };
  }

  // Check authorization (admin only)
  const userIsAdmin = await isAdmin(cityId);
  if (!userIsAdmin) {
    return { error: 'Unauthorized - only city admins can delete posts' };
  }

  // Verify post belongs to current city
  const { data: existingPost } = await supabase
    .from('posts')
    .select('city_id')
    .eq('id', postId)
    .single();

  if (!existingPost || existingPost.city_id !== cityId) {
    return { error: 'Post not found or access denied' };
  }

  // Delete post
  const { error } = await supabase.from('posts').delete().eq('id', postId);

  if (error) {
    console.error('deletePost error:', error);
    return { error: error.message };
  }

  // Emit event
  emitEvent('post:deleted', {
    postId,
    cityId,
    deletedBy: user.id,
  });

  // Revalidate cache
  revalidatePath('/protected/admin/blog');
  revalidatePath('/protected/blog');
  revalidatePath(`/[citySlug]/blog`, 'page');

  return { data: undefined };
}

// =============================================================================
// PUBLISH/UNPUBLISH OPERATIONS
// =============================================================================

/**
 * Publish a post
 * Creator or city admin can publish
 * This is when the 'post:published' event is emitted (triggers newsletter)
 * @param postId - Post UUID
 * @returns Action result with success or error
 */
export async function publishPost(postId: string): Promise<ActionResult> {
  const supabase = await createClient();

  // Get current user and city
  const user = await getUser();
  const cityId = await getCurrentCityId();

  if (!user || !cityId) {
    return { error: 'Not authenticated or no city context' };
  }

  // Get existing post
  const { data: existingPost } = await supabase
    .from('posts')
    .select('city_id, created_by, published_at, title')
    .eq('id', postId)
    .single();

  if (!existingPost || existingPost.city_id !== cityId) {
    return { error: 'Post not found or access denied' };
  }

  // Check if already published
  if (existingPost.published_at) {
    return { error: 'Post is already published' };
  }

  // Check authorization (creator OR admin)
  const userIsAdmin = await isAdmin(cityId);
  const isCreator = existingPost.created_by === user.id;

  if (!isCreator && !userIsAdmin) {
    return { error: 'Unauthorized - only post creator or city admin can publish' };
  }

  // Publish post
  const { error } = await supabase
    .from('posts')
    .update({ published_at: new Date().toISOString() })
    .eq('id', postId);

  if (error) {
    console.error('publishPost error:', error);
    return { error: error.message };
  }

  // Emit event (IMPORTANT: Newsletter feature listens to this!)
  emitEvent('post:published', {
    postId,
    cityId,
    authorId: user.id,
    title: existingPost.title,
  });

  // Revalidate cache
  revalidatePath('/protected/admin/blog');
  revalidatePath(`/protected/admin/blog/${postId}`);
  revalidatePath('/protected/blog');
  revalidatePath(`/[citySlug]/blog`, 'page');

  return { data: undefined };
}

/**
 * Unpublish a post (revert to draft)
 * Creator or city admin can unpublish
 * @param postId - Post UUID
 * @returns Action result with success or error
 */
export async function unpublishPost(postId: string): Promise<ActionResult> {
  const supabase = await createClient();

  // Get current user and city
  const user = await getUser();
  const cityId = await getCurrentCityId();

  if (!user || !cityId) {
    return { error: 'Not authenticated or no city context' };
  }

  // Get existing post
  const { data: existingPost } = await supabase
    .from('posts')
    .select('city_id, created_by, published_at')
    .eq('id', postId)
    .single();

  if (!existingPost || existingPost.city_id !== cityId) {
    return { error: 'Post not found or access denied' };
  }

  // Check if already draft
  if (!existingPost.published_at) {
    return { error: 'Post is already a draft' };
  }

  // Check authorization (creator OR admin)
  const userIsAdmin = await isAdmin(cityId);
  const isCreator = existingPost.created_by === user.id;

  if (!isCreator && !userIsAdmin) {
    return { error: 'Unauthorized - only post creator or city admin can unpublish' };
  }

  // Unpublish post
  const { error } = await supabase
    .from('posts')
    .update({ published_at: null })
    .eq('id', postId);

  if (error) {
    console.error('unpublishPost error:', error);
    return { error: error.message };
  }

  // Emit event
  emitEvent('post:unpublished', {
    postId,
    cityId,
  });

  // Revalidate cache
  revalidatePath('/protected/admin/blog');
  revalidatePath(`/protected/admin/blog/${postId}`);
  revalidatePath('/protected/blog');
  revalidatePath(`/[citySlug]/blog`, 'page');

  return { data: undefined };
}

// =============================================================================
// FEATURED OPERATIONS
// =============================================================================

/**
 * Toggle featured status for a post
 * Only city admins can feature posts
 * @param postId - Post UUID
 * @returns Action result with success or error
 */
export async function toggleFeatured(postId: string): Promise<ActionResult> {
  const supabase = await createClient();

  // Get current user and city
  const user = await getUser();
  const cityId = await getCurrentCityId();

  if (!user || !cityId) {
    return { error: 'Not authenticated or no city context' };
  }

  // Check authorization (admin only)
  const userIsAdmin = await isAdmin(cityId);
  if (!userIsAdmin) {
    return { error: 'Unauthorized - only city admins can feature posts' };
  }

  // Get current featured status
  const { data: existingPost } = await supabase
    .from('posts')
    .select('city_id, is_featured')
    .eq('id', postId)
    .single();

  if (!existingPost || existingPost.city_id !== cityId) {
    return { error: 'Post not found or access denied' };
  }

  // Toggle featured status
  const { error } = await supabase
    .from('posts')
    .update({ is_featured: !existingPost.is_featured })
    .eq('id', postId);

  if (error) {
    console.error('toggleFeatured error:', error);
    return { error: error.message };
  }

  // Emit event if newly featured
  if (!existingPost.is_featured) {
    emitEvent('post:featured', {
      postId,
      cityId,
      featuredBy: user.id,
    });
  }

  // Revalidate cache
  revalidatePath('/protected/admin/blog');
  revalidatePath(`/protected/admin/blog/${postId}`);
  revalidatePath(`/[citySlug]/blog`, 'page');
  revalidatePath(`/[citySlug]`, 'page'); // Homepage shows featured posts

  return { data: undefined };
}
