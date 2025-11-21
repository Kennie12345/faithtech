/**
 * Admin Dashboard
 * Main landing page for authenticated city administrators
 */

import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getCurrentCityId, getCurrentCity, getCityStats } from '@/lib/core/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
      <div className="flex-1 w-full flex flex-col gap-12">
        <div className="bg-destructive/10 text-destructive p-4 px-6 rounded-lg">
          <h2 className="font-semibold mb-2">No City Context</h2>
          <p className="text-sm">
            Please select a city first. If you're a new administrator, contact support to set up your city.
          </p>
        </div>
      </div>
    );
  }

  // Fetch stats for dashboard
  const stats = await getCityStats(cityId);

  return (
    <div className="flex-1 w-full flex flex-col gap-12">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">
          Welcome to {city?.name || 'FaithTech'} Admin
        </h1>
        <p className="text-muted-foreground">
          Manage your community's events, projects, and content
        </p>
      </div>

      {/* Quick Stats */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Overview</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Events"
            value={stats.eventCount}
            description="Total events created"
            icon={<CalendarDays className="h-4 w-4 text-muted-foreground" />}
            href="/protected/admin/events"
          />
          <StatCard
            title="Projects"
            value={stats.projectCount}
            description="Active projects"
            icon={<Rocket className="h-4 w-4 text-muted-foreground" />}
            href="/protected/admin/projects"
          />
          <StatCard
            title="Blog Posts"
            value={stats.postCount}
            description="Published articles"
            icon={<BookOpen className="h-4 w-4 text-muted-foreground" />}
            href="/protected/admin/blog"
          />
          <StatCard
            title="Members"
            value={stats.memberCount}
            description="Community members"
            icon={<Users className="h-4 w-4 text-muted-foreground" />}
            href="#"
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="hover:bg-accent/50 transition-colors">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CalendarDays className="h-5 w-5" />
                Create Event
              </CardTitle>
              <CardDescription>
                Schedule a new community gathering or meetup
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/protected/admin/events/new">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  New Event
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:bg-accent/50 transition-colors">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Rocket className="h-5 w-5" />
                Add Project
              </CardTitle>
              <CardDescription>
                Showcase a new CREATE project or initiative
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/protected/admin/projects/new">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  New Project
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:bg-accent/50 transition-colors">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Write Post
              </CardTitle>
              <CardDescription>
                Share insights, updates, or resources with your community
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/protected/admin/blog/new">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  New Post
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Getting Started */}
      {stats.eventCount === 0 && stats.projectCount === 0 && stats.postCount === 0 && (
        <Card className="border-primary/50 bg-primary/5">
          <CardHeader>
            <CardTitle>🎉 Getting Started</CardTitle>
            <CardDescription>
              Welcome to your FaithTech community dashboard! Here are some first steps:
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <strong>1. Create your first event</strong> - Host a meetup, hackathon, or workshop
            </p>
            <p>
              <strong>2. Add a project</strong> - Showcase what your community is building
            </p>
            <p>
              <strong>3. Write a blog post</strong> - Share your story and attract new members
            </p>
          </CardContent>
        </Card>
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
      return <Card>{children}</Card>;
    }
    return (
      <Link href={href} className="block">
        <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
          {children}
        </Card>
      </Link>
    );
  };

  return (
    <CardWrapper>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </CardWrapper>
  );
}
