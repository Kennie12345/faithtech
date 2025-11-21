import { describe, it, expect } from 'vitest';
import {
  createProjectSchema,
  updateProjectSchema,
  addMemberSchema,
  projectMemberRoleSchema,
  parseProjectFormData,
} from '@/features/projects/schemas';
import { createFormData } from '@/__tests__/helpers/test-utils';

describe('Projects Schemas', () => {
  describe('projectMemberRoleSchema', () => {
    it('should accept valid member roles', () => {
      expect(projectMemberRoleSchema.parse('lead')).toBe('lead');
      expect(projectMemberRoleSchema.parse('contributor')).toBe('contributor');
    });

    it('should reject invalid member roles', () => {
      expect(() => projectMemberRoleSchema.parse('admin')).toThrow();
      expect(() => projectMemberRoleSchema.parse('LEAD')).toThrow();
      expect(() => projectMemberRoleSchema.parse('')).toThrow();
    });
  });

  describe('createProjectSchema', () => {
    const validProjectData = {
      title: 'FaithTech Website',
      description: 'Building the FaithTech community website',
      problem_statement: 'We need a centralized platform for our community',
      solution: 'A modern web app built with Next.js and Supabase',
      github_url: 'https://github.com/faithtech/website',
      demo_url: 'https://faithtech.demo.com',
      image_url: 'https://images.example.com/project.jpg',
    };

    describe('Valid Projects', () => {
      it('should accept valid project data', () => {
        const result = createProjectSchema.parse(validProjectData);
        expect(result.title).toBe('FaithTech Website');
      });

      it('should accept project with minimal required fields', () => {
        const minimal = {
          title: 'Minimal Project',
        };
        const result = createProjectSchema.parse(minimal);
        expect(result.title).toBe('Minimal Project');
      });

      it('should accept project without URLs', () => {
        const data = {
          title: 'Early Stage Project',
          description: 'Just getting started',
          github_url: null,
          demo_url: null,
          image_url: null,
        };
        const result = createProjectSchema.parse(data);
        expect(result.github_url).toBeNull();
      });

      it('should accept project with only some fields', () => {
        const data = {
          title: 'Partial Project',
          description: 'Has description',
          github_url: 'https://github.com/example/repo',
        };
        const result = createProjectSchema.parse(data);
        expect(result.title).toBe('Partial Project');
        expect(result.github_url).toBe('https://github.com/example/repo');
      });
    });

    describe('Title Validation', () => {
      it('should reject empty title', () => {
        const data = { ...validProjectData, title: '' };
        expect(() => createProjectSchema.parse(data)).toThrow('Title is required');
      });

      it('should reject title over 200 characters', () => {
        const data = { ...validProjectData, title: 'a'.repeat(201) };
        expect(() => createProjectSchema.parse(data)).toThrow(
          'Title must be less than 200 characters'
        );
      });

      it('should accept title at exactly 200 characters', () => {
        const data = { ...validProjectData, title: 'a'.repeat(200) };
        const result = createProjectSchema.parse(data);
        expect(result.title.length).toBe(200);
      });
    });

    describe('Description Validation', () => {
      it('should accept null description', () => {
        const data = { ...validProjectData, description: null };
        const result = createProjectSchema.parse(data);
        expect(result.description).toBeNull();
      });

      it('should reject description over 10,000 characters', () => {
        const data = { ...validProjectData, description: 'a'.repeat(10001) };
        expect(() => createProjectSchema.parse(data)).toThrow(
          'Description must be less than 10,000 characters'
        );
      });

      it('should accept description at exactly 10,000 characters', () => {
        const data = { ...validProjectData, description: 'a'.repeat(10000) };
        const result = createProjectSchema.parse(data);
        expect(result.description?.length).toBe(10000);
      });
    });

    describe('Problem Statement Validation', () => {
      it('should accept null problem statement', () => {
        const data = { ...validProjectData, problem_statement: null };
        const result = createProjectSchema.parse(data);
        expect(result.problem_statement).toBeNull();
      });

      it('should reject problem statement over 2,000 characters', () => {
        const data = { ...validProjectData, problem_statement: 'a'.repeat(2001) };
        expect(() => createProjectSchema.parse(data)).toThrow(
          'Problem statement must be less than 2,000 characters'
        );
      });

      it('should accept problem statement at exactly 2,000 characters', () => {
        const data = { ...validProjectData, problem_statement: 'a'.repeat(2000) };
        const result = createProjectSchema.parse(data);
        expect(result.problem_statement?.length).toBe(2000);
      });
    });

    describe('Solution Validation', () => {
      it('should accept null solution', () => {
        const data = { ...validProjectData, solution: null };
        const result = createProjectSchema.parse(data);
        expect(result.solution).toBeNull();
      });

      it('should reject solution over 2,000 characters', () => {
        const data = { ...validProjectData, solution: 'a'.repeat(2001) };
        expect(() => createProjectSchema.parse(data)).toThrow(
          'Solution must be less than 2,000 characters'
        );
      });

      it('should accept solution at exactly 2,000 characters', () => {
        const data = { ...validProjectData, solution: 'a'.repeat(2000) };
        const result = createProjectSchema.parse(data);
        expect(result.solution?.length).toBe(2000);
      });
    });

    describe('URL Validation', () => {
      it('should accept valid GitHub URL', () => {
        const data = {
          ...validProjectData,
          github_url: 'https://github.com/faithtech/project',
        };
        const result = createProjectSchema.parse(data);
        expect(result.github_url).toBe('https://github.com/faithtech/project');
      });

      it('should accept empty string for GitHub URL', () => {
        const data = { ...validProjectData, github_url: '' };
        const result = createProjectSchema.parse(data);
        expect(result.github_url).toBe('');
      });

      it('should reject invalid GitHub URL', () => {
        const data = { ...validProjectData, github_url: 'not-a-url' };
        expect(() => createProjectSchema.parse(data)).toThrow(
          'GitHub URL must be a valid URL'
        );
      });

      it('should accept valid demo URL', () => {
        const data = {
          ...validProjectData,
          demo_url: 'https://demo.faithtech.com',
        };
        const result = createProjectSchema.parse(data);
        expect(result.demo_url).toBe('https://demo.faithtech.com');
      });

      it('should accept empty string for demo URL', () => {
        const data = { ...validProjectData, demo_url: '' };
        const result = createProjectSchema.parse(data);
        expect(result.demo_url).toBe('');
      });

      it('should reject invalid demo URL', () => {
        const data = { ...validProjectData, demo_url: 'not-a-url' };
        expect(() => createProjectSchema.parse(data)).toThrow(
          'Demo URL must be a valid URL'
        );
      });

      it('should accept valid image URL', () => {
        const data = {
          ...validProjectData,
          image_url: 'https://images.example.com/project.jpg',
        };
        const result = createProjectSchema.parse(data);
        expect(result.image_url).toBe('https://images.example.com/project.jpg');
      });

      it('should accept empty string for image URL', () => {
        const data = { ...validProjectData, image_url: '' };
        const result = createProjectSchema.parse(data);
        expect(result.image_url).toBe('');
      });

      it('should reject invalid image URL', () => {
        const data = { ...validProjectData, image_url: 'not-a-url' };
        expect(() => createProjectSchema.parse(data)).toThrow(
          'Image URL must be a valid URL'
        );
      });

      it('should accept non-GitHub URLs for github_url field', () => {
        // Field name is github_url but schema doesn't enforce GitHub domain
        const data = {
          ...validProjectData,
          github_url: 'https://gitlab.com/faithtech/project',
        };
        const result = createProjectSchema.parse(data);
        expect(result.github_url).toBe('https://gitlab.com/faithtech/project');
      });
    });
  });

  describe('updateProjectSchema', () => {
    it('should accept partial updates', () => {
      const result = updateProjectSchema.parse({ title: 'Updated Title' });
      expect(result.title).toBe('Updated Title');
    });

    it('should accept empty object', () => {
      const result = updateProjectSchema.parse({});
      expect(result).toEqual({});
    });

    it('should accept any combination of fields', () => {
      const result = updateProjectSchema.parse({
        title: 'New Title',
        demo_url: 'https://new-demo.com',
      });
      expect(result.title).toBe('New Title');
      expect(result.demo_url).toBe('https://new-demo.com');
    });

    it('should still validate provided fields', () => {
      expect(() => updateProjectSchema.parse({ title: '' })).toThrow(
        'Title is required'
      );
      expect(() => updateProjectSchema.parse({ github_url: 'invalid-url' })).toThrow();
    });
  });

  describe('addMemberSchema', () => {
    it('should accept valid member data', () => {
      const data = {
        user_id: '123e4567-e89b-12d3-a456-426614174000',
        role: 'contributor' as const,
      };
      const result = addMemberSchema.parse(data);
      expect(result.user_id).toBe(data.user_id);
      expect(result.role).toBe('contributor');
    });

    it('should accept both member roles', () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';

      expect(addMemberSchema.parse({ user_id: userId, role: 'lead' }).role).toBe(
        'lead'
      );
      expect(
        addMemberSchema.parse({ user_id: userId, role: 'contributor' }).role
      ).toBe('contributor');
    });

    it('should reject invalid UUID for user_id', () => {
      const data = { user_id: 'not-a-uuid', role: 'contributor' as const };
      expect(() => addMemberSchema.parse(data)).toThrow('Invalid user ID');
    });

    it('should reject invalid member role', () => {
      const data = {
        user_id: '123e4567-e89b-12d3-a456-426614174000',
        role: 'admin',
      };
      expect(() => addMemberSchema.parse(data)).toThrow();
    });

    it('should reject missing user_id', () => {
      const data = { role: 'contributor' as const };
      expect(() => addMemberSchema.parse(data)).toThrow();
    });

    it('should reject missing role', () => {
      const data = { user_id: '123e4567-e89b-12d3-a456-426614174000' };
      expect(() => addMemberSchema.parse(data)).toThrow();
    });
  });

  describe('parseProjectFormData()', () => {
    it('should parse valid FormData', () => {
      const formData = createFormData({
        title: 'Test Project',
        description: 'Test Description',
        problem_statement: 'Problem',
        solution: 'Solution',
        github_url: 'https://github.com/test/repo',
        demo_url: 'https://demo.test.com',
        image_url: 'https://images.test.com/img.jpg',
      });

      const result = parseProjectFormData(formData);
      expect(result.title).toBe('Test Project');
      expect(result.github_url).toBe('https://github.com/test/repo');
    });

    it('should handle optional fields', () => {
      const formData = createFormData({
        title: 'Minimal Project',
      });

      const result = parseProjectFormData(formData);
      expect(result.title).toBe('Minimal Project');
      expect(result.description).toBeNull();
      expect(result.github_url).toBeNull();
    });

    it('should convert empty strings to null', () => {
      const formData = createFormData({
        title: 'Test Project',
        description: '',
        github_url: '',
      });

      const result = parseProjectFormData(formData);
      expect(result.description).toBeNull();
      expect(result.github_url).toBeNull();
    });

    it('should throw on invalid data', () => {
      const formData = createFormData({
        title: '', // Invalid: empty
      });

      expect(() => parseProjectFormData(formData)).toThrow('Title is required');
    });

    it('should throw on missing required fields', () => {
      const formData = createFormData({
        description: 'Description without title',
      });

      expect(() => parseProjectFormData(formData)).toThrow();
    });

    it('should validate URL format', () => {
      const formData = createFormData({
        title: 'Test Project',
        github_url: 'not-a-url',
      });

      expect(() => parseProjectFormData(formData)).toThrow(
        'GitHub URL must be a valid URL'
      );
    });
  });

  describe('Real-world Scenarios', () => {
    it('should handle typical project submission', () => {
      const data = {
        title: 'Church Management System',
        description:
          'A comprehensive system to help churches manage members, events, and communications.',
        problem_statement:
          'Churches struggle to manage member data and coordinate events effectively.',
        solution:
          'Built a web application with member database, event scheduling, and email integration.',
        github_url: 'https://github.com/faithtech/church-mgmt',
        demo_url: 'https://demo.churchmgmt.com',
        image_url: 'https://images.faithtech.com/church-mgmt.jpg',
      };

      const result = createProjectSchema.parse(data);
      expect(result.title).toBe('Church Management System');
    });

    it('should handle early-stage project (no demo yet)', () => {
      const data = {
        title: 'Prayer App Concept',
        description: 'Mobile app for sharing prayer requests',
        problem_statement: 'Need better way to share prayer needs',
        github_url: 'https://github.com/user/prayer-app',
        demo_url: null, // No demo yet
        image_url: null, // No screenshot yet
      };

      const result = createProjectSchema.parse(data);
      expect(result.title).toBe('Prayer App Concept');
      expect(result.demo_url).toBeNull();
    });

    it('should handle hackathon project (quick submission)', () => {
      const data = {
        title: 'Bible Verse Generator',
        description: 'Quick tool to generate daily Bible verses',
        github_url: 'https://github.com/hackathon/verse-gen',
        demo_url: 'https://verse-gen.vercel.app',
      };

      const result = createProjectSchema.parse(data);
      expect(result.title).toBe('Bible Verse Generator');
      expect(result.problem_statement).toBeUndefined();
    });

    it('should handle open source contribution', () => {
      const data = {
        title: 'Contributing to YouVersion API',
        description: 'Added new features to Bible API',
        solution: 'Implemented verse search and cross-references',
        github_url: 'https://github.com/lifechurch/youversion-api',
      };

      const result = createProjectSchema.parse(data);
      expect(result.title).toBe('Contributing to YouVersion API');
    });
  });
});
