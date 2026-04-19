-- Migration 020: Create app_strings table (column-per-language approach)
-- One row per string key. Each App Language (AL) gets its own column.
-- Adding a new AL = ALTER TABLE ADD COLUMN {code} TEXT + UPDATE backfill.
-- No joins, no language_id lookups, no pivots.

CREATE TABLE IF NOT EXISTS public.app_strings (
  id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Lookup key used in frontend: t('auth.login_title')
  string_key   VARCHAR(200) UNIQUE NOT NULL,

  -- Category for organization and bulk operations
  category     VARCHAR(50)  NOT NULL,
  -- auth | onboarding | navigation | lesson | mold | gamification |
  -- shop | profile | admin | error | empty | buttons | notifications | confirm

  -- English is the source/reference language (always filled)
  en           TEXT         NOT NULL,

  -- App Languages — one column per AL we support
  fr           TEXT,   -- French (MVP)
  fa           TEXT,   -- Farsi (next release)
  ar           TEXT,   -- Arabic
  ru           TEXT,   -- Russian
  tr           TEXT,   -- Turkish
  ur           TEXT,   -- Urdu
  sw           TEXT,   -- Swahili
  bn           TEXT,   -- Bengali

  -- Context for translators / LLMs generating translations
  context_note TEXT,

  -- Max character limit (helps keep translations compact)
  max_chars    INT,

  created_at   TIMESTAMPTZ  DEFAULT NOW(),
  updated_at   TIMESTAMPTZ  DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_app_strings_key      ON public.app_strings (string_key);
CREATE INDEX IF NOT EXISTS idx_app_strings_category ON public.app_strings (category);

-- RLS: everyone can read, only superadmins can write
ALTER TABLE public.app_strings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "app_strings_select" ON public.app_strings
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "app_strings_write" ON public.app_strings
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role = 'superadmin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role = 'superadmin'
    )
  );
