/**
 * Toggle Featured Button Component
 * Client component for featuring/unfeaturing posts
 */

'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { toggleFeatured } from '@/features/blog/actions';
import { StarIcon } from 'lucide-react';

interface ToggleFeaturedButtonProps {
  postId: string;
  isFeatured: boolean;
}

export function ToggleFeaturedButton({ postId, isFeatured }: ToggleFeaturedButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [optimisticFeatured, setOptimisticFeatured] = useState(isFeatured);

  const handleToggle = async () => {
    // Optimistic update
    setOptimisticFeatured(!optimisticFeatured);

    const result = await toggleFeatured(postId);

    if (result.error) {
      // Revert on error
      setOptimisticFeatured(optimisticFeatured);
      alert(`Error: ${result.error}`);
    } else {
      // Refresh to show updated state
      startTransition(() => {
        router.refresh();
      });
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleToggle}
      disabled={isPending}
      className="shrink-0"
      title={optimisticFeatured ? 'Unfeature post' : 'Feature post'}
    >
      <StarIcon
        className={`h-4 w-4 ${
          optimisticFeatured ? 'fill-primary text-primary' : ''
        }`}
      />
    </Button>
  );
}
