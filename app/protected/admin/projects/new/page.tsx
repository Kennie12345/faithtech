/**
 * Create New Project Page (Admin)
 * Admin page for creating new projects
 */

import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getCurrentCityId, isAdmin } from '@/lib/core/api';
import { ProjectForm } from '@/components/projects/ProjectForm';
import { Button } from '@/components/ui/button';
import { ArrowLeftIcon } from 'lucide-react';

export default async function NewProjectPage() {
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
          Unauthorized. Only city admins can create projects here.
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
        <div>
          <h1 className="font-heading text-h2 font-600 leading-lh-1-1">Create Project</h1>
          <p className="text-muted-foreground mt-2">
            Showcase a new community project
          </p>
        </div>
      </div>

      {/* Form */}
      <ProjectForm mode="create" />
    </div>
  );
}
