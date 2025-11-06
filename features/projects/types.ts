/**
 * Projects Feature Types
 * TypeScript types matching the database schema
 */

// Team member role type
export type ProjectMemberRole = 'lead' | 'contributor';

// Project from database
export interface Project {
  id: string;
  city_id: string;
  title: string;
  description: string | null;
  slug: string;
  problem_statement: string | null;
  solution: string | null;
  github_url: string | null;
  demo_url: string | null;
  image_url: string | null;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

// Project member from database
export interface ProjectMember {
  id: string;
  project_id: string;
  user_id: string;
  role: ProjectMemberRole;
  created_at: string;
}

// Project with team members (for detail views)
export interface ProjectWithMembers extends Project {
  members: ProjectMemberWithProfile[];
}

// Project member with user profile (for team display)
export interface ProjectMemberWithProfile extends ProjectMember {
  profile: {
    id: string;
    display_name: string | null;
    avatar_url: string | null;
    email: string | null;
  };
}

// Input types for creating/updating projects
export interface CreateProjectInput {
  city_id: string;
  title: string;
  description?: string | null;
  slug: string;
  problem_statement?: string | null;
  solution?: string | null;
  github_url?: string | null;
  demo_url?: string | null;
  image_url?: string | null;
  created_by: string;
}

export interface UpdateProjectInput {
  title?: string;
  description?: string | null;
  problem_statement?: string | null;
  solution?: string | null;
  github_url?: string | null;
  demo_url?: string | null;
  image_url?: string | null;
}

// Input type for adding team member
export interface AddMemberInput {
  project_id: string;
  user_id: string;
  role: ProjectMemberRole;
}

// Server action return types
export interface ActionResult<T = void> {
  data?: T;
  error?: string;
}
