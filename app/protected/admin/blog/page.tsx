/**
 * Admin Blog List Page
 * Shows all blog posts (drafts and published) for the current city
 */

import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getCurrentCityId, isAdmin } from '@/lib/core/api';
import { getPosts } from '@/features/blog/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PlusIcon, FileTextIcon, CheckCircle2Icon } from 'lucide-react';
import { PostCard } from '@/components/blog/PostCard';

export default async function AdminBlogPage() {
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
      <div className="flex-1 w-full flex flex-col gap-12">
        <div className="bg-destructive/10 text-destructive p-3 px-5 rounded-md">
          No city context. Please select a city first.
        </div>
      </div>
    );
  }

  const userIsAdmin = await isAdmin(cityId);
  if (!userIsAdmin) {
    return (
      <div className="flex-1 w-full flex flex-col gap-12">
        <div className="bg-destructive/10 text-destructive p-3 px-5 rounded-md">
          Unauthorized. Only city admins can manage blog posts.
        </div>
      </div>
    );
  }

  // Fetch all posts (including drafts)
  const allPosts = await getPosts(cityId, false);

  // Separate drafts and published posts
  const draftPosts = allPosts.filter((p) => p.published_at === null);
  const publishedPosts = allPosts.filter((p) => p.published_at !== null);

  return (
    <div className="flex-1 w-full flex flex-col gap-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Blog Posts</h1>
          <p className="text-muted-foreground mt-2">
            Manage blog posts for your community
          </p>
        </div>
        <Button asChild>
          <Link href="/protected/admin/blog/new">
            <PlusIcon className="mr-2 h-4 w-4" />
            New Post
          </Link>
        </Button>
      </div>

      {/* Drafts Section */}
      <div>
        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
          <FileTextIcon className="h-5 w-5 text-muted-foreground" />
          Drafts ({draftPosts.length})
        </h2>
        {draftPosts.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground text-center">
                No drafts. All posts are published.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {draftPosts.map((post) => (
              <PostCard key={post.id} post={post} isAdminView />
            ))}
          </div>
        )}
      </div>

      {/* Published Section */}
      <div>
        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
          <CheckCircle2Icon className="h-5 w-5 text-green-600" />
          Published ({publishedPosts.length})
        </h2>
        {publishedPosts.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground text-center">
                No published posts yet. Create and publish your first post to get started!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {publishedPosts.map((post) => (
              <PostCard key={post.id} post={post} isAdminView />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
