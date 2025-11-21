/**
 * Delete Post Button Component
 * Client component for deleting posts with confirmation
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { deletePost } from '@/features/blog/actions';
import { TrashIcon } from 'lucide-react';

interface DeletePostButtonProps {
  postId: string;
}

export function DeletePostButton({ postId }: DeletePostButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);

    const result = await deletePost(postId);

    if (result.error) {
      alert(`Error: ${result.error}`);
      setIsDeleting(false);
    } else {
      // Redirect to blog list on success
      router.push('/protected/admin/blog');
      router.refresh();
    }
  };

  if (!showConfirm) {
    return (
      <Button
        variant="destructive"
        onClick={() => setShowConfirm(true)}
        disabled={isDeleting}
      >
        <TrashIcon className="mr-2 h-4 w-4" />
        Delete Post
      </Button>
    );
  }

  return (
    <div className="flex gap-2">
      <Button
        variant="destructive"
        onClick={handleDelete}
        disabled={isDeleting}
        size="sm"
      >
        {isDeleting ? 'Deleting...' : 'Confirm Delete'}
      </Button>
      <Button
        variant="outline"
        onClick={() => setShowConfirm(false)}
        disabled={isDeleting}
        size="sm"
      >
        Cancel
      </Button>
    </div>
  );
}
