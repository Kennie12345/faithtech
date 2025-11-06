/**
 * Public Projects Gallery Page
 * Shows all projects for a city
 */

import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getCityBySlug } from '@/lib/core/api';
import { getProjects } from '@/features/projects/actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CodeIcon, StarIcon, GithubIcon, ExternalLinkIcon } from 'lucide-react';

interface PageProps {
  params: Promise<{ citySlug: string }>;
}

export default async function CityProjectsPage({ params }: PageProps) {
  const { citySlug } = await params;

  // Fetch city
  const city = await getCityBySlug(citySlug);
  if (!city) {
    notFound();
  }

  // Fetch all projects
  const allProjects = await getProjects(city.id);

  // Separate featured and regular projects
  const featuredProjects = allProjects.filter((p) => p.is_featured);
  const regularProjects = allProjects.filter((p) => !p.is_featured);

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4">
            Projects from {city.name}
          </h1>
          <p className="text-lg text-muted-foreground">
            Community-built tech-for-good projects and CREATE hackathon initiatives
          </p>
        </div>

        {/* Featured Projects Section */}
        {featuredProjects.length > 0 && (
          <div className="mb-16">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <StarIcon className="h-6 w-6 fill-primary text-primary" />
              Featured Projects
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {featuredProjects.map((project) => (
                <ProjectCard key={project.id} project={project} citySlug={citySlug} isFeatured />
              ))}
            </div>
          </div>
        )}

        {/* All Projects Section */}
        <div>
          <h2 className="text-2xl font-bold mb-6">All Projects</h2>
          {allProjects.length === 0 ? (
            <Card>
              <CardContent className="pt-12 pb-12">
                <div className="text-center">
                  <CodeIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-semibold mb-2">No Projects Yet</h3>
                  <p className="text-muted-foreground">
                    Check back soon for projects from {city.name}
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {regularProjects.map((project) => (
                <ProjectCard key={project.id} project={project} citySlug={citySlug} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ProjectCard({
  project,
  citySlug,
  isFeatured = false,
}: {
  project: Awaited<ReturnType<typeof getProjects>>[number];
  citySlug: string;
  isFeatured?: boolean;
}) {
  return (
    <Link href={`/${citySlug}/projects/${project.slug}`}>
      <Card className={`h-full transition-all hover:shadow-lg cursor-pointer ${
        isFeatured ? 'border-primary' : ''
      }`}>
        {project.image_url && (
          <div className="aspect-video w-full overflow-hidden rounded-t-lg bg-muted">
            <img
              src={project.image_url}
              alt={project.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-xl line-clamp-1">{project.title}</CardTitle>
            {isFeatured && (
              <Badge className="shrink-0">
                <StarIcon className="h-3 w-3 fill-current mr-1" />
                Featured
              </Badge>
            )}
          </div>
          <CardDescription className="line-clamp-2">
            {project.description || project.problem_statement || 'No description'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {project.problem_statement && (
            <div className="text-sm">
              <span className="font-medium">Problem: </span>
              <span className="text-muted-foreground line-clamp-2">
                {project.problem_statement}
              </span>
            </div>
          )}

          <div className="flex items-center gap-2 pt-2">
            {project.github_url && (
              <Button
                variant="outline"
                size="sm"
                asChild
                onClick={(e) => e.stopPropagation()}
              >
                <a
                  href={project.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1"
                >
                  <GithubIcon className="h-3 w-3" />
                  Code
                </a>
              </Button>
            )}
            {project.demo_url && (
              <Button
                variant="outline"
                size="sm"
                asChild
                onClick={(e) => e.stopPropagation()}
              >
                <a
                  href={project.demo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1"
                >
                  <ExternalLinkIcon className="h-3 w-3" />
                  Demo
                </a>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
