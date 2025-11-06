/**
 * Submit New Project Page (Member)
 * Member page for submitting new projects
 */

import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getCurrentCityId } from '@/lib/core/api';
import { ProjectForm } from '@/components/projects/ProjectForm';
import { Button } from '@/components/ui/button';
import { ArrowLeftIcon } from 'lucide-react';

export default async function SubmitProjectPage() {
  const supabase = await createClient();

  // Check authentication
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/auth/login');
  }

  // Check city context
  const cityId = await getCurrentCityId();
  if (!cityId) {
    return (
      <div className="flex-1 w-full flex flex-col gap-12">
        <div className="bg-destructive/10 text-destructive p-3 px-5 rounded-md">
          No city context. Please select a city first.
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full flex flex-col gap-12">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/protected">
            <ArrowLeftIcon className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Submit Your Project</h1>
          <p className="text-muted-foreground mt-2">
            Share your CREATE project with the community
          </p>
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-muted/50 p-4 rounded-lg border">
        <h3 className="font-semibold mb-2">Project Submission Guidelines</h3>
        <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
          <li>Projects should be tech-for-good initiatives or CREATE hackathon projects</li>
          <li>Include links to GitHub repository or live demo if available</li>
          <li>Describe the problem your project solves and how it solves it</li>
          <li>City admins may feature outstanding projects on the homepage</li>
        </ul>
      </div>

      {/* Form */}
      <ProjectForm mode="create" />
    </div>
  );
}
