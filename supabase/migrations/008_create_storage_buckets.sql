-- Migration 008: Supabase Storage Buckets
-- Creates storage buckets for images and files with appropriate RLS policies
-- Dependencies: 007 (RLS helper functions)
-- Blocks: Image upload features

-- =============================================================================
-- STORAGE BUCKETS
-- =============================================================================

-- City Logos: Uploaded by super admins only
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'city-logos',
  'city-logos',
  true, -- Public bucket (logos are publicly accessible)
  2097152, -- 2MB max file size
  ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml']
) ON CONFLICT (id) DO NOTHING;

-- City Hero Images: Uploaded by city admins
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'city-heroes',
  'city-heroes',
  true, -- Public bucket (hero images are publicly accessible)
  5242880, -- 5MB max file size
  ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- User Avatars: Uploaded by users for their own profiles
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true, -- Public bucket (avatars are publicly accessible)
  1048576, -- 1MB max file size
  ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Project Images: Uploaded by project creators
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'project-images',
  'project-images',
  true, -- Public bucket (project images are publicly accessible)
  5242880, -- 5MB max file size
  ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Blog Post Images: Uploaded by blog post authors
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'blog-images',
  'blog-images',
  true, -- Public bucket (blog images are publicly accessible)
  5242880, -- 5MB max file size
  ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

-- Open Graph Images: Generated or uploaded for social sharing
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'og-images',
  'og-images',
  true, -- Public bucket (OG images must be publicly accessible for social crawlers)
  2097152, -- 2MB max file size
  ARRAY['image/png', 'image/jpeg', 'image/jpg']
) ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- STORAGE RLS POLICIES
-- =============================================================================

-- CITY LOGOS
-- SELECT: Public (anyone can view logos)
CREATE POLICY "City logos are publicly accessible"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'city-logos');

-- INSERT: Super admin only
CREATE POLICY "City logos uploadable by super admin"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'city-logos'
    AND auth.is_super_admin()
  );

-- UPDATE: Super admin only
CREATE POLICY "City logos updatable by super admin"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'city-logos'
    AND auth.is_super_admin()
  );

-- DELETE: Super admin only
CREATE POLICY "City logos deletable by super admin"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'city-logos'
    AND auth.is_super_admin()
  );

-- CITY HEROES
-- SELECT: Public
CREATE POLICY "City heroes are publicly accessible"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'city-heroes');

-- INSERT: City admin or super admin
CREATE POLICY "City heroes uploadable by city admin"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'city-heroes'
    AND (
      auth.is_super_admin()
      OR auth.user_role(auth.current_city()) IN ('city_admin', 'super_admin')
    )
  );

-- UPDATE: City admin or super admin
CREATE POLICY "City heroes updatable by city admin"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'city-heroes'
    AND (
      auth.is_super_admin()
      OR auth.user_role(auth.current_city()) IN ('city_admin', 'super_admin')
    )
  );

-- DELETE: City admin or super admin
CREATE POLICY "City heroes deletable by city admin"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'city-heroes'
    AND (
      auth.is_super_admin()
      OR auth.user_role(auth.current_city()) IN ('city_admin', 'super_admin')
    )
  );

-- AVATARS
-- SELECT: Public
CREATE POLICY "Avatars are publicly accessible"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'avatars');

-- INSERT: Users can upload their own avatar (path must match user ID)
CREATE POLICY "Avatars uploadable by owner"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- UPDATE: Users can update their own avatar
CREATE POLICY "Avatars updatable by owner"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- DELETE: Users can delete their own avatar
CREATE POLICY "Avatars deletable by owner"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- PROJECT IMAGES
-- SELECT: Public
CREATE POLICY "Project images are publicly accessible"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'project-images');

-- INSERT: Any authenticated user (for project submissions)
CREATE POLICY "Project images uploadable by authenticated users"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'project-images');

-- UPDATE: Owner or city admin
CREATE POLICY "Project images updatable by owner or admin"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'project-images'
    AND (
      (storage.foldername(name))[1] = auth.uid()::text
      OR auth.is_super_admin()
      OR auth.user_role(auth.current_city()) IN ('city_admin', 'super_admin')
    )
  );

-- DELETE: Owner or city admin
CREATE POLICY "Project images deletable by owner or admin"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'project-images'
    AND (
      (storage.foldername(name))[1] = auth.uid()::text
      OR auth.is_super_admin()
      OR auth.user_role(auth.current_city()) IN ('city_admin', 'super_admin')
    )
  );

-- BLOG IMAGES
-- SELECT: Public
CREATE POLICY "Blog images are publicly accessible"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'blog-images');

-- INSERT: City admin only (blog authors)
CREATE POLICY "Blog images uploadable by city admin"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'blog-images'
    AND (
      auth.is_super_admin()
      OR auth.user_role(auth.current_city()) IN ('city_admin', 'super_admin')
    )
  );

-- UPDATE: City admin only
CREATE POLICY "Blog images updatable by city admin"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'blog-images'
    AND (
      auth.is_super_admin()
      OR auth.user_role(auth.current_city()) IN ('city_admin', 'super_admin')
    )
  );

-- DELETE: City admin only
CREATE POLICY "Blog images deletable by city admin"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'blog-images'
    AND (
      auth.is_super_admin()
      OR auth.user_role(auth.current_city()) IN ('city_admin', 'super_admin')
    )
  );

-- OG IMAGES
-- SELECT: Public (must be accessible to social media crawlers)
CREATE POLICY "OG images are publicly accessible"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'og-images');

-- INSERT: City admin or automated generation
CREATE POLICY "OG images uploadable by city admin"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'og-images'
    AND (
      auth.is_super_admin()
      OR auth.user_role(auth.current_city()) IN ('city_admin', 'super_admin')
    )
  );

-- UPDATE: City admin only
CREATE POLICY "OG images updatable by city admin"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'og-images'
    AND (
      auth.is_super_admin()
      OR auth.user_role(auth.current_city()) IN ('city_admin', 'super_admin')
    )
  );

-- DELETE: City admin only
CREATE POLICY "OG images deletable by city admin"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'og-images'
    AND (
      auth.is_super_admin()
      OR auth.user_role(auth.current_city()) IN ('city_admin', 'super_admin')
    )
  );

-- =============================================================================
-- USAGE NOTES
-- =============================================================================

-- File path conventions (important for RLS policies):
--
-- City logos: city-logos/{city-id}.png
-- City heroes: city-heroes/{city-id}.jpg
-- Avatars: avatars/{user-id}/{filename}.jpg
-- Project images: project-images/{user-id}/{project-id}/{filename}.jpg
-- Blog images: blog-images/{city-id}/{post-id}/{filename}.jpg
-- OG images: og-images/{city-id}/{content-type}/{content-id}.jpg
--
-- Example avatar upload in Next.js:
-- const { data, error } = await supabase.storage
--   .from('avatars')
--   .upload(`${user.id}/avatar.jpg`, file, { upsert: true });
--
-- Example URL generation:
-- const { data } = supabase.storage
--   .from('avatars')
--   .getPublicUrl(`${user.id}/avatar.jpg`);
-- console.log(data.publicUrl); // https://[project-ref].supabase.co/storage/v1/object/public/avatars/[user-id]/avatar.jpg

-- =============================================================================
-- COMMENTS
-- =============================================================================

COMMENT ON COLUMN storage.buckets.public IS 'Public buckets have URLs accessible without auth (needed for images in public pages)';
COMMENT ON COLUMN storage.buckets.file_size_limit IS 'Max file size in bytes (enforced at upload time)';
COMMENT ON COLUMN storage.buckets.allowed_mime_types IS 'Restrict uploads to specific file types for security';
