-- Migration 020: Seed Australian Cities
-- Inserts initial city data for Adelaide, Sydney, Melbourne, Brisbane
-- Dependencies: 002 (cities table)

-- Note: Using INSERT with ON CONFLICT to make this migration idempotent
-- Safe to run multiple times - won't create duplicates

INSERT INTO cities (id, name, slug, logo_url, hero_image_url, accent_color, is_active, created_at, updated_at)
VALUES
  -- Adelaide (FaithTech Australia HQ)
  (
    'c1111111-1111-1111-1111-111111111111',
    'Adelaide',
    'adelaide',
    NULL,
    'https://images.unsplash.com/photo-1600011689032-8b628b8a8747?w=1200&q=80', -- Adelaide city and hills
    '#6366f1', -- Indigo
    true,
    now(),
    now()
  ),
  -- Sydney (Largest city)
  (
    'c2222222-2222-2222-2222-222222222222',
    'Sydney',
    'sydney',
    NULL,
    'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=1200&q=80', -- Sydney Harbor Bridge
    '#8b5cf6', -- Purple
    true,
    now(),
    now()
  ),
  -- Melbourne (Tech hub)
  (
    'c3333333-3333-3333-3333-333333333333',
    'Melbourne',
    'melbourne',
    NULL,
    'https://images.unsplash.com/photo-1514395462725-fb4566210144?w=1200&q=80', -- Melbourne cityscape
    '#ec4899', -- Pink
    true,
    now(),
    now()
  ),
  -- Brisbane (Sunshine state)
  (
    'c4444444-4444-4444-4444-444444444444',
    'Brisbane',
    'brisbane',
    NULL,
    'https://images.unsplash.com/photo-1523428096881-5f0a4d302a0e?w=1200&q=80', -- Brisbane River and Story Bridge
    '#14b8a6', -- Teal
    true,
    now(),
    now()
  )
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  accent_color = EXCLUDED.accent_color,
  is_active = EXCLUDED.is_active,
  updated_at = now();

COMMENT ON TABLE cities IS 'FaithTech Australian cities seeded with Adelaide, Sydney, Melbourne, Brisbane';
