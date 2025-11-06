/**
 * Toggle Featured Button Component
 * Client component for featuring/unfeaturing projects
 */

'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { toggleFeatured } from '@/features/projects/actions';
import { StarIcon } from 'lucide-react';

interface ToggleFeaturedButtonProps {
  projectId: string;
  isFeatured: boolean;
}

export function ToggleFeaturedButton({
  projectId,
  isFeatured,
}: ToggleFeaturedButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [optimisticFeatured, setOptimisticFeatured] = useState(isFeatured);

  const handleToggle = async () => {
    // Optimistic update
    setOptimisticFeatured(!optimisticFeatured);

    const result = await toggleFeatured(projectId);

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
      title={optimisticFeatured ? 'Unfeature project' : 'Feature project'}
    >
      <StarIcon
        className={`h-4 w-4 ${
          optimisticFeatured ? 'fill-primary text-primary' : ''
        }`}
      />
    </Button>
  );
}
