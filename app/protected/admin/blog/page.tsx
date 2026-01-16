/**
 * Admin Blog List Page
 * Shows all blog posts (drafts and published) for the current city
 */

import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getCurrentCityId, isAdmin } from '@/lib/core/api';
import { getPosts } from '@/features/blog/actions';
import { YellowButton, BeigeContentCard, Grid } from '@/components/design-system';
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
      <div className="flex-1 w-full flex flex-col gap-space-9">
        <BeigeContentCard className="bg-destructive/10 border-destructive/20">
          <p className="font-body text-p-14 text-destructive">
            No city context. Please select a city first.
          </p>
        </BeigeContentCard>
      </div>
    );
  }

  const userIsAdmin = await isAdmin(cityId);
  if (!userIsAdmin) {
    return (
      <div className="flex-1 w-full flex flex-col gap-space-9">
        <BeigeContentCard className="bg-destructive/10 border-destructive/20">
          <p className="font-body text-p-14 text-destructive">
            Unauthorized. Only city admins can manage blog posts.
          </p>
        </BeigeContentCard>
      </div>
    );
  }

  // Fetch all posts (including drafts)
  const allPosts = await getPosts(cityId, false);

  // Separate drafts and published posts
  const draftPosts = allPosts.filter((p) => p.published_at === null);
  const publishedPosts = allPosts.filter((p) => p.published_at !== null);

  return (
    <div className="flex-1 w-full flex flex-col gap-space-9">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-h2 font-600 leading-lh-1-1">Blog Posts</h1>
          <p className="font-body text-p-16 text-brand-grey-500 mt-space-2">
            Manage blog posts for your community
          </p>
        </div>
        <YellowButton asChild>
          <Link href="/protected/admin/blog/new">
            <PlusIcon className="mr-space-2 h-4 w-4" />
            New Post
          </Link>
        </YellowButton>
      </div>

      {/* Drafts Section */}
      <div>
        <h2 className="font-heading text-h4 font-600 mb-space-4 flex items-center gap-space-2">
          <FileTextIcon className="h-5 w-5 text-brand-grey-500" />
          Drafts ({draftPosts.length})
        </h2>
        {draftPosts.length === 0 ? (
          <BeigeContentCard>
            <p className="font-body text-p-14 text-brand-grey-500 text-center py-space-4">
              No drafts. All posts are published.
            </p>
          </BeigeContentCard>
        ) : (
          <Grid cols={1} mdCols={2} lgCols={3} gap="sm">
            {draftPosts.map((post) => (
              <PostCard key={post.id} post={post} isAdminView />
            ))}
          </Grid>
        )}
      </div>

      {/* Published Section */}
      <div>
        <h2 className="font-heading text-h4 font-600 mb-space-4 flex items-center gap-space-2">
          <CheckCircle2Icon className="h-5 w-5 text-green-600" />
          Published ({publishedPosts.length})
        </h2>
        {publishedPosts.length === 0 ? (
          <BeigeContentCard>
            <p className="font-body text-p-14 text-brand-grey-500 text-center py-space-4">
              No published posts yet. Create and publish your first post to get started!
            </p>
          </BeigeContentCard>
        ) : (
          <Grid cols={1} mdCols={2} lgCols={3} gap="sm">
            {publishedPosts.map((post) => (
              <PostCard key={post.id} post={post} isAdminView />
            ))}
          </Grid>
        )}
      </div>
    </div>
  );
}
