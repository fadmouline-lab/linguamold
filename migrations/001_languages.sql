-- LinguaMold: languages
CREATE TABLE IF NOT EXISTS public.languages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(10) UNIQUE NOT NULL,
  name_native VARCHAR(100) NOT NULL,
  name_english VARCHAR(100) NOT NULL,
  direction VARCHAR(3) DEFAULT 'ltr' CHECK (direction IN ('ltr', 'rtl')),
  is_active BOOLEAN DEFAULT true,
  flag_emoji VARCHAR(10),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_languages_code ON public.languages(code);
CREATE INDEX IF NOT EXISTS idx_languages_active ON public.languages(is_active);

INSERT INTO public.languages (code, name_native, name_english, direction, is_active, flag_emoji)
VALUES
  ('fr', 'Français', 'French', 'ltr', true, '🇫🇷'),
  ('en', 'English', 'English', 'ltr', true, '🇬🇧')
ON CONFLICT (code) DO NOTHING;
