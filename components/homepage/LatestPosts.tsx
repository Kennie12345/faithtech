/**
 * LatestPosts Component
 *
 * Displays 2-3 recent blog posts for a city
 * Shows title, excerpt, date, author, and featured image
 *
 * Following FaithTech Design System (docs/style_guide.md)
 *
 * Server Component
 */

import Link from 'next/link';
import Image from 'next/image';
import { getPosts } from '@/features/blog/actions';
import { BeigeContentCard, BeigeButton, Container, Section, Grid } from '@/components/design-system';
import { CalendarIcon } from 'lucide-react';

interface LatestPostsProps {
  citySlug: string;
  cityId: string;
  limit?: number;
}

export async function LatestPosts({
  citySlug,
  cityId,
  limit = 3,
}: LatestPostsProps) {
  // Get recent published posts
  const allPosts = await getPosts(cityId, true); // publishedOnly = true
  const posts = allPosts.slice(0, limit);

  // If no posts, show empty state
  if (posts.length === 0) {
    return (
      <Section spacing="lg">
        <Container size="large">
          <div className="mb-space-8 flex items-center justify-between">
            <h2 className="font-heading text-h3 font-500 leading-lh-1-1">
              Latest from the Blog
            </h2>
          </div>
          <div className="rounded-radius-0-5 border border-dashed border-brand-grey-400 bg-brand-grey-100 p-space-8 text-center">
            <svg
              className="mx-auto mb-space-4 h-12 w-12 text-brand-grey-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
            <p className="font-body text-p-18 text-brand-grey-500">
              No blog posts yet. Stay tuned!
            </p>
          </div>
        </Container>
      </Section>
    );
  }

  return (
    <Section spacing="lg">
      <Container size="large">
        {/* Section Header */}
        <div className="mb-space-8 flex items-center justify-between">
          <h2 className="font-heading text-h3 font-500 leading-lh-1-1">
            Latest from the Blog
          </h2>
          <BeigeButton size="sm" variant="faded" asChild>
            <Link href={`/${citySlug}/blog`}>
              View All
              <svg
                className="ml-1 h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </BeigeButton>
        </div>

        {/* Posts Grid */}
        <Grid cols={1} mdCols={2} lgCols={3} gap="md">
          {posts.map((post) => {
            const publishedDate = new Date(post.published_at!).toLocaleDateString('en-AU', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            });

            return (
              <Link
                key={post.id}
                href={`/${citySlug}/blog/${post.slug}`}
                className="group"
              >
                <BeigeContentCard className="h-full transition-all hover:shadow-lg overflow-hidden p-0">
                  {/* Featured Image */}
                  {post.featured_image_url && (
                    <div className="relative h-48 w-full overflow-hidden">
                      <Image
                        src={post.featured_image_url}
                        alt={post.title}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    </div>
                  )}

                  <div className="p-space-6 space-y-space-4">
                    <div>
                      <h3 className="font-heading text-h5 font-600 line-clamp-2 group-hover:text-brand-yellow-200 transition-colors">
                        {post.title}
                      </h3>
                      {post.excerpt && (
                        <p className="mt-space-2 font-body text-p-14 text-brand-grey-500 line-clamp-3 leading-lh-1-5">
                          {post.excerpt}
                        </p>
                      )}
                    </div>

                    {/* Date */}
                    <div className="flex items-center gap-space-2 font-body text-p-14 text-brand-grey-500">
                      <CalendarIcon className="h-4 w-4" />
                      <span>{publishedDate}</span>
                    </div>
                  </div>
                </BeigeContentCard>
              </Link>
            );
          })}
        </Grid>
      </Container>
    </Section>
  );
}
