/**
 * Project Form Component
 * Reusable form for creating and editing projects
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { createProject, updateProject } from '@/features/projects/actions';
import type { Project } from '@/features/projects/types';

interface ProjectFormProps {
  project?: Project;
  mode: 'create' | 'edit';
}

export function ProjectForm({ project, mode }: ProjectFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);

    try {
      let result;
      if (mode === 'create') {
        result = await createProject(formData);
      } else if (project) {
        result = await updateProject(project.id, formData);
      }

      if (result?.error) {
        setError(result.error);
      } else {
        // Redirect on success
        if (mode === 'create' && result?.data?.id) {
          router.push(`/protected/admin/projects/${result.data.id}`);
        } else {
          router.push('/protected/admin/projects');
        }
        router.refresh();
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{mode === 'create' ? 'Create New Project' : 'Edit Project'}</CardTitle>
        <CardDescription>
          {mode === 'create'
            ? 'Fill in the details below to showcase your project'
            : 'Update the project details below'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm">
              {error}
            </div>
          )}

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">
              Project Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              name="title"
              required
              defaultValue={project?.title}
              placeholder="Prayer App"
              maxLength={200}
            />
            <p className="text-xs text-muted-foreground">
              A clear, descriptive name for your project
            </p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={project?.description || ''}
              placeholder="A mobile app that helps people discover and share prayer requests in their local community..."
              rows={4}
              maxLength={10000}
            />
            <p className="text-xs text-muted-foreground">
              A brief overview of your project (supports Markdown)
            </p>
          </div>

          {/* Problem Statement */}
          <div className="space-y-2">
            <Label htmlFor="problem_statement">Problem Statement</Label>
            <Textarea
              id="problem_statement"
              name="problem_statement"
              defaultValue={project?.problem_statement || ''}
              placeholder="Many Christians struggle to stay connected to their community's prayer needs..."
              rows={3}
              maxLength={2000}
            />
            <p className="text-xs text-muted-foreground">
              What problem does this project solve?
            </p>
          </div>

          {/* Solution */}
          <div className="space-y-2">
            <Label htmlFor="solution">Solution</Label>
            <Textarea
              id="solution"
              name="solution"
              defaultValue={project?.solution || ''}
              placeholder="Our app provides a centralized platform where church members can post, discover, and pray for requests in real-time..."
              rows={3}
              maxLength={2000}
            />
            <p className="text-xs text-muted-foreground">
              How does your project solve the problem?
            </p>
          </div>

          {/* GitHub URL */}
          <div className="space-y-2">
            <Label htmlFor="github_url">GitHub Repository URL</Label>
            <Input
              id="github_url"
              name="github_url"
              type="url"
              defaultValue={project?.github_url || ''}
              placeholder="https://github.com/username/prayer-app"
            />
            <p className="text-xs text-muted-foreground">
              Link to your project's source code
            </p>
          </div>

          {/* Demo URL */}
          <div className="space-y-2">
            <Label htmlFor="demo_url">Demo/Live URL</Label>
            <Input
              id="demo_url"
              name="demo_url"
              type="url"
              defaultValue={project?.demo_url || ''}
              placeholder="https://prayer-app.com"
            />
            <p className="text-xs text-muted-foreground">
              Link to your live demo or deployed application
            </p>
          </div>

          {/* Image URL */}
          <div className="space-y-2">
            <Label htmlFor="image_url">Project Image URL</Label>
            <Input
              id="image_url"
              name="image_url"
              type="url"
              defaultValue={project?.image_url || ''}
              placeholder="https://example.com/screenshot.png"
            />
            <p className="text-xs text-muted-foreground">
              Link to a screenshot or logo for your project
            </p>
          </div>

          {/* Form Actions */}
          <div className="flex gap-3">
            <Button type="submit" disabled={isLoading}>
              {isLoading
                ? mode === 'create'
                  ? 'Creating...'
                  : 'Saving...'
                : mode === 'create'
                  ? 'Create Project'
                  : 'Save Changes'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isLoading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
