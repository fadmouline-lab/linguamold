-- LinguaMold: lessons
CREATE TABLE IF NOT EXISTS public.lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
  slug VARCHAR(100) NOT NULL,
  title_al VARCHAR(255) NOT NULL,
  display_order INT NOT NULL,
  lesson_type VARCHAR(30) DEFAULT 'standard',
  xp_reward INT DEFAULT 10,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(module_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_lessons_module ON public.lessons(module_id, display_order);
CREATE INDEX IF NOT EXISTS idx_lessons_published ON public.lessons(is_published);
CREATE INDEX IF NOT EXISTS idx_lessons_type ON public.lessons(lesson_type);
