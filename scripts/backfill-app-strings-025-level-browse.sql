-- Standalone backfill (same as migrations/025_app_strings_level_browse_filters.sql).
-- Run in Supabase SQL Editor after 020_app_strings exists, or alongside `supabase db push`.

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

-- Verify (optional):
-- SELECT string_key, category, en, fr, max_chars
-- FROM public.app_strings
-- WHERE string_key IN (
--   'gamify.level',
--   'gamify.level_with_number',
--   'browse.filter_all',
--   'browse.filter_level'
-- )
-- ORDER BY string_key;
