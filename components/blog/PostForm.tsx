/**
 * Post Form Component
 * Reusable form for creating and editing blog posts
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { createPost, updatePost } from '@/features/blog/actions';
import type { Post } from '@/features/blog/types';

interface PostFormProps {
  post?: Post;
  mode: 'create' | 'edit';
}

export function PostForm({ post, mode }: PostFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);

    try {
      let result;
      if (mode === 'create') {
        result = await createPost(formData);
      } else if (post) {
        result = await updatePost(post.id, formData);
      }

      if (result?.error) {
        setError(result.error);
      } else {
        // Redirect on success
        if (mode === 'create' && result?.data?.id) {
          router.push(`/protected/admin/blog/${result.data.id}`);
        } else {
          router.push('/protected/admin/blog');
        }
        router.refresh();
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{mode === 'create' ? 'Create New Post' : 'Edit Post'}</CardTitle>
        <CardDescription>
          {mode === 'create'
            ? 'Write a new blog post for your community'
            : 'Update the post details below'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm">
              {error}
            </div>
          )}

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">
              Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              name="title"
              required
              defaultValue={post?.title}
              placeholder="Introducing Our New Community Initiative"
              maxLength={200}
            />
            <p className="text-xs text-muted-foreground">
              A clear, compelling title for your post
            </p>
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              name="content"
              defaultValue={post?.content || ''}
              placeholder="Write your post content here... (Markdown supported)"
              rows={16}
              maxLength={100000}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Full post content in Markdown format (headings, lists, links, code blocks supported)
            </p>
          </div>

          {/* Excerpt */}
          <div className="space-y-2">
            <Label htmlFor="excerpt">Excerpt</Label>
            <Textarea
              id="excerpt"
              name="excerpt"
              defaultValue={post?.excerpt || ''}
              placeholder="A short summary of your post for list views and SEO..."
              rows={3}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground">
              Short preview/summary (max 500 characters) - used for list views and SEO meta descriptions
            </p>
          </div>

          {/* Featured Image URL */}
          <div className="space-y-2">
            <Label htmlFor="featured_image_url">Featured Image URL</Label>
            <Input
              id="featured_image_url"
              name="featured_image_url"
              type="url"
              defaultValue={post?.featured_image_url || ''}
              placeholder="https://example.com/cover-image.jpg"
            />
            <p className="text-xs text-muted-foreground">
              Cover image URL for social sharing (Open Graph, Twitter Cards)
            </p>
          </div>

          {/* Form Actions */}
          <div className="flex gap-3">
            <Button type="submit" disabled={isLoading}>
              {isLoading
                ? mode === 'create'
                  ? 'Saving Draft...'
                  : 'Saving...'
                : mode === 'create'
                  ? 'Save as Draft'
                  : 'Save Changes'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isLoading}
            >
              Cancel
            </Button>
          </div>

          {mode === 'edit' && post && !post.published_at && (
            <p className="text-xs text-muted-foreground mt-2">
              This post is currently a draft. Use the Publish button above the form to make it public.
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
