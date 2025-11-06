/**
 * Public Project Detail Page
 * Shows project details with team members
 */

import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getCityBySlug } from '@/lib/core/api';
import { getProjectBySlug } from '@/features/projects/actions';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  ArrowLeftIcon,
  GithubIcon,
  ExternalLinkIcon,
  UsersIcon,
  StarIcon,
} from 'lucide-react';

interface PageProps {
  params: Promise<{ citySlug: string; slug: string }>;
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const { citySlug, slug } = await params;

  // Fetch city
  const city = await getCityBySlug(citySlug);
  if (!city) {
    notFound();
  }

  // Fetch project with team members
  const project = await getProjectBySlug(city.id, slug);
  if (!project) {
    notFound();
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        {/* Back Button */}
        <div className="mb-8">
          <Button variant="ghost" asChild>
            <Link href={`/${citySlug}/projects`}>
              <ArrowLeftIcon className="mr-2 h-4 w-4" />
              Back to Projects
            </Link>
          </Button>
        </div>

        {/* Project Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <h1 className="text-4xl font-bold flex-1">{project.title}</h1>
            {project.is_featured && (
              <Badge className="shrink-0">
                <StarIcon className="h-3 w-3 fill-current mr-1" />
                Featured
              </Badge>
            )}
          </div>

          {/* Project Links */}
          <div className="flex items-center gap-3 mt-4">
            {project.github_url && (
              <Button variant="outline" asChild>
                <a
                  href={project.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <GithubIcon className="mr-2 h-4 w-4" />
                  View Code
                </a>
              </Button>
            )}
            {project.demo_url && (
              <Button asChild>
                <a
                  href={project.demo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLinkIcon className="mr-2 h-4 w-4" />
                  View Demo
                </a>
              </Button>
            )}
          </div>
        </div>

        {/* Project Image */}
        {project.image_url && (
          <div className="mb-8">
            <div className="aspect-video w-full overflow-hidden rounded-lg bg-muted">
              <img
                src={project.image_url}
                alt={project.title}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Column - Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            {project.description && (
              <Card>
                <CardContent className="pt-6">
                  <h2 className="text-xl font-semibold mb-4">About This Project</h2>
                  <div className="prose prose-sm max-w-none">
                    <p className="whitespace-pre-wrap text-muted-foreground">
                      {project.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Problem Statement */}
            {project.problem_statement && (
              <Card>
                <CardContent className="pt-6">
                  <h2 className="text-xl font-semibold mb-4">Problem Statement</h2>
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {project.problem_statement}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Solution */}
            {project.solution && (
              <Card>
                <CardContent className="pt-6">
                  <h2 className="text-xl font-semibold mb-4">Solution</h2>
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {project.solution}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Team Members Card */}
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <UsersIcon className="h-4 w-4" />
                  Team Members
                </h3>
                {project.members.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No team members listed
                  </p>
                ) : (
                  <ul className="space-y-3">
                    {project.members.map((member) => (
                      <li key={member.id} className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={member.profile.avatar_url || undefined} />
                          <AvatarFallback>
                            {member.profile.display_name?.charAt(0) || '?'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">
                            {member.profile.display_name || 'Unknown User'}
                          </div>
                          <div className="text-xs text-muted-foreground capitalize">
                            {member.role}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>

            {/* Project Info */}
            <Card>
              <CardContent className="pt-6 space-y-3">
                <div className="text-sm">
                  <div className="text-muted-foreground mb-1">City</div>
                  <div className="font-medium">{city.name}</div>
                </div>
                {project.created_at && (
                  <div className="text-sm">
                    <div className="text-muted-foreground mb-1">Submitted</div>
                    <div className="font-medium">
                      {new Date(project.created_at).toLocaleDateString('en-AU', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
