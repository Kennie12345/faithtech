/**
 * Admin Projects List Page
 * Shows all projects for the current city with management controls
 */

import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getCurrentCityId, isAdmin } from '@/lib/core/api';
import { getProjects } from '@/features/projects/actions';
import { YellowButton, BeigeContentCard } from '@/components/design-system';
import { PlusIcon, StarIcon, GithubIcon, ExternalLinkIcon } from 'lucide-react';
import { ToggleFeaturedButton } from '@/components/projects/ToggleFeaturedButton';

export default async function AdminProjectsPage() {
  const supabase = await createClient();

  // Check authentication
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/auth/login');
  }

  // Check authorization
  const cityId = await getCurrentCityId();
  if (!cityId) {
    return (
      <div className="flex-1 w-full flex flex-col gap-space-9">
        <div className="bg-destructive/10 text-destructive p-3 px-5 rounded-md">
          No city context. Please select a city first.
        </div>
      </div>
    );
  }

  const userIsAdmin = await isAdmin(cityId);
  if (!userIsAdmin) {
    return (
      <div className="flex-1 w-full flex flex-col gap-space-9">
        <div className="bg-destructive/10 text-destructive p-3 px-5 rounded-md">
          Unauthorized. Only city admins can manage projects.
        </div>
      </div>
    );
  }

  // Fetch all projects
  const projects = await getProjects(cityId);

  // Separate featured and regular projects
  const featuredProjects = projects.filter((p) => p.is_featured);
  const regularProjects = projects.filter((p) => !p.is_featured);

  return (
    <div className="flex-1 w-full flex flex-col gap-space-9">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-h2 font-600 leading-lh-1-1">Projects</h1>
          <p className="text-muted-foreground mt-2">
            Manage community projects and showcases
          </p>
        </div>
        <YellowButton asChild>
          <Link href="/protected/admin/projects/new">
            <PlusIcon className="mr-space-2 h-4 w-4" />
            Create Project
          </Link>
        </YellowButton>
      </div>

      {/* Featured Projects */}
      {featuredProjects.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <StarIcon className="h-5 w-5 fill-primary text-primary" />
            Featured Projects ({featuredProjects.length})
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {featuredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} isFeatured />
            ))}
          </div>
        </div>
      )}

      {/* All Projects */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">
          All Projects ({projects.length})
        </h2>
        {projects.length === 0 ? (
          <BeigeContentCard>
            <div className="py-space-4">
              <p className="text-muted-foreground text-center">
                No projects yet. Create your first project to get started!
              </p>
            </div>
          </BeigeContentCard>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {regularProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ProjectCard({
  project,
  isFeatured = false,
}: {
  project: Awaited<ReturnType<typeof getProjects>>[number];
  isFeatured?: boolean;
}) {
  return (
    <BeigeContentCard className={isFeatured ? 'ring-2 ring-brand-yellow-200' : ''}>
      <div className="space-y-space-4">
        <div>
          <div className="flex items-start justify-between gap-space-2 mb-space-2">
            <h3 className="font-heading text-h5 font-600 line-clamp-1">{project.title}</h3>
            <ToggleFeaturedButton projectId={project.id} isFeatured={project.is_featured} />
          </div>
          <p className="font-body text-p-14 text-brand-grey-500 line-clamp-2 leading-lh-1-5">
            {project.description || 'No description'}
          </p>
        </div>

        {project.problem_statement && (
          <div className="font-body text-p-14">
            <span className="font-500">Problem: </span>
            <span className="text-brand-grey-500 line-clamp-2">
              {project.problem_statement}
            </span>
          </div>
        )}

        <div className="flex items-center gap-space-2">
          {project.github_url && (
            <YellowButton variant="bright" size="sm" asChild>
              <a
                href={project.github_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-space-1"
              >
                <GithubIcon className="h-3 w-3" />
                <span className="sr-only">GitHub</span>
              </a>
            </YellowButton>
          )}
          {project.demo_url && (
            <YellowButton variant="bright" size="sm" asChild>
              <a
                href={project.demo_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-space-1"
              >
                <ExternalLinkIcon className="h-3 w-3" />
                Demo
              </a>
            </YellowButton>
          )}
        </div>

        <div className="pt-space-2">
          <YellowButton asChild className="w-full" size="sm">
            <Link href={`/protected/admin/projects/${project.id}`}>
              Manage Project
            </Link>
          </YellowButton>
        </div>
      </div>
    </BeigeContentCard>
  );
}
