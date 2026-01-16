/**
 * Edit Project Page
 * Admin page for editing projects and managing team members
 */

import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getCurrentCityId, isAdmin, getUser } from '@/lib/core/api';
import { getProject } from '@/features/projects/actions';
import { ProjectForm } from '@/components/projects/ProjectForm';
import { TeamMembersList } from '@/components/projects/TeamMembersList';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeftIcon } from 'lucide-react';
import { DeleteProjectButton } from '@/components/projects/DeleteProjectButton';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProjectPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  // Check authentication
  const user = await getUser();
  if (!user) {
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

  // Fetch project with members
  const project = await getProject(id);
  if (!project) {
    notFound();
  }

  // Verify project belongs to current city
  if (project.city_id !== cityId) {
    return (
      <div className="flex-1 w-full flex flex-col gap-space-9">
        <div className="bg-destructive/10 text-destructive p-3 px-5 rounded-md">
          Project not found in your city.
        </div>
      </div>
    );
  }

  // Check if user can edit (creator OR admin)
  const userIsAdmin = await isAdmin(cityId);
  const isCreator = project.created_by === user.id;
  const canEdit = isCreator || userIsAdmin;

  if (!canEdit) {
    return (
      <div className="flex-1 w-full flex flex-col gap-space-9">
        <div className="bg-destructive/10 text-destructive p-3 px-5 rounded-md">
          Unauthorized. Only project creator or city admins can edit projects.
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full flex flex-col gap-space-9">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/protected/admin/projects">
            <ArrowLeftIcon className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="font-heading text-h2 font-600 leading-lh-1-1">Edit Project</h1>
          <p className="text-muted-foreground mt-2">{project.title}</p>
        </div>
        {userIsAdmin && <DeleteProjectButton projectId={project.id} />}
      </div>

      {/* Project Form */}
      <ProjectForm mode="edit" project={project} />

      {/* Team Members Section */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Team Members</h2>
        <Card>
          <CardHeader>
            <CardTitle>Project Team</CardTitle>
            <CardDescription>
              Manage the team members who worked on this project
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TeamMembersList
              projectId={project.id}
              members={project.members}
              canEdit={canEdit}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
