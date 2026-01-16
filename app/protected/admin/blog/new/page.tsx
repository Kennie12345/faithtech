/**
 * Create New Blog Post Page (Admin)
 * Admin page for creating new blog posts
 */

import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getCurrentCityId, isAdmin } from '@/lib/core/api';
import { PostForm } from '@/components/blog/PostForm';
import { Button } from '@/components/ui/button';
import { ArrowLeftIcon } from 'lucide-react';

export default async function NewPostPage() {
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
          Unauthorized. Only city admins can create blog posts.
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full flex flex-col gap-space-9">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/protected/admin/blog">
            <ArrowLeftIcon className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="font-heading text-h2 font-600 leading-lh-1-1">Create Blog Post</h1>
          <p className="text-muted-foreground mt-2">
            Write a new post for your community (saves as draft)
          </p>
        </div>
      </div>

      {/* Form */}
      <PostForm mode="create" />
    </div>
  );
}
