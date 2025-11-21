/**
 * Post Card Component
 * Display card for blog posts in list views
 *
 * Following FaithTech Design System (docs/style_guide.md)
 */

import Link from 'next/link';
import { BeigeContentCard, YellowTag, BlueLabel, BeigeButton } from '@/components/design-system';
import { CalendarIcon, Edit2Icon, StarIcon } from 'lucide-react';
import type { Post } from '@/features/blog/types';

interface PostCardProps {
  post: Post;
  isAdminView?: boolean;
}

export function PostCard({ post, isAdminView = false }: PostCardProps) {
  const isPublished = post.published_at !== null;
  const publishDate = post.published_at ? new Date(post.published_at) : null;

  return (
    <BeigeContentCard className="flex flex-col h-full">
      <div className="space-y-space-4">
        <div className="flex items-start justify-between gap-space-2">
          <h3 className="font-heading text-h5 font-600 line-clamp-2">
            {isAdminView ? (
              <Link
                href={`/protected/admin/blog/${post.id}`}
                className="hover:text-brand-yellow-200 transition-colors"
              >
                {post.title}
              </Link>
            ) : (
              post.title
            )}
          </h3>
          <div className="flex gap-space-2 shrink-0">
            {post.is_featured && (
              <YellowTag size="sm">
                <StarIcon className="h-3 w-3 mr-space-1" />
                Featured
              </YellowTag>
            )}
            <BlueLabel size="sm" variant={isPublished ? 'primary' : 'faded'}>
              {isPublished ? 'Published' : 'Draft'}
            </BlueLabel>
          </div>
        </div>
        {post.excerpt && (
          <p className="font-body text-p-14 text-brand-grey-500 line-clamp-3 leading-lh-1-5">
            {post.excerpt}
          </p>
        )}
      </div>

      <div className="flex-1">
        <div className="flex items-center gap-space-2 font-body text-p-14 text-brand-grey-500">
          <CalendarIcon className="h-4 w-4" />
          {isPublished && publishDate ? (
            <span>Published {publishDate.toLocaleDateString()}</span>
          ) : (
            <span>Created {new Date(post.created_at).toLocaleDateString()}</span>
          )}
        </div>
      </div>

      {isAdminView && (
        <div className="pt-space-4">
          <BeigeButton asChild variant="faded" size="sm" className="w-full">
            <Link href={`/protected/admin/blog/${post.id}`}>
              <Edit2Icon className="h-4 w-4 mr-space-2" />
              Edit
            </Link>
          </BeigeButton>
        </div>
      )}
    </BeigeContentCard>
  );
}
