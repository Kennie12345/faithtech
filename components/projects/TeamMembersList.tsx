/**
 * Team Members List Component
 * Client component for displaying and managing project team members
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { removeTeamMember } from '@/features/projects/actions';
import type { ProjectMemberWithProfile } from '@/features/projects/types';
import { XIcon } from 'lucide-react';

interface TeamMembersListProps {
  projectId: string;
  members: ProjectMemberWithProfile[];
  canEdit: boolean;
}

export function TeamMembersList({
  projectId,
  members,
  canEdit,
}: TeamMembersListProps) {
  const router = useRouter();
  const [removingId, setRemovingId] = useState<string | null>(null);

  const handleRemove = async (userId: string) => {
    if (!confirm('Remove this team member?')) return;

    setRemovingId(userId);

    const result = await removeTeamMember(projectId, userId);

    if (result.error) {
      alert(`Error: ${result.error}`);
      setRemovingId(null);
    } else {
      router.refresh();
    }
  };

  if (members.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No team members yet. Add team members to showcase who worked on this project.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {members.map((member) => (
        <div
          key={member.id}
          className="flex items-center gap-3 p-3 rounded-lg border bg-card"
        >
          <Avatar className="h-10 w-10">
            <AvatarImage src={member.profile.avatar_url || undefined} />
            <AvatarFallback>
              {member.profile.display_name?.charAt(0) || '?'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">
              {member.profile.display_name || 'Unknown User'}
            </div>
            {member.profile.email && (
              <div className="text-xs text-muted-foreground truncate">
                {member.profile.email}
              </div>
            )}
          </div>
          <Badge variant={member.role === 'lead' ? 'default' : 'secondary'} className="capitalize">
            {member.role}
          </Badge>
          {canEdit && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={() => handleRemove(member.user_id)}
              disabled={removingId === member.user_id}
            >
              <XIcon className="h-4 w-4" />
            </Button>
          )}
        </div>
      ))}
    </div>
  );
}
