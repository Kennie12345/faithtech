#!/usr/bin/env tsx
/**
 * Seed Projects with Images
 *
 * Run with: npx tsx scripts/seed-projects.ts
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
  'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80', // Website design
]

async function seedProjects() {
  console.log('🚀 Seeding projects with images...\n')

  // Get city IDs
  const { data: cities } = await supabase.from('cities').select('id, name, slug')
  if (!cities || cities.length === 0) {
    console.error('❌ No cities found')
    process.exit(1)
  }

  const adelaide = cities.find(c => c.slug === 'adelaide')!
  const sydney = cities.find(c => c.slug === 'sydney')!
  const melbourne = cities.find(c => c.slug === 'melbourne')!

  const projects = [
    {
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
    const { error } = await supabase.from('projects').insert(project)
    if (error) console.error(`  ❌ ${project.title}:`, error.message)
    else console.log(`  ✅ ${project.title}\n     Image: ${project.image_url}`)
  }

  console.log('\n✅ Projects seeded successfully!')
}

seedProjects().catch(console.error)
