/**
 * FeaturedProjects Component
 *
 * Displays 2-3 featured projects for a city
 * Fallback to recent projects if no featured
 *
 * Following FaithTech Design System (docs/style_guide.md)
 *
 * Server Component
 */

import Link from 'next/link';
import Image from 'next/image';
import { getProjects } from '@/features/projects/actions';
import { BeigeContentCard, BeigeButton, Container, Section, Grid } from '@/components/design-system';

interface FeaturedProjectsProps {
  citySlug: string;
  cityId: string;
  limit?: number;
}

export async function FeaturedProjects({
  citySlug,
  cityId,
  limit = 3,
}: FeaturedProjectsProps) {
  // Get featured projects (getProjects already supports featured filtering)
  const projects = await getProjects(cityId, true);

  // If no featured projects, get recent ones
  const displayProjects = projects.length > 0
    ? projects.slice(0, limit)
    : (await getProjects(cityId, false)).slice(0, limit);

  // If still no projects, show empty state
  if (displayProjects.length === 0) {
    return (
      <Section spacing="lg">
        <Container size="large">
          <div className="mb-space-8 flex items-center justify-between">
            <h2 className="font-heading text-h3 font-500 leading-lh-1-1">
              Featured Projects
            </h2>
          </div>
          <div className="rounded-radius-0-5 border border-dashed border-brand-grey-400 bg-brand-grey-100 p-space-8 text-center">
            <svg
              className="mx-auto mb-space-4 h-12 w-12 text-brand-grey-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
            <p className="font-body text-p-18 text-brand-grey-500">
              No projects yet. Start building!
            </p>
          </div>
        </Container>
      </Section>
    );
  }

  return (
    <Section spacing="lg">
      <Container size="large">
        {/* Section Header */}
        <div className="mb-space-8 flex items-center justify-between">
          <h2 className="font-heading text-h3 font-500 leading-lh-1-1">
            Featured Projects
          </h2>
          <BeigeButton size="sm" variant="faded" asChild>
            <Link href={`/${citySlug}/projects`}>
              View All
              <svg
                className="ml-1 h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </BeigeButton>
        </div>

        {/* Projects Grid */}
        <Grid cols={1} mdCols={2} lgCols={3} gap="md">
          {displayProjects.map((project) => (
            <Link
              key={project.id}
              href={`/${citySlug}/projects/${project.slug}`}
              className="group"
            >
              <BeigeContentCard className="h-full transition-all hover:shadow-lg overflow-hidden p-0">
                {/* Project Image */}
                {project.image_url && (
                  <div className="relative h-48 w-full overflow-hidden">
                    <Image
                      src={project.image_url}
                      alt={project.title}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  </div>
                )}

                <div className="p-space-6 space-y-space-4">
                  <div>
                    <h3 className="font-heading text-h5 font-600 line-clamp-2 group-hover:text-brand-yellow-200 transition-colors">
                      {project.title}
                    </h3>
                    {project.description && (
                      <p className="mt-space-2 font-body text-p-14 text-brand-grey-500 line-clamp-3 leading-lh-1-5">
                        {project.description}
                      </p>
                    )}
                  </div>

                  {/* Links */}
                  <div className="flex gap-space-4 font-body text-p-14">
                    {project.github_url && (
                      <span className="flex items-center gap-space-1 text-brand-grey-500">
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                        </svg>
                        Code
                      </span>
                    )}
                    {project.demo_url && (
                      <span className="flex items-center gap-space-1 text-brand-grey-500">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        Demo
                      </span>
                    )}
                  </div>
                </div>
              </BeigeContentCard>
            </Link>
          ))}
        </Grid>
      </Container>
    </Section>
  );
}
