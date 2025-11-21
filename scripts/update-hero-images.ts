#!/usr/bin/env tsx
/**
 * Update City Hero Images
 *
 * This script updates all cities in the database with Unsplash hero images.
 * Run with: npx tsx scripts/update-hero-images.ts
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

const cityImages = {
  'adelaide': 'https://images.unsplash.com/photo-1600011689032-8b628b8a8747?w=1200&q=80',
  'sydney': 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=1200&q=80',
  'melbourne': 'https://images.unsplash.com/photo-1514395462725-fb4566210144?w=1200&q=80',
  'brisbane': 'https://images.unsplash.com/photo-1523428096881-5f0a4d302a0e?w=1200&q=80',
}

async function updateHeroImages() {
  console.log('🔍 Checking current cities...\n')

  // First, fetch all cities
  const { data: cities, error: fetchError } = await supabase
    .from('cities')
    .select('slug, name, hero_image_url')
    .order('name')

  if (fetchError) {
    console.error('❌ Error fetching cities:', fetchError)
    process.exit(1)
  }

  if (!cities || cities.length === 0) {
    console.log('⚠️  No cities found in database')
    process.exit(0)
  }

  console.log('Current state:')
  cities.forEach(city => {
    console.log(`  ${city.name} (${city.slug}): ${city.hero_image_url || 'NULL'}`)
  })

  console.log('\n📝 Updating hero images...\n')

  // Update each city
  for (const [slug, imageUrl] of Object.entries(cityImages)) {
    const { data, error } = await supabase
      .from('cities')
      .update({ hero_image_url: imageUrl })
      .eq('slug', slug)
      .select()

    if (error) {
      console.error(`❌ Error updating ${slug}:`, error)
    } else if (data && data.length > 0) {
      console.log(`✅ Updated ${data[0].name}: ${imageUrl.substring(0, 50)}...`)
    } else {
      console.log(`⚠️  City not found: ${slug}`)
    }
  }

  console.log('\n✨ Verifying updates...\n')

  // Verify updates
  const { data: updatedCities, error: verifyError } = await supabase
    .from('cities')
    .select('slug, name, hero_image_url')
    .order('name')

  if (verifyError) {
    console.error('❌ Error verifying updates:', verifyError)
    process.exit(1)
  }

  console.log('Final state:')
  updatedCities?.forEach(city => {
    const status = city.hero_image_url ? '✅' : '❌'
    console.log(`  ${status} ${city.name} (${city.slug}): ${city.hero_image_url ? 'HAS IMAGE' : 'NULL'}`)
  })

  console.log('\n🎉 Done!')
}

updateHeroImages().catch(console.error)
