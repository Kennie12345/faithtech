/**
 * Public Blog Post Detail Page
 * Shows full blog post content with SEO metadata
 */

import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getCityBySlug } from '@/lib/core/api';
import { getPostBySlug } from '@/features/blog/actions';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MarkdownRenderer } from '@/components/blog/MarkdownRenderer';
import { ArrowLeftIcon, CalendarIcon, UserIcon, StarIcon } from 'lucide-react';

interface PageProps {
  params: Promise<{ citySlug: string; slug: string }>;
}

// Generate SEO metadata
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { citySlug, slug } = await params;

  const city = await getCityBySlug(citySlug);
  const post = city ? await getPostBySlug(city.id, slug) : null;

  if (!post || !city) {
    return {
      title: 'Post Not Found',
    };
  }

  const description = post.excerpt || post.content?.substring(0, 160) || 'Read this post from FaithTech';

  return {
    title: `${post.title} - ${city.name} | FaithTech`,
    description,
    openGraph: {
      title: post.title,
      description,
      images: post.featured_image_url ? [post.featured_image_url] : undefined,
      type: 'article',
      publishedTime: post.published_at || undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description,
      images: post.featured_image_url ? [post.featured_image_url] : undefined,
    },
  };
}

export default async function BlogPostDetailPage({ params }: PageProps) {
  const { citySlug, slug } = await params;

  // Fetch city
  const city = await getCityBySlug(citySlug);
  if (!city) {
    notFound();
  }

  // Fetch post with author
  const post = await getPostBySlug(city.id, slug);
  if (!post || !post.published_at) {
    // Only show published posts to public
    notFound();
  }

  const publishDate = new Date(post.published_at);

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Back Button */}
        <div className="mb-8">
          <Button variant="ghost" asChild>
            <Link href={`/${citySlug}/blog`}>
              <ArrowLeftIcon className="mr-2 h-4 w-4" />
              Back to Blog
            </Link>
          </Button>
        </div>

        {/* Post Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <h1 className="text-4xl font-bold flex-1 leading-tight">{post.title}</h1>
            {post.is_featured && (
              <Badge className="shrink-0">
                <StarIcon className="h-3 w-3 fill-current mr-1" />
                Featured
              </Badge>
            )}
          </div>

          {/* Post Meta */}
          <div className="flex items-center gap-4 text-muted-foreground text-sm">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              <span>{publishDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
            {post.author && post.author.display_name && (
              <div className="flex items-center gap-2">
                <UserIcon className="h-4 w-4" />
                <span>{post.author.display_name}</span>
              </div>
            )}
          </div>
        </div>

        {/* Featured Image */}
        {post.featured_image_url && (
          <div className="mb-8 rounded-lg overflow-hidden">
            <img
              src={post.featured_image_url}
              alt={post.title}
              className="w-full h-auto object-cover max-h-[500px]"
            />
          </div>
        )}

        {/* Post Content */}
        <Card>
          <CardContent className="pt-8 pb-8">
            {post.content ? (
              <MarkdownRenderer content={post.content} />
            ) : (
              <p className="text-muted-foreground italic">No content available</p>
            )}
          </CardContent>
        </Card>

        {/* Back Button (Footer) */}
        <div className="mt-8">
          <Button variant="outline" asChild>
            <Link href={`/${citySlug}/blog`}>
              <ArrowLeftIcon className="mr-2 h-4 w-4" />
              Back to All Posts
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
