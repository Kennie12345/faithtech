#!/usr/bin/env tsx
/**
 * Check Supabase Database State
 *
 * Comprehensive check of all tables and their data
 * Run with: npx tsx scripts/check-database.ts
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

async function checkDatabase() {
  console.log('🔍 Checking Supabase Database State\n')
  console.log('=' .repeat(60))

  // Check cities
  console.log('\n📍 CITIES:')
  const { data: cities, error: citiesError } = await supabase
    .from('cities')
    .select('id, slug, name, hero_image_url, accent_color, is_active')
    .order('name')

  if (citiesError) {
    console.error('❌ Error:', citiesError.message)
  } else {
    console.log(`   Total: ${cities?.length || 0}`)
    cities?.forEach(city => {
      const imageStatus = city.hero_image_url ? '✅ HAS IMAGE' : '❌ NO IMAGE'
      console.log(`   ${imageStatus} ${city.name} (${city.slug})`)
      if (city.hero_image_url) {
        console.log(`      ${city.hero_image_url.substring(0, 60)}...`)
      }
      console.log(`      Color: ${city.accent_color}, Active: ${city.is_active}`)
    })
  }

  // Check events
  console.log('\n📅 EVENTS:')
  const { data: events, error: eventsError } = await supabase
    .from('events')
    .select('id, title, city_id, is_featured, starts_at')
    .order('starts_at', { ascending: false })
    .limit(5)

  if (eventsError) {
    console.error('❌ Error:', eventsError.message)
  } else {
    console.log(`   Total (last 5): ${events?.length || 0}`)
    events?.forEach(event => {
      console.log(`   ${event.is_featured ? '⭐' : '  '} ${event.title}`)
    })
  }

  // Check projects
  console.log('\n🚀 PROJECTS:')
  const { data: projects, error: projectsError } = await supabase
    .from('projects')
    .select('id, title, city_id, is_featured, image_url')
    .order('created_at', { ascending: false })
    .limit(5)

  if (projectsError) {
    console.error('❌ Error:', projectsError.message)
  } else {
    console.log(`   Total (last 5): ${projects?.length || 0}`)
    projects?.forEach(project => {
      const imageStatus = project.image_url ? '🖼️' : '  '
      console.log(`   ${project.is_featured ? '⭐' : '  '} ${imageStatus} ${project.title}`)
    })
  }

  // Check blog posts
  console.log('\n📝 BLOG POSTS:')
  const { data: posts, error: postsError } = await supabase
    .from('posts')
    .select('id, title, city_id, is_featured, published_at, featured_image_url')
    .order('published_at', { ascending: false, nullsFirst: false })
    .limit(5)

  if (postsError) {
    console.error('❌ Error:', postsError.message)
  } else {
    console.log(`   Total (last 5): ${posts?.length || 0}`)
    posts?.forEach(post => {
      const imageStatus = post.featured_image_url ? '🖼️' : '  '
      const published = post.published_at ? '✅' : '📝 Draft'
      console.log(`   ${post.is_featured ? '⭐' : '  '} ${imageStatus} ${post.title} (${published})`)
    })
  }

  // Check profiles
  console.log('\n👤 PROFILES:')
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, display_name, created_at')
    .order('created_at', { ascending: false })
    .limit(5)

  if (profilesError) {
    console.error('❌ Error:', profilesError.message)
  } else {
    console.log(`   Total (last 5): ${profiles?.length || 0}`)
    profiles?.forEach(profile => {
      console.log(`   👤 ${profile.display_name || 'No name'}`)
    })
  }

  // Check groups
  console.log('\n👥 GROUPS:')
  const { data: groups, error: groupsError } = await supabase
    .from('groups')
    .select('id, name, city_id, is_public')
    .order('created_at', { ascending: false })
    .limit(5)

  if (groupsError) {
    console.error('❌ Error:', groupsError.message)
  } else {
    console.log(`   Total (last 5): ${groups?.length || 0}`)
    groups?.forEach(group => {
      console.log(`   ${group.is_public ? '🌍' : '🔒'} ${group.name}`)
    })
  }

  console.log('\n' + '=' .repeat(60))
  console.log('✅ Database check complete!\n')
}

checkDatabase().catch(console.error)
