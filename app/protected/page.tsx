/**
 * Admin Dashboard
 * Main landing page for authenticated city administrators
 */

import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getCurrentCityId, getCurrentCity, getCityStats } from '@/lib/core/api';
import { BeigeContentCard, YellowButton, Grid } from '@/components/design-system';
import {
  CalendarDays,
  Rocket,
  BookOpen,
  Users,
  PlusCircle,
} from 'lucide-react';

export default async function AdminDashboard() {
  const supabase = await createClient();

  // Check authentication
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/auth/login');
  }

  // Get city context
  const cityId = await getCurrentCityId();
  const city = await getCurrentCity();

  if (!cityId) {
    return (
      <div className="flex-1 w-full flex flex-col gap-space-9">
        <BeigeContentCard className="bg-destructive/10 border-destructive/20">
          <h2 className="font-heading text-h5 font-600 mb-space-2 text-destructive">No City Context</h2>
          <p className="font-body text-p-14 text-destructive">
            Please select a city first. If you're a new administrator, contact support to set up your city.
          </p>
        </BeigeContentCard>
      </div>
    );
  }

  // Fetch stats for dashboard
  const stats = await getCityStats(cityId);

  return (
    <div className="flex-1 w-full flex flex-col gap-space-9">
      {/* Welcome Header */}
      <div>
        <h1 className="font-heading text-h2 font-600 mb-space-2 leading-lh-1-1">
          Welcome to {city?.name || 'FaithTech'} Admin
        </h1>
        <p className="font-body text-p-16 text-brand-grey-500">
          Manage your community's events, projects, and content
        </p>
      </div>

      {/* Quick Stats */}
      <div>
        <h2 className="font-heading text-h4 font-600 mb-space-4">Overview</h2>
        <Grid cols={1} mdCols={2} lgCols={4} gap="sm">
          <StatCard
            title="Events"
            value={stats.eventCount}
            description="Total events created"
            icon={<CalendarDays className="h-4 w-4 text-brand-grey-500" />}
            href="/protected/admin/events"
          />
          <StatCard
            title="Projects"
            value={stats.projectCount}
            description="Active projects"
            icon={<Rocket className="h-4 w-4 text-brand-grey-500" />}
            href="/protected/admin/projects"
          />
          <StatCard
            title="Blog Posts"
            value={stats.postCount}
            description="Published articles"
            icon={<BookOpen className="h-4 w-4 text-brand-grey-500" />}
            href="/protected/admin/blog"
          />
          <StatCard
            title="Members"
            value={stats.memberCount}
            description="Community members"
            icon={<Users className="h-4 w-4 text-brand-grey-500" />}
            href="#"
          />
        </Grid>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="font-heading text-h4 font-600 mb-space-4">Quick Actions</h2>
        <Grid cols={1} mdCols={3} gap="sm">
          <BeigeContentCard className="hover:bg-brand-grey-200 transition-colors">
            <div className="space-y-space-4">
              <div>
                <h3 className="font-heading text-h5 font-600 flex items-center gap-space-2 mb-space-2">
                  <CalendarDays className="h-5 w-5" />
                  Create Event
                </h3>
                <p className="font-body text-p-14 text-brand-grey-500">
                  Schedule a new community gathering or meetup
                </p>
              </div>
              <YellowButton asChild className="w-full" size="sm">
                <Link href="/protected/admin/events/new">
                  <PlusCircle className="mr-space-2 h-4 w-4" />
                  New Event
                </Link>
              </YellowButton>
            </div>
          </BeigeContentCard>

          <BeigeContentCard className="hover:bg-brand-grey-200 transition-colors">
            <div className="space-y-space-4">
              <div>
                <h3 className="font-heading text-h5 font-600 flex items-center gap-space-2 mb-space-2">
                  <Rocket className="h-5 w-5" />
                  Add Project
                </h3>
                <p className="font-body text-p-14 text-brand-grey-500">
                  Showcase a new CREATE project or initiative
                </p>
              </div>
              <YellowButton asChild className="w-full" size="sm">
                <Link href="/protected/admin/projects/new">
                  <PlusCircle className="mr-space-2 h-4 w-4" />
                  New Project
                </Link>
              </YellowButton>
            </div>
          </BeigeContentCard>

          <BeigeContentCard className="hover:bg-brand-grey-200 transition-colors">
            <div className="space-y-space-4">
              <div>
                <h3 className="font-heading text-h5 font-600 flex items-center gap-space-2 mb-space-2">
                  <BookOpen className="h-5 w-5" />
                  Write Post
                </h3>
                <p className="font-body text-p-14 text-brand-grey-500">
                  Share insights, updates, or resources with your community
                </p>
              </div>
              <YellowButton asChild className="w-full" size="sm">
                <Link href="/protected/admin/blog/new">
                  <PlusCircle className="mr-space-2 h-4 w-4" />
                  New Post
                </Link>
              </YellowButton>
            </div>
          </BeigeContentCard>
        </Grid>
      </div>

      {/* Getting Started */}
      {stats.eventCount === 0 && stats.projectCount === 0 && stats.postCount === 0 && (
        <BeigeContentCard className="border-brand-yellow-200 bg-brand-yellow-100/20">
          <div className="space-y-space-4">
            <div>
              <h3 className="font-heading text-h4 font-600 mb-space-2">🎉 Getting Started</h3>
              <p className="font-body text-p-14 text-brand-grey-500">
                Welcome to your FaithTech community dashboard! Here are some first steps:
              </p>
            </div>
            <div className="space-y-space-2 font-body text-p-14">
              <p>
                <strong className="font-500">1. Create your first event</strong> - Host a meetup, hackathon, or workshop
              </p>
              <p>
                <strong className="font-500">2. Add a project</strong> - Showcase what your community is building
              </p>
              <p>
                <strong className="font-500">3. Write a blog post</strong> - Share your story and attract new members
              </p>
            </div>
          </div>
        </BeigeContentCard>
      )}
    </div>
  );
}

function StatCard({
  title,
  value,
  description,
  icon,
  href,
}: {
  title: string;
  value: number;
  description: string;
  icon: React.ReactNode;
  href: string;
}) {
  const CardWrapper = ({ children }: { children: React.ReactNode }) => {
    if (href === '#') {
      return <BeigeContentCard>{children}</BeigeContentCard>;
    }
    return (
      <Link href={href} className="block">
        <BeigeContentCard className="hover:bg-brand-grey-200 transition-colors cursor-pointer">
          {children}
        </BeigeContentCard>
      </Link>
    );
  };

  return (
    <CardWrapper>
      <div className="flex flex-row items-center justify-between space-y-0 pb-space-2">
        <h4 className="font-heading text-p-14 font-500">{title}</h4>
        {icon}
      </div>
      <div>
        <div className="font-heading text-h2 font-600">{value}</div>
        <p className="font-body text-p-12 text-brand-grey-500">{description}</p>
      </div>
    </CardWrapper>
  );
}
