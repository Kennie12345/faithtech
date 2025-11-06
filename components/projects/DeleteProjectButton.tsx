/**
 * Delete Project Button Component
 * Client component for deleting projects with confirmation
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { deleteProject } from '@/features/projects/actions';
import { TrashIcon } from 'lucide-react';

interface DeleteProjectButtonProps {
  projectId: string;
}

export function DeleteProjectButton({ projectId }: DeleteProjectButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);

    const result = await deleteProject(projectId);

    if (result.error) {
      alert(`Error: ${result.error}`);
      setIsDeleting(false);
    } else {
      // Redirect to projects list on success
      router.push('/protected/admin/projects');
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
        Delete Project
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
