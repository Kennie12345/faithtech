#!/usr/bin/env tsx
/**
 * Seed Test Data with Images
 *
 * Seeds events, projects, blog posts, and groups with stock images
 * Run with: npx tsx scripts/seed-test-data.ts
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Stock images for tech/faith projects
const projectImages = [
  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80', // Analytics dashboard
  'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800&q=80', // Mobile app development
  'https://images.unsplash.com/photo-1522542550221-31fd19575a2d?w=800&q=80', // People collaborating
  'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&q=80', // Team working
  'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80', // Website design
  'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80', // Office collaboration
]

// Stock images for blog posts
const blogImages = [
  'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&q=80', // Writing/blogging
  'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=800&q=80', // Technology
  'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&q=80', // Team meeting
  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80', // Prayer/contemplation
  'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&q=80', // Community
  'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&q=80', // Workspace
]

async function seedTestData() {
  console.log('🌱 Seeding test data with images...\n')

  // Get city IDs
  const { data: cities } = await supabase.from('cities').select('id, name, slug')
  if (!cities || cities.length === 0) {
    console.error('❌ No cities found. Run seed-cities.ts first!')
    process.exit(1)
  }

  const adelaide = cities.find(c => c.slug === 'adelaide')
  const sydney = cities.find(c => c.slug === 'sydney')
  const melbourne = cities.find(c => c.slug === 'melbourne')
  const brisbane = cities.find(c => c.slug === 'brisbane')

  if (!adelaide || !sydney || !melbourne) {
    console.error('❌ Missing required cities')
    process.exit(1)
  }

  // 1. SEED GROUPS
  console.log('👥 Seeding groups...')
  const groups = [
    {
      id: 'g1111111-1111-1111-1111-111111111111',
      city_id: adelaide.id,
      name: 'Web Developers',
      description: 'Frontend and backend web developers building for the kingdom',
      is_public: true,
    },
    {
      id: 'g1111112-1111-1111-1111-111111111111',
      city_id: adelaide.id,
      name: 'Prayer Team',
      description: 'Committed to praying for FaithTech Adelaide and tech workers',
      is_public: true,
    },
    {
      id: 'g2222221-2222-2222-2222-222222222222',
      city_id: sydney.id,
      name: 'Mobile Developers',
      description: 'iOS and Android developers serving the Sydney community',
      is_public: true,
    },
    {
      id: 'g3333331-3333-3333-3333-333333333333',
      city_id: melbourne.id,
      name: 'Data Scientists',
      description: 'Using data science and AI for social good in Melbourne',
      is_public: true,
    },
  ]

  for (const group of groups) {
    const { error } = await supabase.from('groups').upsert(group, { onConflict: 'id' })
    if (error) console.error(`  ❌ ${group.name}:`, error.message)
    else console.log(`  ✅ ${group.name}`)
  }

  // 2. SEED EVENTS
  console.log('\n📅 Seeding events...')
  const now = new Date()
  const events = [
    {
      id: 'e1111111-1111-1111-1111-111111111111',
      city_id: adelaide.id,
      title: 'Community Meetup',
      description: "Join us for our monthly community meetup!\n\nWe'll be discussing how technology can serve the kingdom, sharing testimonies, and connecting with other tech workers in Adelaide.\n\nBring a friend! Light refreshments provided.",
      slug: 'community-meetup',
      starts_at: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      ends_at: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
      location_name: "St Paul's Church",
      location_address: '123 Main Street, Adelaide SA 5000',
      max_attendees: 50,
      is_featured: true,
    },
    {
      id: 'e1111112-1111-1111-1111-111111111111',
      city_id: adelaide.id,
      title: 'Web Development Workshop',
      description: "Learn modern web development with React and Next.js!\n\nThis hands-on workshop is perfect for beginners and intermediate developers looking to level up their skills.\n\nBring your laptop.",
      slug: 'web-dev-workshop',
      starts_at: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      ends_at: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000).toISOString(),
      location_name: 'TechHub Adelaide',
      location_address: '456 Tech St, Adelaide SA 5000',
      max_attendees: 25,
      is_featured: true,
    },
    {
      id: 'e2222221-2222-2222-2222-222222222222',
      city_id: sydney.id,
      title: 'Prayer & Worship Night',
      description: "Join us for an evening of prayer and worship focused on tech workers in Sydney.\n\nWe'll pray for breakthrough in the tech industry and for God's kingdom to advance through technology.",
      slug: 'prayer-worship-night',
      starts_at: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString(),
      ends_at: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
      location_name: 'Hillsong City Campus',
      location_address: '789 George St, Sydney NSW 2000',
      max_attendees: null,
      is_featured: true,
    },
  ]

  for (const event of events) {
    const { error } = await supabase.from('events').upsert(event, { onConflict: 'id' })
    if (error) console.error(`  ❌ ${event.title}:`, error.message)
    else console.log(`  ✅ ${event.title}`)
  }

  // 3. SEED PROJECTS (with images!)
  console.log('\n🚀 Seeding projects with images...')
  const projects = [
    {
      id: 'p1111111-1111-1111-1111-111111111111',
      city_id: adelaide.id,
      title: 'Prayer Connect',
      description: "A mobile app that helps Christians discover and share prayer requests in their local community.\n\nBuilt during FaithTech CREATE Adelaide 2024, this app connects believers to pray for one another in real-time.",
      slug: 'prayer-connect',
      problem_statement: "Many Christians struggle to stay connected to their community's prayer needs. Prayer requests often get lost in group chats or forgotten after Sunday services.",
      solution: 'Prayer Connect provides a centralized platform where church members can post, discover, and pray for requests in real-time. Users can mark requests as "prayed for" and receive notifications when someone prays for their request.',
      github_url: 'https://github.com/faithtech-adelaide/prayer-connect',
      demo_url: 'https://prayer-connect.faithtech.au',
      image_url: projectImages[0],
      is_featured: true,
    },
    {
      id: 'p1111112-1111-1111-1111-111111111111',
      city_id: adelaide.id,
      title: 'Scripture Memory Game',
      description: "An interactive web game to help kids and adults memorize Bible verses through gamification.\n\nFeatures include: daily challenges, progress tracking, and social sharing.",
      slug: 'scripture-memory-game',
      problem_statement: 'Many people want to memorize Scripture but find traditional methods boring or hard to stick with long-term.',
      solution: 'We gamified Scripture memorization with daily challenges, streaks, achievements, and friendly competition. Users earn points by correctly reciting verses and can challenge friends.',
      github_url: 'https://github.com/faithtech-adelaide/scripture-game',
      demo_url: 'https://scripturegame.app',
      image_url: projectImages[1],
      is_featured: false,
    },
    {
      id: 'p2222221-2222-2222-2222-222222222222',
      city_id: sydney.id,
      title: 'Sermon Notes AI',
      description: "AI-powered sermon note-taking app that automatically generates summaries and action items from sermon audio.\n\nWinner of CREATE Sydney 2024!",
      slug: 'sermon-notes-ai',
      problem_statement: "It's hard to take good notes during sermons while actively listening. Many people forget key points by the time they get home.",
      solution: 'Using speech-to-text and GPT-4, our app automatically transcribes sermons and generates concise summaries, key takeaways, and suggested action items. Users can review and share notes with their small group.',
      github_url: 'https://github.com/faithtech-sydney/sermon-notes-ai',
      demo_url: 'https://sermonnotes.ai',
      image_url: projectImages[2],
      is_featured: true,
    },
    {
      id: 'p3333331-3333-3333-3333-333333333333',
      city_id: melbourne.id,
      title: 'Bible Study Companion',
      description: "An interactive Bible study tool with AI-powered insights, cross-references, and discussion questions.\n\nHelping small groups go deeper in God's Word.",
      slug: 'bible-study-companion',
      problem_statement: "Small group leaders spend hours preparing Bible study materials, and it's hard to find quality questions and cross-references quickly.",
      solution: 'Our app analyzes any Bible passage and generates contextual insights, historical background, cross-references, and discussion questions. Leaders can customize and export study guides in minutes.',
      github_url: 'https://github.com/faithtech-melbourne/bible-study-companion',
      demo_url: 'https://biblestudycompanion.com',
      image_url: projectImages[3],
      is_featured: true,
    },
  ]

  for (const project of projects) {
    const { error } = await supabase.from('projects').upsert(project, { onConflict: 'id' })
    if (error) console.error(`  ❌ ${project.title}:`, error.message)
    else console.log(`  ✅ ${project.title} (image: ${project.image_url?.substring(0, 50)}...)`)
  }

  // 4. SEED BLOG POSTS (with featured images!)
  console.log('\n📝 Seeding blog posts with images...')
  const posts = [
    {
      id: 'b1111111-1111-1111-1111-111111111111',
      city_id: adelaide.id,
      title: 'Introducing FaithTech Adelaide: Building Tech for Good',
      content: "# Welcome to FaithTech Adelaide!\n\nWe're excited to announce the launch of FaithTech Adelaide, a community of Christian technologists, designers, and innovators passionate about using technology for the glory of God.\n\n## Our Vision\n\nAt FaithTech Adelaide, we believe that technology is a gift from God that can be used to advance His kingdom. We're committed to:\n\n- Building tech-for-good projects that serve our community\n- Running CREATE hackathons where ideas become reality\n- Mentoring the next generation of Christian technologists\n- Fostering a community of faith and innovation\n\n## Get Involved\n\nWhether you're a developer, designer, product manager, or just tech-curious, there's a place for you at FaithTech Adelaide. Join us for our monthly meetups, participate in CREATE hackathons, or contribute to one of our community projects.\n\nTogether, let's use our skills to make a difference in Adelaide and beyond!",
      slug: 'introducing-faithtech-adelaide',
      excerpt: "We're excited to announce the launch of FaithTech Adelaide, a community of Christian technologists passionate about using technology for the glory of God.",
      published_at: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      is_featured: true,
      featured_image_url: blogImages[0],
    },
    {
      id: 'b1111112-1111-1111-1111-111111111111',
      city_id: adelaide.id,
      title: 'CREATE Adelaide 2024 Recap: 10 Projects Built in 48 Hours',
      content: "# CREATE Adelaide 2024: A Weekend of Innovation\n\nWhat happens when you gather 50 Christian technologists in a room for 48 hours? Magic.\n\n## The Projects\n\nOur first CREATE hackathon in Adelaide produced 10 incredible projects:\n\n1. **Prayer Connect** - A mobile app for community prayer requests (Winner!)\n2. **Scripture Memory Game** - Gamified Bible verse memorization\n3. **Church Admin Portal** - Streamlined church management\n4. **Mission Trip Planner** - Coordination tool for mission teams\n5. **Youth Event Platform** - Social network for church youth groups\n\n## Highlights\n\n- 50+ participants from 15 different churches\n- 10 working prototypes built\n- 3 projects launching publicly this quarter\n- Countless new friendships formed\n\n## What's Next?\n\nCREATE Adelaide 2025 is already in the works. Stay tuned for dates and registration details!",
      slug: 'create-adelaide-2024-recap',
      excerpt: 'What happens when you gather 50 Christian technologists for 48 hours? See what we built at CREATE Adelaide 2024.',
      published_at: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      is_featured: false,
      featured_image_url: blogImages[1],
    },
    {
      id: 'b2222221-2222-2222-2222-222222222222',
      city_id: sydney.id,
      title: 'How AI is Transforming Ministry: Lessons from Sydney',
      content: "# AI in Ministry: Opportunity or Threat?\n\nArtificial Intelligence is no longer science fiction—it's here, and it's changing how we do ministry.\n\n## Real-World Applications\n\nAt FaithTech Sydney, we've been exploring how AI can enhance (not replace) ministry:\n\n### Sermon Preparation\n- AI-assisted research and cross-referencing\n- Quick generation of discussion questions\n- Automatic transcription and summarization\n\n### Community Care\n- Chatbots for basic prayer requests\n- Automated follow-up reminders\n- Translation services for multicultural churches\n\n### Administration\n- Smart scheduling for volunteers\n- Data-driven insights for church health\n- Automated report generation\n\n## Ethical Considerations\n\nBut with great power comes great responsibility. We must ask:\n- Does this technology honor God?\n- Does it enhance or replace human connection?\n- Are we being good stewards of this tool?\n\n## Join the Conversation\n\nCome to our next meetup where we'll discuss AI ethics in ministry. All perspectives welcome!",
      slug: 'ai-transforming-ministry-sydney',
      excerpt: 'Exploring how Artificial Intelligence is changing ministry, and what it means for churches in Sydney.',
      published_at: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000).toISOString(),
      is_featured: true,
      featured_image_url: blogImages[2],
    },
    {
      id: 'b3333331-3333-3333-3333-333333333333',
      city_id: melbourne.id,
      title: '5 Ways to Use Tech to Grow Your Small Group',
      content: "# Tech for Small Groups: A Practical Guide\n\nSmall groups are the heart of many churches, but organizing them can be challenging. Here's how technology can help.\n\n## 1. Communication Platforms\n\nDitch the endless email chains. Use:\n- Slack or Discord for ongoing discussions\n- WhatsApp for quick updates\n- Zoom for virtual meetings\n\n## 2. Study Resources\n\nEnhance your Bible studies with:\n- YouVersion Bible app for shared reading plans\n- BibleProject videos for context\n- Logos or Accordance for deep dives\n\n## 3. Scheduling Tools\n\nCoordinate meetings without the back-and-forth:\n- Doodle for finding meeting times\n- Google Calendar for reminders\n- SignUpGenius for meal trains and service projects\n\n## 4. Prayer Tools\n\nMake prayer more accessible:\n- Shared prayer request documents\n- Reminder apps for prayer commitments\n- Voice note apps for longer prayer sharing\n\n## 5. Content Management\n\nKeep everything organized:\n- Notion for shared notes and resources\n- Google Drive for documents and videos\n- Airtable for tracking members and needs\n\n## Start Simple\n\nYou don't need all these tools at once. Pick one or two that solve your biggest pain points, and grow from there.",
      slug: 'tech-for-small-groups',
      excerpt: 'Practical ways to use technology to enhance your small group ministry, from communication to Bible study.',
      published_at: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      is_featured: true,
      featured_image_url: blogImages[3],
    },
  ]

  for (const post of posts) {
    const { error } = await supabase.from('posts').upsert(post, { onConflict: 'id' })
    if (error) console.error(`  ❌ ${post.title}:`, error.message)
    else console.log(`  ✅ ${post.title} (image: ${post.featured_image_url?.substring(0, 50)}...)`)
  }

  console.log('\n✨ Verifying seed data...\n')

  // Verify counts
  const { data: eventCount } = await supabase.from('events').select('id', { count: 'exact', head: true })
  const { data: projectCount } = await supabase.from('projects').select('id', { count: 'exact', head: true })
  const { data: postCount } = await supabase.from('posts').select('id', { count: 'exact', head: true })
  const { data: groupCount } = await supabase.from('groups').select('id', { count: 'exact', head: true })

  console.log(`✅ Events: ${events.length} seeded`)
  console.log(`✅ Projects: ${projects.length} seeded (all with images)`)
  console.log(`✅ Blog Posts: ${posts.length} seeded (all with images)`)
  console.log(`✅ Groups: ${groups.length} seeded`)

  console.log('\n🎉 Test data seeding complete!')
}

seedTestData().catch(console.error)
