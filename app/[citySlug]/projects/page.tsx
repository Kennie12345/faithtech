/**
 * Public Projects Gallery Page
 * Shows all projects for a city
 */

import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getCityBySlug } from '@/lib/core/api';
import { getProjects } from '@/features/projects/actions';
import { BeigeContentCard, YellowTag, BeigeButton, Container, Section, Grid } from '@/components/design-system';
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
      <Section spacing="lg">
        <Container size="xlarge">
          {/* Header */}
          <div className="mb-space-9">
            <h1 className="font-heading text-h1 font-600 mb-space-4 leading-lh-1-1">
              Projects from {city.name}
            </h1>
            <p className="font-body text-p-18 text-brand-grey-500">
              Community-built tech-for-good projects and CREATE hackathon initiatives
            </p>
          </div>

          {/* Featured Projects Section */}
          {featuredProjects.length > 0 && (
            <div className="mb-space-9">
              <h2 className="font-heading text-h3 font-600 mb-space-6 flex items-center gap-space-2">
                <StarIcon className="h-6 w-6 fill-brand-yellow-200 text-brand-yellow-200" />
                Featured Projects
              </h2>
              <Grid cols={1} mdCols={2} lgCols={3} gap="md">
                {featuredProjects.map((project) => (
                  <ProjectCard key={project.id} project={project} citySlug={citySlug} isFeatured />
                ))}
              </Grid>
            </div>
          )}

          {/* All Projects Section */}
          <div>
            <h2 className="font-heading text-h3 font-600 mb-space-6">All Projects</h2>
            {allProjects.length === 0 ? (
              <BeigeContentCard>
                <div className="text-center py-space-9">
                  <CodeIcon className="h-12 w-12 mx-auto mb-space-4 text-brand-grey-500" />
                  <h3 className="font-heading text-h4 font-600 mb-space-2">No Projects Yet</h3>
                  <p className="font-body text-p-16 text-brand-grey-500">
                    Check back soon for projects from {city.name}
                  </p>
                </div>
              </BeigeContentCard>
            ) : (
              <Grid cols={1} mdCols={2} lgCols={3} gap="md">
                {regularProjects.map((project) => (
                  <ProjectCard key={project.id} project={project} citySlug={citySlug} />
                ))}
              </Grid>
            )}
          </div>
        </Container>
      </Section>
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
      <BeigeContentCard className={`h-full transition-all hover:shadow-lg cursor-pointer overflow-hidden p-0 ${
        isFeatured ? 'ring-2 ring-brand-yellow-200' : ''
      }`}>
        {project.image_url && (
          <div className="relative aspect-video w-full overflow-hidden bg-brand-grey-300">
            <Image
              src={project.image_url}
              alt={project.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          </div>
        )}
        <div className="p-space-6 space-y-space-4">
          <div>
            <div className="flex items-start justify-between gap-space-2 mb-space-2">
              <h3 className="font-heading text-h5 font-600 line-clamp-1">{project.title}</h3>
              {isFeatured && (
                <YellowTag size="sm" className="shrink-0">
                  <StarIcon className="h-3 w-3 fill-current mr-space-1" />
                  Featured
                </YellowTag>
              )}
            </div>
            <p className="font-body text-p-14 text-brand-grey-500 line-clamp-2 leading-lh-1-5">
              {project.description || project.problem_statement || 'No description'}
            </p>
          </div>

          {project.problem_statement && (
            <div className="font-body text-p-14">
              <span className="font-500">Problem: </span>
              <span className="text-brand-grey-500 line-clamp-2">
                {project.problem_statement}
              </span>
            </div>
          )}

          <div className="flex items-center gap-space-2 pt-space-2">
            {project.github_url && (
              <BeigeButton
                variant="faded"
                size="sm"
                asChild
                onClick={(e: React.MouseEvent) => e.stopPropagation()}
              >
                <a
                  href={project.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-space-1"
                >
                  <GithubIcon className="h-3 w-3" />
                  Code
                </a>
              </BeigeButton>
            )}
            {project.demo_url && (
              <BeigeButton
                variant="faded"
                size="sm"
                asChild
                onClick={(e: React.MouseEvent) => e.stopPropagation()}
              >
                <a
                  href={project.demo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-space-1"
                >
                  <ExternalLinkIcon className="h-3 w-3" />
                  Demo
                </a>
              </BeigeButton>
            )}
          </div>
        </div>
      </BeigeContentCard>
    </Link>
  );
}
