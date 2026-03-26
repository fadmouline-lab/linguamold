-- LinguaMold: ui_strings
CREATE TABLE IF NOT EXISTS public.ui_strings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  string_key VARCHAR(200) NOT NULL,
  language_id UUID NOT NULL REFERENCES public.languages(id) ON DELETE CASCADE,
  value TEXT NOT NULL,
  context_note TEXT,
  UNIQUE(string_key, language_id)
);

CREATE INDEX IF NOT EXISTS idx_ui_strings_lang ON public.ui_strings(language_id, string_key);
