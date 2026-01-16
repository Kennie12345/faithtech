/**
 * Edit Blog Post Page
 * Admin page for editing blog posts and managing publish status
 */

import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getCurrentCityId, isAdmin, getUser } from '@/lib/core/api';
import { getPost } from '@/features/blog/actions';
import { PostForm } from '@/components/blog/PostForm';
import { PublishPostButton } from '@/components/blog/PublishPostButton';
import { ToggleFeaturedButton } from '@/components/blog/ToggleFeaturedButton';
import { DeletePostButton } from '@/components/blog/DeletePostButton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeftIcon } from 'lucide-react';
import { MarkdownRenderer } from '@/components/blog/MarkdownRenderer';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPostPage({ params }: PageProps) {
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

  // Fetch post
  const post = await getPost(id);
  if (!post) {
    notFound();
  }

  // Verify post belongs to current city
  if (post.city_id !== cityId) {
    return (
      <div className="flex-1 w-full flex flex-col gap-space-9">
        <div className="bg-destructive/10 text-destructive p-3 px-5 rounded-md">
          Post not found in your city.
        </div>
      </div>
    );
  }

  // Check if user can edit (creator OR admin)
  const userIsAdmin = await isAdmin(cityId);
  const isCreator = post.created_by === user.id;
  const canEdit = isCreator || userIsAdmin;

  if (!canEdit) {
    return (
      <div className="flex-1 w-full flex flex-col gap-space-9">
        <div className="bg-destructive/10 text-destructive p-3 px-5 rounded-md">
          Unauthorized. Only post creator or city admins can edit posts.
        </div>
      </div>
    );
  }

  const isPublished = post.published_at !== null;

  return (
    <div className="flex-1 w-full flex flex-col gap-space-9">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/protected/admin/blog">
            <ArrowLeftIcon className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h1 className="font-heading text-h2 font-600 leading-lh-1-1">Edit Post</h1>
            {post.is_featured && (
              <Badge variant="default">Featured</Badge>
            )}
            <Badge variant={isPublished ? 'default' : 'secondary'}>
              {isPublished ? 'Published' : 'Draft'}
            </Badge>
          </div>
          <p className="text-muted-foreground">{post.title}</p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <PublishPostButton postId={post.id} isPublished={isPublished} />
          {userIsAdmin && (
            <>
              <ToggleFeaturedButton postId={post.id} isFeatured={post.is_featured} />
              <DeletePostButton postId={post.id} />
            </>
          )}
        </div>
      </div>

      {/* Post Form */}
      <PostForm mode="edit" post={post} />

      {/* Preview Section (if post has content) */}
      {post.content && (
        <div>
          <h2 className="text-2xl font-semibold mb-4">Content Preview</h2>
          <Card>
            <CardHeader>
              <CardTitle>Rendered Markdown</CardTitle>
              <CardDescription>
                Preview of how your post will appear to readers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MarkdownRenderer content={post.content} />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
