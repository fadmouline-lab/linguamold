-- Migration 025: Backfill app_strings for level labels + browse filter chips.
-- Pairs with client keys: gamify.level, gamify.level_with_number, browse.filter_all, browse.filter_level.
-- Safe to re-run (upserts by string_key).

INSERT INTO public.app_strings (string_key, category, en, fr, context_note, max_chars) VALUES
(
  'gamify.level',
  'gamification',
  'Level',
  'Niveau',
  'Profile stat label — short word for level tier',
  20
),
(
  'gamify.level_with_number',
  'gamification',
  'Level {{level}}',
  'Niveau {{level}}',
  'Profile header badge — {{level}} = numeric level from XP',
  25
),
(
  'browse.filter_all',
  'navigation',
  'All',
  'Tous',
  'Browse screen: show all difficulty tiers',
  12
),
(
  'browse.filter_level',
  'navigation',
  'Lv {{n}}',
  'Nv {{n}}',
  'Browse filter chip — {{n}} = difficulty tier 0–3 (abbrev. niveau in FR)',
  15
)
ON CONFLICT (string_key) DO UPDATE SET
  category     = EXCLUDED.category,
  en           = EXCLUDED.en,
  fr           = EXCLUDED.fr,
  context_note = EXCLUDED.context_note,
  max_chars    = EXCLUDED.max_chars,
  updated_at   = NOW();
