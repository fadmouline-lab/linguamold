-- LinguaMold: language_pairs + seed FR→EN
CREATE TABLE IF NOT EXISTS public.language_pairs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_language_id UUID NOT NULL REFERENCES public.languages(id) ON DELETE CASCADE,
  learning_language_id UUID NOT NULL REFERENCES public.languages(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT true,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(app_language_id, learning_language_id)
);

CREATE INDEX IF NOT EXISTS idx_language_pairs_app ON public.language_pairs(app_language_id);
CREATE INDEX IF NOT EXISTS idx_language_pairs_ll ON public.language_pairs(learning_language_id);
CREATE INDEX IF NOT EXISTS idx_language_pairs_active ON public.language_pairs(is_active);

INSERT INTO public.language_pairs (app_language_id, learning_language_id, is_active, display_order)
SELECT a.id, b.id, true, 0
FROM public.languages a
CROSS JOIN public.languages b
WHERE a.code = 'fr' AND b.code = 'en'
ON CONFLICT (app_language_id, learning_language_id) DO NOTHING;
