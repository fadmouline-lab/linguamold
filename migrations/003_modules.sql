-- LinguaMold: modules
CREATE TABLE IF NOT EXISTS public.modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  language_pair_id UUID NOT NULL REFERENCES public.language_pairs(id) ON DELETE CASCADE,
  slug VARCHAR(100) NOT NULL,
  title_al VARCHAR(255) NOT NULL,
  title_ll VARCHAR(255) NOT NULL,
  description_al TEXT,
  icon_name VARCHAR(50),
  color_hex VARCHAR(7),
  difficulty_level INT NOT NULL DEFAULT 0,
  display_order INT NOT NULL DEFAULT 0,
  is_published BOOLEAN DEFAULT false,
  xp_reward INT DEFAULT 50,
  estimated_minutes INT DEFAULT 15,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(language_pair_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_modules_pair ON public.modules(language_pair_id);
CREATE INDEX IF NOT EXISTS idx_modules_published ON public.modules(is_published);
CREATE INDEX IF NOT EXISTS idx_modules_display ON public.modules(language_pair_id, display_order);
