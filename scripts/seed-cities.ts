#!/usr/bin/env tsx
/**
 * Seed Cities with Hero Images
 *
 * This script inserts or updates all Australian cities with their hero images.
 * Run with: npx tsx scripts/seed-cities.ts
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

const cities = [
  {
    id: 'c1111111-1111-1111-1111-111111111111',
    name: 'Adelaide',
    slug: 'adelaide',
    logo_url: null,
    hero_image_url: 'https://images.unsplash.com/photo-1600011689032-8b628b8a8747?w=1200&q=80',
    accent_color: '#6366f1',
    is_active: true
  },
  {
    id: 'c2222222-2222-2222-2222-222222222222',
    name: 'Sydney',
    slug: 'sydney',
    logo_url: null,
    hero_image_url: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=1200&q=80',
    accent_color: '#8b5cf6',
    is_active: true
  },
  {
    id: 'c3333333-3333-3333-3333-333333333333',
    name: 'Melbourne',
    slug: 'melbourne',
    logo_url: null,
    hero_image_url: 'https://images.unsplash.com/photo-1514395462725-fb4566210144?w=1200&q=80',
    accent_color: '#ec4899',
    is_active: true
  },
  {
    id: 'c4444444-4444-4444-4444-444444444444',
    name: 'Brisbane',
    slug: 'brisbane',
    logo_url: null,
    hero_image_url: 'https://images.unsplash.com/photo-1523428096881-5f0a4d302a0e?w=1200&q=80',
    accent_color: '#14b8a6',
    is_active: true
  }
]

async function seedCities() {
  console.log('🌱 Seeding Australian cities...\n')

  for (const city of cities) {
    // Use upsert to handle both insert and update
    const { data, error } = await supabase
      .from('cities')
      .upsert(city, {
        onConflict: 'id',
        ignoreDuplicates: false
      })
      .select()

    if (error) {
      console.error(`❌ Error upserting ${city.name}:`, error.message)
    } else {
      console.log(`✅ ${city.name} (${city.slug})`)
      console.log(`   Hero image: ${city.hero_image_url}`)
    }
  }

  console.log('\n✨ Verifying...\n')

  // Verify
  const { data: allCities, error: fetchError } = await supabase
    .from('cities')
    .select('slug, name, hero_image_url, is_active')
    .order('name')

  if (fetchError) {
    console.error('❌ Error fetching cities:', fetchError)
    process.exit(1)
  }

  console.log(`Total cities: ${allCities?.length || 0}\n`)
  allCities?.forEach(city => {
    const status = city.hero_image_url ? '✅' : '❌'
    console.log(`${status} ${city.name} (${city.slug}): ${city.is_active ? 'Active' : 'Inactive'}`)
  })

  console.log('\n🎉 Done!')
}

seedCities().catch(console.error)
