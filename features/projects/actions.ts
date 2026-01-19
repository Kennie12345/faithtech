/**
 * Projects Feature Server Actions
 * All database operations for projects and team members
 */

'use server';

import { createClient } from '@/lib/supabase/server';
import { getUser, getCurrentCityId, isAdmin } from '@/lib/core/api';
import { emitEvent } from '@/lib/core/events';
import { revalidatePath } from 'next/cache';
import { slugify, generateUniqueSlug } from '@/lib/utils/slugify';
import type {
  Project,
  ProjectWithMembers,
  ProjectMemberWithProfile,
  ProjectMemberRole,
  ActionResult,
} from './types';

// =============================================================================
// PROJECT CRUD OPERATIONS
// =============================================================================

/**
 * Get all projects for a city
 * @param cityId - Optional city ID (defaults to current city)
 * @param featuredOnly - Filter to only show featured projects
 * @returns Array of projects
 */
export async function getProjects(
  cityId?: string,
  featuredOnly: boolean = false
): Promise<Project[]> {
  const supabase = await createClient();
  const targetCityId = cityId || (await getCurrentCityId());

  if (!targetCityId) {
    console.error('getProjects: No city context');
    return [];
  }

  let query = supabase
    .from('projects')
    .select('*')
    .eq('city_id', targetCityId)
    .order('created_at', { ascending: false });

  if (featuredOnly) {
    query = query.eq('is_featured', true);
  }

  const { data, error } = await query;

  if (error) {
    console.error('getProjects error:', error);
    return [];
  }

  return data as Project[];
}

/**
 * Get a single project by ID with team members
 * @param projectId - Project UUID
 * @returns Project with team members or null
 */
export async function getProject(projectId: string): Promise<ProjectWithMembers | null> {
  const supabase = await createClient();

  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .single();

  if (projectError || !project) {
    console.error('getProject error:', projectError);
    return null;
  }

  // Get team members with profiles
  const { data: members, error: membersError } = await supabase
    .from('project_members')
    .select(
      `
      *,
      profile:profiles(id, display_name, avatar_url, email)
    `
    )
    .eq('project_id', projectId)
    .order('created_at', { ascending: true });

  if (membersError) {
    console.error('getProject members error:', membersError);
    return {
      ...project,
      members: [],
    } as ProjectWithMembers;
  }

  return {
    ...project,
    members: members as unknown as ProjectMemberWithProfile[],
  } as ProjectWithMembers;
}

/**
 * Get project by slug and city
 * @param cityId - City UUID
 * @param slug - Project slug
 * @returns Project with team members or null
 */
export async function getProjectBySlug(
  cityId: string,
  slug: string
): Promise<ProjectWithMembers | null> {
  const supabase = await createClient();

  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('*')
    .eq('city_id', cityId)
    .eq('slug', slug)
    .single();

  if (projectError || !project) {
    console.error('getProjectBySlug error:', projectError);
    return null;
  }

  // Get team members with profiles
  const { data: members, error: membersError } = await supabase
    .from('project_members')
    .select(
      `
      *,
      profile:profiles(id, display_name, avatar_url, email)
    `
    )
    .eq('project_id', project.id)
    .order('created_at', { ascending: true });

  if (membersError) {
    console.error('getProjectBySlug members error:', membersError);
    return {
      ...project,
      members: [],
    } as ProjectWithMembers;
  }

  return {
    ...project,
    members: members as unknown as ProjectMemberWithProfile[],
  } as ProjectWithMembers;
}

/**
 * Create a new project
 * Any authenticated member can submit projects
 * @param formData - Form data from project creation form
 * @returns Action result with project ID or error
 */
export async function createProject(formData: FormData): Promise<ActionResult<{ id: string }>> {
  const supabase = await createClient();

  // Get current user and city
  const user = await getUser();
  const cityId = await getCurrentCityId();

  if (!user || !cityId) {
    return { error: 'Not authenticated or no city context' };
  }

  // Parse form data
  const title = formData.get('title') as string;
  const description = (formData.get('description') as string) || null;
  const problem_statement = (formData.get('problem_statement') as string) || null;
  const solution = (formData.get('solution') as string) || null;
  const github_url = (formData.get('github_url') as string) || null;
  const demo_url = (formData.get('demo_url') as string) || null;
  const image_url = (formData.get('image_url') as string) || null;

  // Generate unique slug
  const baseSlug = slugify(title);
  const slug = await generateUniqueSlug(baseSlug, async (testSlug) => {
    const { data } = await supabase
      .from('projects')
      .select('id')
      .eq('city_id', cityId)
      .eq('slug', testSlug)
      .single();
    return !!data;
  });

  // Insert project
  const { data, error } = await supabase
    .from('projects')
    .insert({
      city_id: cityId,
      title,
      description,
      slug,
      problem_statement,
      solution,
      github_url,
      demo_url,
      image_url,
      created_by: user.id,
    })
    .select()
    .single();

  if (error) {
    console.error('createProject error:', error);
    return { error: error.message };
  }

  // Emit event
  emitEvent('project:submitted', {
    projectId: data.id,
    cityId,
    createdBy: user.id,
  });

  // Revalidate cache
  revalidatePath('/protected/admin/projects');
  revalidatePath('/protected/projects');
  revalidatePath(`/[citySlug]/projects`, 'page');

  return { data: { id: data.id } };
}

/**
 * Update an existing project
 * Creator or city admin can edit
 * @param projectId - Project UUID
 * @param formData - Form data from project edit form
 * @returns Action result with success or error
 */
export async function updateProject(
  projectId: string,
  formData: FormData
): Promise<ActionResult> {
  const supabase = await createClient();

  // Get current user and city
  const user = await getUser();
  const cityId = await getCurrentCityId();

  if (!user || !cityId) {
    return { error: 'Not authenticated or no city context' };
  }

  // Get existing project
  const { data: existingProject } = await supabase
    .from('projects')
    .select('city_id, created_by')
    .eq('id', projectId)
    .single();

  if (!existingProject || existingProject.city_id !== cityId) {
    return { error: 'Project not found or access denied' };
  }

  // Check authorization (creator OR admin)
  const userIsAdmin = await isAdmin(cityId);
  const isCreator = existingProject.created_by === user.id;

  if (!isCreator && !userIsAdmin) {
    return { error: 'Unauthorized - only project creator or city admin can edit' };
  }

  // Parse form data
  const updates: Record<string, any> = {};
  const title = formData.get('title') as string;
  if (title) updates.title = title;

  const description = formData.get('description');
  if (description !== undefined) updates.description = description || null;

  const problem_statement = formData.get('problem_statement');
  if (problem_statement !== undefined) updates.problem_statement = problem_statement || null;

  const solution = formData.get('solution');
  if (solution !== undefined) updates.solution = solution || null;

  const github_url = formData.get('github_url');
  if (github_url !== undefined) updates.github_url = github_url || null;

  const demo_url = formData.get('demo_url');
  if (demo_url !== undefined) updates.demo_url = demo_url || null;

  const image_url = formData.get('image_url');
  if (image_url !== undefined) updates.image_url = image_url || null;

  // Update project
  const { error } = await supabase
    .from('projects')
    .update(updates)
    .eq('id', projectId);

  if (error) {
    console.error('updateProject error:', error);
    return { error: error.message };
  }

  // Emit event
  emitEvent('project:updated', {
    projectId,
    cityId,
    updatedBy: user.id,
  });

  // Revalidate cache
  revalidatePath('/protected/admin/projects');
  revalidatePath(`/protected/admin/projects/${projectId}`);
  revalidatePath('/protected/projects');
  revalidatePath(`/[citySlug]/projects`, 'page');

  return { data: undefined };
}

/**
 * Delete a project
 * Only city admins can delete (not project creators)
 * @param projectId - Project UUID
 * @returns Action result with success or error
 */
export async function deleteProject(projectId: string): Promise<ActionResult> {
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
    return { error: 'Unauthorized - only city admins can delete projects' };
  }

  // Verify project belongs to current city
  const { data: existingProject } = await supabase
    .from('projects')
    .select('city_id')
    .eq('id', projectId)
    .single();

  if (!existingProject || existingProject.city_id !== cityId) {
    return { error: 'Project not found or access denied' };
  }

  // Delete project (team members will cascade delete)
  const { error } = await supabase.from('projects').delete().eq('id', projectId);

  if (error) {
    console.error('deleteProject error:', error);
    return { error: error.message };
  }

  // Emit event
  emitEvent('project:deleted', {
    projectId,
    cityId,
    deletedBy: user.id,
  });

  // Revalidate cache
  revalidatePath('/protected/admin/projects');
  revalidatePath('/protected/projects');
  revalidatePath(`/[citySlug]/projects`, 'page');

  return { data: undefined };
}

/**
 * Toggle featured status for a project
 * Only city admins can feature projects
 * @param projectId - Project UUID
 * @returns Action result with success or error
 */
export async function toggleFeatured(projectId: string): Promise<ActionResult> {
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
    return { error: 'Unauthorized - only city admins can feature projects' };
  }

  // Get current featured status
  const { data: existingProject } = await supabase
    .from('projects')
    .select('city_id, is_featured')
    .eq('id', projectId)
    .single();

  if (!existingProject || existingProject.city_id !== cityId) {
    return { error: 'Project not found or access denied' };
  }

  // Toggle featured status
  const { error } = await supabase
    .from('projects')
    .update({ is_featured: !existingProject.is_featured })
    .eq('id', projectId);

  if (error) {
    console.error('toggleFeatured error:', error);
    return { error: error.message };
  }

  // Emit event if newly featured
  if (!existingProject.is_featured) {
    emitEvent('project:featured', {
      projectId,
      cityId,
      featuredBy: user.id,
    });
  }

  // Revalidate cache
  revalidatePath('/protected/admin/projects');
  revalidatePath(`/protected/admin/projects/${projectId}`);
  revalidatePath(`/[citySlug]/projects`, 'page');
  revalidatePath(`/[citySlug]`, 'page'); // Homepage shows featured projects

  return { data: undefined };
}

// =============================================================================
// TEAM MEMBER OPERATIONS
// =============================================================================

/**
 * Get all team members for a project with profiles
 * @param projectId - Project UUID
 * @returns Array of team members with user profiles
 */
export async function getProjectMembers(projectId: string): Promise<ProjectMemberWithProfile[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('project_members')
    .select(
      `
      *,
      profile:profiles(id, display_name, avatar_url, email)
    `
    )
    .eq('project_id', projectId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('getProjectMembers error:', error);
    return [];
  }

  return data as unknown as ProjectMemberWithProfile[];
}

/**
 * Add a team member to a project
 * Only project creator or city admin can add members
 * @param projectId - Project UUID
 * @param userId - User UUID to add
 * @param role - Team role (lead or contributor)
 * @returns Action result with success or error
 */
export async function addTeamMember(
  projectId: string,
  userId: string,
  role: ProjectMemberRole
): Promise<ActionResult> {
  const supabase = await createClient();

  // Get current user and city
  const user = await getUser();
  const cityId = await getCurrentCityId();

  if (!user || !cityId) {
    return { error: 'Not authenticated or no city context' };
  }

  // Get existing project
  const { data: existingProject } = await supabase
    .from('projects')
    .select('city_id, created_by')
    .eq('id', projectId)
    .single();

  if (!existingProject || existingProject.city_id !== cityId) {
    return { error: 'Project not found or access denied' };
  }

  // Check authorization (creator OR admin)
  const userIsAdmin = await isAdmin(cityId);
  const isCreator = existingProject.created_by === user.id;

  if (!isCreator && !userIsAdmin) {
    return { error: 'Unauthorized - only project creator or city admin can add members' };
  }

  // Insert team member
  const { error } = await supabase.from('project_members').insert({
    project_id: projectId,
    user_id: userId,
    role,
  });

  if (error) {
    console.error('addTeamMember error:', error);
    return { error: error.message };
  }

  // Revalidate cache
  revalidatePath('/protected/admin/projects');
  revalidatePath(`/protected/admin/projects/${projectId}`);
  revalidatePath(`/[citySlug]/projects`, 'page');

  return { data: undefined };
}

/**
 * Remove a team member from a project
 * Only project creator or city admin can remove members
 * @param projectId - Project UUID
 * @param userId - User UUID to remove
 * @returns Action result with success or error
 */
export async function removeTeamMember(
  projectId: string,
  userId: string
): Promise<ActionResult> {
  const supabase = await createClient();

  // Get current user and city
  const user = await getUser();
  const cityId = await getCurrentCityId();

  if (!user || !cityId) {
    return { error: 'Not authenticated or no city context' };
  }

  // Get existing project
  const { data: existingProject } = await supabase
    .from('projects')
    .select('city_id, created_by')
    .eq('id', projectId)
    .single();

  if (!existingProject || existingProject.city_id !== cityId) {
    return { error: 'Project not found or access denied' };
  }

  // Check authorization (creator OR admin)
  const userIsAdmin = await isAdmin(cityId);
  const isCreator = existingProject.created_by === user.id;

  if (!isCreator && !userIsAdmin) {
    return { error: 'Unauthorized - only project creator or city admin can remove members' };
  }

  // Delete team member
  const { error } = await supabase
    .from('project_members')
    .delete()
    .eq('project_id', projectId)
    .eq('user_id', userId);

  if (error) {
    console.error('removeTeamMember error:', error);
    return { error: error.message };
  }

  // Revalidate cache
  revalidatePath('/protected/admin/projects');
  revalidatePath(`/protected/admin/projects/${projectId}`);
  revalidatePath(`/[citySlug]/projects`, 'page');

  return { data: undefined };
}

/**
 * Update a team member's role
 * Only project creator or city admin can update roles
 * @param projectId - Project UUID
 * @param userId - User UUID
 * @param role - New team role
 * @returns Action result with success or error
 */
export async function updateMemberRole(
  projectId: string,
  userId: string,
  role: ProjectMemberRole
): Promise<ActionResult> {
  const supabase = await createClient();

  // Get current user and city
  const user = await getUser();
  const cityId = await getCurrentCityId();

  if (!user || !cityId) {
    return { error: 'Not authenticated or no city context' };
  }

  // Get existing project
  const { data: existingProject } = await supabase
    .from('projects')
    .select('city_id, created_by')
    .eq('id', projectId)
    .single();

  if (!existingProject || existingProject.city_id !== cityId) {
    return { error: 'Project not found or access denied' };
  }

  // Check authorization (creator OR admin)
  const userIsAdmin = await isAdmin(cityId);
  const isCreator = existingProject.created_by === user.id;

  if (!isCreator && !userIsAdmin) {
    return { error: 'Unauthorized - only project creator or city admin can update roles' };
  }

  // Update team member role
  const { error } = await supabase
    .from('project_members')
    .update({ role })
    .eq('project_id', projectId)
    .eq('user_id', userId);

  if (error) {
    console.error('updateMemberRole error:', error);
    return { error: error.message };
  }

  // Revalidate cache
  revalidatePath('/protected/admin/projects');
  revalidatePath(`/protected/admin/projects/${projectId}`);
  revalidatePath(`/[citySlug]/projects`, 'page');

  return { data: undefined };
}
