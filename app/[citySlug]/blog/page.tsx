/**
 * Public Blog List Page
 * Shows all published blog posts for a city
 */

import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getCityBySlug } from '@/lib/core/api';
import { getPosts, getFeaturedPosts } from '@/features/blog/actions';
import { BeigeContentCard, YellowTag, BeigeButton, Container, Section, Grid } from '@/components/design-system';
import { BookOpenIcon, StarIcon, CalendarIcon } from 'lucide-react';

interface PageProps {
  params: Promise<{ citySlug: string }>;
}

export default async function CityBlogPage({ params }: PageProps) {
  const { citySlug } = await params;

  // Fetch city
  const city = await getCityBySlug(citySlug);
  if (!city) {
    notFound();
  }

  // Fetch published posts only
  const allPosts = await getPosts(city.id, true);

  // Get featured posts
  const featuredPosts = allPosts.filter((p) => p.is_featured);
  const regularPosts = allPosts.filter((p) => !p.is_featured);

  return (
    <div className="min-h-screen">
      <Section spacing="lg">
        <Container size="large">
          {/* Header */}
          <div className="mb-space-9">
            <h1 className="font-heading text-h1 font-600 mb-space-4 leading-lh-1-1">
              Blog from {city.name}
            </h1>
            <p className="font-body text-p-18 text-brand-grey-500">
              Stories, updates, and insights from our community
            </p>
          </div>

          {/* Featured Posts Section */}
          {featuredPosts.length > 0 && (
            <div className="mb-space-9">
              <h2 className="font-heading text-h3 font-600 mb-space-6 flex items-center gap-space-2">
                <StarIcon className="h-6 w-6 fill-brand-yellow-200 text-brand-yellow-200" />
                Featured Posts
              </h2>
              <Grid cols={1} mdCols={2} lgCols={3} gap="md">
                {featuredPosts.map((post) => (
                  <BlogPostCard key={post.id} post={post} citySlug={citySlug} isFeatured />
                ))}
              </Grid>
            </div>
          )}

          {/* All Posts Section */}
          <div>
            <h2 className="font-heading text-h3 font-600 mb-space-6">All Posts</h2>
            {allPosts.length === 0 ? (
              <BeigeContentCard>
                <div className="text-center py-space-9">
                  <BookOpenIcon className="h-12 w-12 mx-auto mb-space-4 text-brand-grey-500" />
                  <h3 className="font-heading text-h4 font-600 mb-space-2">No Posts Yet</h3>
                  <p className="font-body text-p-16 text-brand-grey-500">
                    Check back soon for blog posts from {city.name}
                  </p>
                </div>
              </BeigeContentCard>
            ) : (
              <Grid cols={1} mdCols={2} lgCols={3} gap="md">
                {regularPosts.map((post) => (
                  <BlogPostCard key={post.id} post={post} citySlug={citySlug} />
                ))}
              </Grid>
            )}
          </div>
        </Container>
      </Section>
    </div>
  );
}

function BlogPostCard({
  post,
  citySlug,
  isFeatured = false,
}: {
  post: Awaited<ReturnType<typeof getPosts>>[number];
  citySlug: string;
  isFeatured?: boolean;
}) {
  const publishDate = post.published_at ? new Date(post.published_at) : null;

  return (
    <BeigeContentCard className={isFeatured ? 'ring-2 ring-brand-yellow-200' : ''}>
      <div className="space-y-space-4">
        <div>
          <div className="flex items-start justify-between gap-space-2 mb-space-2">
            <h3 className="font-heading text-h5 font-600 line-clamp-2">
              <Link
                href={`/${citySlug}/blog/${post.slug}`}
                className="hover:text-brand-yellow-200 transition-colors"
              >
                {post.title}
              </Link>
            </h3>
            {isFeatured && (
              <YellowTag size="sm" className="shrink-0">
                <StarIcon className="h-3 w-3 mr-space-1" />
                Featured
              </YellowTag>
            )}
          </div>
          <p className="font-body text-p-14 text-brand-grey-500 line-clamp-3 leading-lh-1-5">
            {post.excerpt || 'Read more...'}
          </p>
        </div>

        <div className="flex items-center gap-space-2 font-body text-p-14 text-brand-grey-500">
          <CalendarIcon className="h-4 w-4" />
          {publishDate && <span>{publishDate.toLocaleDateString()}</span>}
        </div>

        <BeigeButton asChild variant="faded" className="w-full" size="sm">
          <Link href={`/${citySlug}/blog/${post.slug}`}>Read Post</Link>
        </BeigeButton>
      </div>
    </BeigeContentCard>
  );
}
