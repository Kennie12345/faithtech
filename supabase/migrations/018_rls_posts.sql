-- Migration 018: Row Level Security Policies for Posts Table
-- Enables RLS and creates policies for posts
-- Dependencies: 006 (helper functions), 017 (posts table)
-- Blocks: Safe querying of posts

-- =============================================================================
-- POSTS TABLE
-- =============================================================================

ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- SELECT: Published posts visible to city members, drafts only to creator/admin
-- This is more complex than projects - we need to check published_at status
DROP POLICY IF EXISTS "Posts visible based on publish status" ON posts;
CREATE POLICY "Posts visible based on publish status"
  ON posts
  FOR SELECT
  TO authenticated
  USING (
    -- Published posts: visible to all city members
    (city_id = public.current_city() AND published_at IS NOT NULL)
    -- Drafts: visible only to creator or admin
    OR (city_id = public.current_city() AND created_by = auth.uid())
    OR public.is_super_admin()
    OR public.user_role(city_id) IN ('city_admin', 'super_admin')
  );

-- INSERT: Any authenticated member can create posts (as drafts)
-- This follows the Projects pattern where members can contribute content
DROP POLICY IF EXISTS "Posts insertable by city members" ON posts;
CREATE POLICY "Posts insertable by city members"
  ON posts
  FOR INSERT
  TO authenticated
  WITH CHECK (
    city_id = public.current_city()
    AND created_by = auth.uid()
  );

-- UPDATE: Post creator OR city admin can edit
-- This allows members to edit their own posts, admins can edit any post
DROP POLICY IF EXISTS "Posts updatable by creator or admin" ON posts;
CREATE POLICY "Posts updatable by creator or admin"
  ON posts
  FOR UPDATE
  TO authenticated
  USING (
    public.is_super_admin()
    OR created_by = auth.uid()
    OR public.user_role(city_id) IN ('city_admin', 'super_admin')
  )
  WITH CHECK (
    public.is_super_admin()
    OR created_by = auth.uid()
    OR public.user_role(city_id) IN ('city_admin', 'super_admin')
  );

-- DELETE: City admins only (members cannot delete their own posts)
DROP POLICY IF EXISTS "Posts deletable by city admin" ON posts;
CREATE POLICY "Posts deletable by city admin"
  ON posts
  FOR DELETE
  TO authenticated
  USING (
    public.is_super_admin()
    OR public.user_role(city_id) IN ('city_admin', 'super_admin')
  );

-- =============================================================================
-- COMMENTS
-- =============================================================================

COMMENT ON POLICY "Posts visible based on publish status" ON posts IS 'Published posts visible to all city members, drafts only to creator/admin';
COMMENT ON POLICY "Posts insertable by city members" ON posts IS 'Any authenticated member can create posts (as drafts by default)';
COMMENT ON POLICY "Posts updatable by creator or admin" ON posts IS 'Post creators can edit their own posts, city admins can edit any post';
COMMENT ON POLICY "Posts deletable by city admin" ON posts IS 'Only city admins can delete posts (not post creators)';

-- =============================================================================
-- TESTING NOTES
-- =============================================================================

-- Test RLS policies with:
--
-- SET ROLE authenticated;
-- SET request.jwt.claims.sub TO 'adelaide-member-uuid';
-- INSERT INTO posts (city_id, title, slug, content, created_by) VALUES ('adelaide-city-uuid', 'My Draft Post', 'my-draft', 'Content here', 'adelaide-member-uuid');
-- -- Should succeed - members can create posts (as drafts)
--
-- SELECT * FROM posts WHERE created_by = 'adelaide-member-uuid';
-- -- Should see own draft posts
--
-- UPDATE posts SET title = 'Updated Title' WHERE created_by = 'adelaide-member-uuid';
-- -- Should succeed - creator can update their own post
--
-- UPDATE posts SET published_at = NOW() WHERE created_by = 'adelaide-member-uuid';
-- -- Should succeed - creator can publish their own post
--
-- SET request.jwt.claims.sub TO 'different-member-uuid';
-- SELECT * FROM posts WHERE created_by = 'adelaide-member-uuid' AND published_at IS NULL;
-- -- Should NOT see other member's drafts
--
-- SELECT * FROM posts WHERE created_by = 'adelaide-member-uuid' AND published_at IS NOT NULL;
-- -- Should see published posts from other members
--
-- UPDATE posts SET title = 'Hacked' WHERE created_by = 'adelaide-member-uuid';
-- -- Should fail - cannot update other members' posts
--
-- SET request.jwt.claims.sub TO 'adelaide-admin-uuid';
-- SELECT * FROM posts WHERE city_id = 'adelaide-city-uuid';
-- -- Should see all posts (drafts + published) in their city
--
-- UPDATE posts SET is_featured = TRUE WHERE city_id = 'adelaide-city-uuid';
-- -- Should succeed - admin can update any post in their city
--
-- DELETE FROM posts WHERE created_by = 'adelaide-member-uuid';
-- -- Should succeed - admin can delete posts
--
-- SET request.jwt.claims.sub TO 'adelaide-member-uuid';
-- DELETE FROM posts WHERE created_by = 'adelaide-member-uuid';
-- -- Should fail - members cannot delete their own posts
--
-- RESET ROLE;
