-- =============================================================================
-- Seed Data for FaithTech Regional Hub
-- =============================================================================
-- Creates initial test data for local development
-- Run with: supabase db reset (applies all migrations + seed data)
--
-- IMPORTANT: This seed data is for LOCAL DEVELOPMENT ONLY
-- Production data should be created via the /setup wizard or admin UI
-- =============================================================================

-- =============================================================================
-- CITIES
-- =============================================================================

-- NOTE: Default cities are now seeded via migration 020_seed_default_cities.sql
-- This seed file is for LOCAL DEVELOPMENT ONLY and focuses on test data
-- (groups, events, projects, blog posts, etc.)
--
-- The 4 Australian cities (Adelaide, Sydney, Melbourne, Brisbane) are already
-- created by the migration system, so we don't need to insert them here.

-- =============================================================================
-- TEST USERS & PROFILES
-- =============================================================================

-- Note: Users must be created via Supabase Auth (either UI or auth.signup())
-- Cannot directly INSERT into auth.users table as it requires proper password hashing
--
-- FOR LOCAL DEVELOPMENT:
-- 1. Start supabase: supabase start
-- 2. Open Supabase Studio: http://localhost:54323
-- 3. Go to Authentication > Users > Add User
-- 4. Create test users:
--    - super-admin@faithtech.test / password: TestAdmin123!
--    - adelaide-admin@faithtech.test / password: TestAdmin123!
--    - sydney-admin@faithtech.test / password: TestAdmin123!
--    - member@faithtech.test / password: TestMember123!
--
-- 5. Note the UUIDs generated for each user
-- 6. Update the INSERT statements below with the actual UUIDs

-- Uncomment and update with real UUIDs after creating users in Supabase Studio:
/*
-- Create profiles for test users
INSERT INTO profiles (id, display_name, avatar_url, bio, created_at, updated_at)
VALUES
  (
    'REPLACE-WITH-SUPER-ADMIN-UUID',
    'Super Admin',
    NULL,
    'FaithTech Australia Super Admin - manages all cities',
    now(),
    now()
  ),
  (
    'REPLACE-WITH-ADELAIDE-ADMIN-UUID',
    'Adelaide Admin',
    NULL,
    'FaithTech Adelaide City Admin',
    now(),
    now()
  ),
  (
    'REPLACE-WITH-SYDNEY-ADMIN-UUID',
    'Sydney Admin',
    NULL,
    'FaithTech Sydney City Admin',
    now(),
    now()
  ),
  (
    'REPLACE-WITH-MEMBER-UUID',
    'Test Member',
    NULL,
    'Regular FaithTech member for testing',
    now(),
    now()
  );

-- Assign roles to cities
INSERT INTO user_city_roles (user_id, city_id, role, joined_at)
VALUES
  -- Super Admin: Global access to all cities
  ('REPLACE-WITH-SUPER-ADMIN-UUID', 'c1111111-1111-1111-1111-111111111111', 'super_admin', now()),
  ('REPLACE-WITH-SUPER-ADMIN-UUID', 'c2222222-2222-2222-2222-222222222222', 'super_admin', now()),
  ('REPLACE-WITH-SUPER-ADMIN-UUID', 'c3333333-3333-3333-3333-333333333333', 'super_admin', now()),

  -- Adelaide Admin: City admin for Adelaide only
  ('REPLACE-WITH-ADELAIDE-ADMIN-UUID', 'c1111111-1111-1111-1111-111111111111', 'city_admin', now()),

  -- Sydney Admin: City admin for Sydney only
  ('REPLACE-WITH-SYDNEY-ADMIN-UUID', 'c2222222-2222-2222-2222-222222222222', 'city_admin', now()),

  -- Test Member: Member of Adelaide
  ('REPLACE-WITH-MEMBER-UUID', 'c1111111-1111-1111-1111-111111111111', 'member', now());
*/

-- =============================================================================
-- GROUPS (Optional test data)
-- =============================================================================

-- Create test groups for each city
INSERT INTO groups (id, city_id, name, description, is_public, created_at, updated_at)
VALUES
  -- Adelaide groups
  (
    'g1111111-1111-1111-1111-111111111111',
    'c1111111-1111-1111-1111-111111111111',
    'Web Developers',
    'Frontend and backend web developers building for the kingdom',
    true,
    now(),
    now()
  ),
  (
    'g1111112-1111-1111-1111-111111111111',
    'c1111111-1111-1111-1111-111111111111',
    'Prayer Team',
    'Committed to praying for FaithTech Adelaide and tech workers',
    true,
    now(),
    now()
  ),
  -- Sydney groups
  (
    'g2222221-2222-2222-2222-222222222222',
    'c2222222-2222-2222-2222-222222222222',
    'Mobile Developers',
    'iOS and Android developers serving the Sydney community',
    true,
    now(),
    now()
  ),
  -- Melbourne groups
  (
    'g3333331-3333-3333-3333-333333333333',
    'c3333333-3333-3333-3333-333333333333',
    'Data Scientists',
    'Using data science and AI for social good in Melbourne',
    true,
    now(),
    now()
  );

-- =============================================================================
-- EVENTS (Test events for each city)
-- =============================================================================

-- Create upcoming test events
INSERT INTO events (id, city_id, title, description, slug, starts_at, ends_at, location_name, location_address, max_attendees, is_featured, created_at, updated_at)
VALUES
  -- Adelaide upcoming event (FEATURED)
  (
    'e1111111-1111-1111-1111-111111111111',
    'c1111111-1111-1111-1111-111111111111',
    'Community Meetup',
    E'Join us for our monthly community meetup!\n\nWe\'ll be discussing how technology can serve the kingdom, sharing testimonies, and connecting with other tech workers in Adelaide.\n\nBring a friend! Light refreshments provided.',
    'community-meetup',
    (now() + interval '7 days')::timestamptz, -- Next week
    (now() + interval '7 days 2 hours')::timestamptz,
    'St Paul''s Church',
    '123 Main Street, Adelaide SA 5000',
    50,
    true, -- Featured on homepage
    now(),
    now()
  ),
  -- Adelaide upcoming event 2 (FEATURED)
  (
    'e1111112-1111-1111-1111-111111111111',
    'c1111111-1111-1111-1111-111111111111',
    'Web Development Workshop',
    E'Learn modern web development with React and Next.js!\n\nThis hands-on workshop is perfect for beginners and intermediate developers looking to level up their skills.\n\nBring your laptop.',
    'web-dev-workshop',
    (now() + interval '14 days')::timestamptz, -- Two weeks from now
    (now() + interval '14 days 3 hours')::timestamptz,
    'TechHub Adelaide',
    '456 Tech St, Adelaide SA 5000',
    25,
    true, -- Featured on homepage
    now(),
    now()
  ),
  -- Sydney upcoming event (FEATURED)
  (
    'e2222221-2222-2222-2222-222222222222',
    'c2222222-2222-2222-2222-222222222222',
    'Prayer & Worship Night',
    E'Join us for an evening of prayer and worship focused on tech workers in Sydney.\n\nWe\'ll pray for breakthrough in the tech industry and for God\'s kingdom to advance through technology.',
    'prayer-worship-night',
    (now() + interval '10 days')::timestamptz,
    (now() + interval '10 days 2 hours')::timestamptz,
    'Hillsong City Campus',
    '789 George St, Sydney NSW 2000',
    NULL, -- Unlimited capacity
    true, -- Featured on homepage
    now(),
    now()
  ),
  -- Melbourne upcoming event (FEATURED)
  (
    'e3333331-3333-3333-3333-333333333333',
    'c3333333-3333-3333-3333-333333333333',
    'AI & Ethics Roundtable',
    E'A thoughtful discussion on artificial intelligence and Christian ethics.\n\nFeaturing guest speakers from leading tech companies and theological institutions.\n\nQ&A session included.',
    'ai-ethics-roundtable',
    (now() + interval '21 days')::timestamptz,
    (now() + interval '21 days 3 hours')::timestamptz,
    'Melbourne Convention Centre',
    '1 Convention Centre Pl, South Wharf VIC 3006',
    100,
    true, -- Featured on homepage
    now(),
    now()
  ),
  -- Adelaide past event (for testing)
  (
    'e1111113-1111-1111-1111-111111111111',
    'c1111111-1111-1111-1111-111111111111',
    'Launch Event',
    E'Our inaugural FaithTech Adelaide launch event!\n\nIt was amazing to see 80+ tech workers gather to worship, network, and envision how God can use technology for His glory.',
    'launch-event',
    (now() - interval '30 days')::timestamptz, -- Last month
    (now() - interval '30 days 3 hours')::timestamptz,
    'St Paul''s Church',
    '123 Main Street, Adelaide SA 5000',
    NULL,
    false, -- Past event, not featured
    now() - interval '45 days',
    now() - interval '45 days'
  );

-- =============================================================================
-- EVENT RSVPs (Test RSVPs)
-- =============================================================================

-- Note: Uncomment after creating test users and updating UUIDs
/*
INSERT INTO event_rsvps (event_id, user_id, status, created_at)
VALUES
  -- Adelaide Community Meetup RSVPs
  ('e1111111-1111-1111-1111-111111111111', 'REPLACE-WITH-ADELAIDE-ADMIN-UUID', 'yes', now()),
  ('e1111111-1111-1111-1111-111111111111', 'REPLACE-WITH-MEMBER-UUID', 'yes', now()),
  ('e1111111-1111-1111-1111-111111111111', 'REPLACE-WITH-SUPER-ADMIN-UUID', 'maybe', now()),

  -- Web Dev Workshop RSVPs
  ('e1111112-1111-1111-1111-111111111111', 'REPLACE-WITH-MEMBER-UUID', 'yes', now()),

  -- Sydney Prayer Night RSVPs
  ('e2222221-2222-2222-2222-222222222222', 'REPLACE-WITH-SYDNEY-ADMIN-UUID', 'yes', now()),
  ('e2222221-2222-2222-2222-222222222222', 'REPLACE-WITH-SUPER-ADMIN-UUID', 'yes', now()),

  -- Adelaide Launch Event (past event) RSVPs
  ('e1111113-1111-1111-1111-111111111111', 'REPLACE-WITH-ADELAIDE-ADMIN-UUID', 'yes', now() - interval '35 days'),
  ('e1111113-1111-1111-1111-111111111111', 'REPLACE-WITH-MEMBER-UUID', 'yes', now() - interval '35 days');
*/

-- =============================================================================
-- PROJECTS (Test projects for each city)
-- =============================================================================

-- Create test projects showcasing CREATE hackathon and tech-for-good work
INSERT INTO projects (id, city_id, title, description, slug, problem_statement, solution, github_url, demo_url, image_url, is_featured, created_at, updated_at)
VALUES
  -- Adelaide featured project
  (
    'p1111111-1111-1111-1111-111111111111',
    'c1111111-1111-1111-1111-111111111111',
    'Prayer Connect',
    E'A mobile app that helps Christians discover and share prayer requests in their local community.\n\nBuilt during FaithTech CREATE Adelaide 2024, this app connects believers to pray for one another in real-time.',
    'prayer-connect',
    'Many Christians struggle to stay connected to their community''s prayer needs. Prayer requests often get lost in group chats or forgotten after Sunday services.',
    'Prayer Connect provides a centralized platform where church members can post, discover, and pray for requests in real-time. Users can mark requests as "prayed for" and receive notifications when someone prays for their request.',
    'https://github.com/faithtech-adelaide/prayer-connect',
    'https://prayer-connect.faithtech.au',
    NULL,
    true, -- Featured project
    now() - interval '45 days',
    now() - interval '10 days'
  ),
  -- Adelaide regular project
  (
    'p1111112-1111-1111-1111-111111111111',
    'c1111111-1111-1111-1111-111111111111',
    'Scripture Memory Game',
    E'An interactive web game to help kids and adults memorize Bible verses through gamification.\n\nFeatures include: daily challenges, progress tracking, and social sharing.',
    'scripture-memory-game',
    'Many people want to memorize Scripture but find traditional methods boring or hard to stick with long-term.',
    'We gamified Scripture memorization with daily challenges, streaks, achievements, and friendly competition. Users earn points by correctly reciting verses and can challenge friends.',
    'https://github.com/faithtech-adelaide/scripture-game',
    'https://scripturegame.app',
    NULL,
    false,
    now() - interval '30 days',
    now() - interval '30 days'
  ),
  -- Sydney featured project
  (
    'p2222221-2222-2222-2222-222222222222',
    'c2222222-2222-2222-2222-222222222222',
    'Sermon Notes AI',
    E'AI-powered sermon note-taking app that automatically generates summaries and action items from sermon audio.\n\nWinner of CREATE Sydney 2024!',
    'sermon-notes-ai',
    'It''s hard to take good notes during sermons while actively listening. Many people forget key points by the time they get home.',
    'Using speech-to-text and GPT-4, our app automatically transcribes sermons and generates concise summaries, key takeaways, and suggested action items. Users can review and share notes with their small group.',
    'https://github.com/faithtech-sydney/sermon-notes-ai',
    'https://sermonnotes.ai',
    NULL,
    true, -- Featured project
    now() - interval '60 days',
    now() - interval '20 days'
  ),
  -- Sydney regular project
  (
    'p2222222-2222-2222-2222-222222222222',
    'c2222222-2222-2222-2222-222222222222',
    'Church Volunteer Scheduler',
    E'Simplify volunteer coordination for churches with automated scheduling and shift reminders.\n\nNo more spreadsheet chaos!',
    'volunteer-scheduler',
    'Churches rely on volunteers but coordinating schedules via email and spreadsheets is time-consuming and error-prone.',
    'Our web app allows church admins to create volunteer roles and shifts, while volunteers can sign up, swap shifts, and receive automated reminders. Integration with Google Calendar keeps everyone in sync.',
    'https://github.com/faithtech-sydney/volunteer-scheduler',
    NULL, -- No demo URL yet
    NULL,
    false,
    now() - interval '20 days',
    now() - interval '15 days'
  ),
  -- Melbourne featured project
  (
    'p3333331-3333-3333-3333-333333333333',
    'c3333333-3333-3333-3333-333333333333',
    'Bible Study Companion',
    E'An interactive Bible study tool with AI-powered insights, cross-references, and discussion questions.\n\nHelping small groups go deeper in God''s Word.',
    'bible-study-companion',
    'Small group leaders spend hours preparing Bible study materials, and it''s hard to find quality questions and cross-references quickly.',
    'Our app analyzes any Bible passage and generates contextual insights, historical background, cross-references, and discussion questions. Leaders can customize and export study guides in minutes.',
    'https://github.com/faithtech-melbourne/bible-study-companion',
    'https://biblestudycompanion.com',
    NULL,
    true, -- Featured project
    now() - interval '90 days',
    now() - interval '30 days'
  ),
  -- Melbourne regular project
  (
    'p3333332-3333-3333-3333-333333333333',
    'c3333333-3333-3333-3333-333333333333',
    'Faith & Finance Tracker',
    E'A budgeting app designed for Christians, with features for tithing tracking, generosity goals, and biblical financial principles.\n\nMoney management with kingdom priorities.',
    'faith-finance-tracker',
    'Generic budgeting apps don''t reflect Christian values like tithing, generosity, and stewardship. Many believers want to honor God with their finances but lack the right tools.',
    'Faith & Finance Tracker includes dedicated tithing categories, generosity goal tracking, and devotional content on biblical financial principles. Users can see their giving impact and plan for kingdom generosity.',
    'https://github.com/faithtech-melbourne/faith-finance',
    NULL,
    NULL,
    false,
    now() - interval '15 days',
    now() - interval '10 days'
  );

-- =============================================================================
-- BLOG POSTS (Test blog posts for each city)
-- =============================================================================

-- Create test blog posts showcasing community updates and stories
INSERT INTO posts (id, city_id, title, content, slug, excerpt, published_at, is_featured, featured_image_url, created_at, updated_at)
VALUES
  -- Adelaide featured post (published)
  (
    'b1111111-1111-1111-1111-111111111111',
    'c1111111-1111-1111-1111-111111111111',
    'Introducing FaithTech Adelaide: Building Tech for Good',
    E'# Welcome to FaithTech Adelaide!\n\nWe''re excited to announce the launch of FaithTech Adelaide, a community of Christian technologists, designers, and innovators passionate about using technology for the glory of God.\n\n## Our Vision\n\nAt FaithTech Adelaide, we believe that technology is a gift from God that can be used to advance His kingdom. We''re committed to:\n\n- Building tech-for-good projects that serve our community\n- Running CREATE hackathons where ideas become reality\n- Mentoring the next generation of Christian technologists\n- Fostering a community of faith and innovation\n\n## Get Involved\n\nWhether you''re a developer, designer, product manager, or just tech-curious, there''s a place for you at FaithTech Adelaide. Join us for our monthly meetups, participate in CREATE hackathons, or contribute to one of our community projects.\n\nTogether, let''s use our skills to make a difference in Adelaide and beyond!',
    'introducing-faithtech-adelaide',
    'We''re excited to announce the launch of FaithTech Adelaide, a community of Christian technologists passionate about using technology for the glory of God.',
    now() - interval '30 days',
    true, -- Featured post
    NULL,
    now() - interval '30 days',
    now() - interval '25 days'
  ),
  -- Adelaide regular post (published)
  (
    'b1111112-1111-1111-1111-111111111111',
    'c1111111-1111-1111-1111-111111111111',
    'CREATE Adelaide 2024 Recap: 10 Projects Built in 48 Hours',
    E'# CREATE Adelaide 2024: A Weekend of Innovation\n\nWhat happens when you gather 50 Christian technologists in a room for 48 hours? Magic.\n\n## The Projects\n\nOur first CREATE hackathon in Adelaide produced 10 incredible projects:\n\n1. **Prayer Connect** - A mobile app for community prayer requests (Winner!)\n2. **Scripture Memory Game** - Gamified Bible verse memorization\n3. **Church Admin Portal** - Streamlined church management\n4. **Mission Trip Planner** - Coordination tool for mission teams\n5. **Youth Event Platform** - Social network for church youth groups\n\n## Highlights\n\n- 50+ participants from 15 different churches\n- 10 working prototypes built\n- 3 projects launching publicly this quarter\n- Countless new friendships formed\n\n## What''s Next?\n\nCREATE Adelaide 2025 is already in the works. Stay tuned for dates and registration details!',
    'create-adelaide-2024-recap',
    'What happens when you gather 50 Christian technologists for 48 hours? See what we built at CREATE Adelaide 2024.',
    now() - interval '10 days',
    false,
    NULL,
    now() - interval '10 days',
    now() - interval '10 days'
  ),
  -- Sydney featured post (published)
  (
    'b2222221-2222-2222-2222-222222222222',
    'c2222222-2222-2222-2222-222222222222',
    'How AI is Transforming Ministry: Lessons from Sydney',
    E'# AI in Ministry: Opportunity or Threat?\n\nArtificial Intelligence is no longer science fiction—it''s here, and it''s changing how we do ministry.\n\n## Real-World Applications\n\nAt FaithTech Sydney, we''ve been exploring how AI can enhance (not replace) ministry:\n\n### Sermon Preparation\n- AI-assisted research and cross-referencing\n- Quick generation of discussion questions\n- Automatic transcription and summarization\n\n### Community Care\n- Chatbots for basic prayer requests\n- Automated follow-up reminders\n- Translation services for multicultural churches\n\n### Administration\n- Smart scheduling for volunteers\n- Data-driven insights for church health\n- Automated report generation\n\n## Ethical Considerations\n\nBut with great power comes great responsibility. We must ask:\n- Does this technology honor God?\n- Does it enhance or replace human connection?\n- Are we being good stewards of this tool?\n\n## Join the Conversation\n\nCome to our next meetup where we''ll discuss AI ethics in ministry. All perspectives welcome!',
    'ai-transforming-ministry-sydney',
    'Exploring how Artificial Intelligence is changing ministry, and what it means for churches in Sydney.',
    now() - interval '20 days',
    true, -- Featured post
    NULL,
    now() - interval '20 days',
    now() - interval '15 days'
  ),
  -- Sydney regular post (published)
  (
    'b2222222-2222-2222-2222-222222222222',
    'c2222222-2222-2222-2222-222222222222',
    'Meet the Team: Profile with David Chen, FaithTech Sydney Lead',
    E'# Meet David Chen: Building Community Through Code\n\n## Background\n\nDavid has been a software engineer for 10 years and a Christian for 15. He leads the FaithTech Sydney community while working as a senior developer at a fintech startup.\n\n## Why FaithTech?\n\n"I wanted to use my tech skills for more than just building another startup," David shares. "When I discovered FaithTech, I found a community that shared my passion for using technology to advance God''s kingdom."\n\n## Vision for Sydney\n\nUnder David''s leadership, FaithTech Sydney has grown from 5 members to over 80 in just two years. His vision includes:\n\n- Monthly meetups for learning and fellowship\n- Annual CREATE hackathon\n- Mentorship programs for young developers\n- Partnerships with local churches for tech projects\n\n## Get Connected\n\nInterested in getting involved? Reach out to David at our next meetup!',
    'meet-david-chen-sydney-lead',
    'Get to know David Chen, the passionate leader behind FaithTech Sydney and his vision for tech-enabled ministry.',
    now() - interval '5 days',
    false,
    NULL,
    now() - interval '5 days',
    now() - interval '5 days'
  ),
  -- Melbourne featured post (published)
  (
    'b3333331-3333-3333-3333-333333333333',
    'c3333333-3333-3333-3333-333333333333',
    '5 Ways to Use Tech to Grow Your Small Group',
    E'# Tech for Small Groups: A Practical Guide\n\nSmall groups are the heart of many churches, but organizing them can be challenging. Here''s how technology can help.\n\n## 1. Communication Platforms\n\nDitch the endless email chains. Use:\n- Slack or Discord for ongoing discussions\n- WhatsApp for quick updates\n- Zoom for virtual meetings\n\n## 2. Study Resources\n\nEnhance your Bible studies with:\n- YouVersion Bible app for shared reading plans\n- BibleProject videos for context\n- Logos or Accordance for deep dives\n\n## 3. Scheduling Tools\n\nCoordinate meetings without the back-and-forth:\n- Doodle for finding meeting times\n- Google Calendar for reminders\n- SignUpGenius for meal trains and service projects\n\n## 4. Prayer Tools\n\nMake prayer more accessible:\n- Shared prayer request documents\n- Reminder apps for prayer commitments\n- Voice note apps for longer prayer sharing\n\n## 5. Content Management\n\nKeep everything organized:\n- Notion for shared notes and resources\n- Google Drive for documents and videos\n- Airtable for tracking members and needs\n\n## Start Simple\n\nYou don''t need all these tools at once. Pick one or two that solve your biggest pain points, and grow from there.',
    'tech-for-small-groups',
    'Practical ways to use technology to enhance your small group ministry, from communication to Bible study.',
    now() - interval '15 days',
    true, -- Featured post
    NULL,
    now() - interval '15 days',
    now() - interval '12 days'
  ),
  -- Melbourne draft post (unpublished)
  (
    'b3333332-3333-3333-3333-333333333333',
    'c3333333-3333-3333-3333-333333333333',
    'Upcoming: Tech Sabbath Workshop - Finding Rest in a Digital Age',
    E'# Tech Sabbath Workshop - Coming Soon\n\nJoin us for a special workshop on practicing digital rest and healthy technology boundaries.\n\n## Workshop Details\n\n**Date:** TBD\n**Time:** TBD\n**Location:** TBD\n\n## What We''ll Cover\n\n- Biblical foundations for Sabbath rest\n- Practical strategies for digital detox\n- Setting healthy boundaries with devices\n- Creating tech-free family time\n- Mindful technology use\n\n## Why This Matters\n\nIn our always-connected world, we need to intentionally create space for rest and reflection. This workshop will help you develop practices that honor both the gift of technology and the gift of rest.\n\n## Registration\n\nMore details coming soon! Stay tuned for registration information.',
    'tech-sabbath-workshop',
    'Join our upcoming workshop on digital rest and healthy technology boundaries. Learn to find balance in an always-connected world.',
    NULL, -- Draft (not published)
    false,
    NULL,
    now() - interval '2 days',
    now() - interval '1 day'
  );

-- =============================================================================
-- PROJECT MEMBERS (Test team members for projects)
-- =============================================================================

-- Note: Uncomment after creating test users and updating UUIDs
/*
INSERT INTO project_members (project_id, user_id, role, created_at)
VALUES
  -- Prayer Connect team (Adelaide)
  ('p1111111-1111-1111-1111-111111111111', 'REPLACE-WITH-ADELAIDE-ADMIN-UUID', 'lead', now() - interval '45 days'),
  ('p1111111-1111-1111-1111-111111111111', 'REPLACE-WITH-MEMBER-UUID', 'contributor', now() - interval '45 days'),

  -- Scripture Memory Game team (Adelaide)
  ('p1111112-1111-1111-1111-111111111111', 'REPLACE-WITH-MEMBER-UUID', 'lead', now() - interval '30 days'),

  -- Sermon Notes AI team (Sydney)
  ('p2222221-2222-2222-2222-222222222222', 'REPLACE-WITH-SYDNEY-ADMIN-UUID', 'lead', now() - interval '60 days'),
  ('p2222221-2222-2222-2222-222222222222', 'REPLACE-WITH-SUPER-ADMIN-UUID', 'contributor', now() - interval '60 days'),

  -- Church Volunteer Scheduler team (Sydney)
  ('p2222222-2222-2222-2222-222222222222', 'REPLACE-WITH-SYDNEY-ADMIN-UUID', 'lead', now() - interval '20 days'),

  -- Bible Study Companion team (Melbourne)
  ('p3333331-3333-3333-3333-333333333333', 'REPLACE-WITH-SUPER-ADMIN-UUID', 'lead', now() - interval '90 days'),

  -- Faith & Finance Tracker (Melbourne - solo project, no team members)
  ('p3333332-3333-3333-3333-333333333333', 'REPLACE-WITH-SUPER-ADMIN-UUID', 'lead', now() - interval '15 days');
*/

-- =============================================================================
-- VERIFICATION QUERIES
-- =============================================================================

-- Run these queries to verify seed data loaded correctly:

-- Check cities
-- SELECT * FROM cities ORDER BY name;

-- Check profiles (after uncommenting and adding real UUIDs)
-- SELECT * FROM profiles;

-- Check user-city-roles (after uncommenting and adding real UUIDs)
-- SELECT
--   ucr.*,
--   c.name as city_name,
--   p.display_name as user_name
-- FROM user_city_roles ucr
-- JOIN cities c ON c.id = ucr.city_id
-- JOIN profiles p ON p.id = ucr.user_id
-- ORDER BY ucr.role DESC, c.name;

-- Check groups
-- SELECT
--   g.*,
--   c.name as city_name
-- FROM groups g
-- JOIN cities c ON c.id = g.city_id
-- ORDER BY c.name, g.name;

-- Check events
-- SELECT
--   e.*,
--   c.name as city_name
-- FROM events e
-- JOIN cities c ON c.id = e.city_id
-- ORDER BY e.starts_at DESC;

-- Check event RSVPs
-- SELECT
--   er.*,
--   e.title as event_title,
--   p.display_name as user_name
-- FROM event_rsvps er
-- JOIN events e ON e.id = er.event_id
-- JOIN profiles p ON p.id = er.user_id
-- ORDER BY e.title, er.status;

-- Check projects
-- SELECT
--   pr.*,
--   c.name as city_name
-- FROM projects pr
-- JOIN cities c ON c.id = pr.city_id
-- ORDER BY pr.is_featured DESC, c.name, pr.created_at DESC;

-- Check project members (after uncommenting and adding real UUIDs)
-- SELECT
--   pm.*,
--   pr.title as project_title,
--   p.display_name as user_name
-- FROM project_members pm
-- JOIN projects pr ON pr.id = pm.project_id
-- JOIN profiles p ON p.id = pm.user_id
-- ORDER BY pr.title, pm.role;

-- =============================================================================
-- NOTES FOR TESTING RLS POLICIES
-- =============================================================================

-- To test RLS policies in Supabase Studio SQL Editor:
--
-- 1. Set role to authenticated user:
-- SET ROLE authenticated;
-- SET request.jwt.claims.sub TO 'user-uuid-here';
--
-- 2. Set city context:
-- SELECT set_city_context('c1111111-1111-1111-1111-111111111111'); -- Adelaide
--
-- 3. Test queries (should only return Adelaide data):
-- SELECT * FROM cities;
-- SELECT * FROM groups;
--
-- 4. Switch to Sydney user and verify isolation:
-- SET request.jwt.claims.sub TO 'sydney-user-uuid';
-- SELECT set_city_context('c2222222-2222-2222-2222-222222222222'); -- Sydney
-- SELECT * FROM groups; -- Should only see Sydney groups
--
-- 5. Reset to superuser:
-- RESET ROLE;
