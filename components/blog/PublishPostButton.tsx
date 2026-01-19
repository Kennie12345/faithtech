/**
 * Publish Post Button Component
 * Client component for publishing/unpublishing posts
 */

'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { publishPost, unpublishPost } from '@/features/blog/actions';
import { CheckCircle2Icon, EyeOffIcon } from 'lucide-react';

interface PublishPostButtonProps {
  postId: string;
  isPublished: boolean;
}

export function PublishPostButton({ postId, isPublished }: PublishPostButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleToggle = async () => {
    const result = isPublished
      ? await unpublishPost(postId)
      : await publishPost(postId);

    if (result.error) {
      alert(`Error: ${result.error}`);
    } else {
      // Refresh to show updated state
      startTransition(() => {
        router.refresh();
      });
    }
  };

  if (isPublished) {
    return (
      <Button
        variant="outline"
        onClick={handleToggle}
        disabled={isPending}
        className="gap-2"
      >
        <EyeOffIcon className="h-4 w-4" />
        {isPending ? 'Unpublishing...' : 'Unpublish'}
      </Button>
    );
  }

  return (
    <Button
      onClick={handleToggle}
      disabled={isPending}
      className="gap-2"
    >
      <CheckCircle2Icon className="h-4 w-4" />
      {isPending ? 'Publishing...' : 'Publish'}
    </Button>
  );
}
