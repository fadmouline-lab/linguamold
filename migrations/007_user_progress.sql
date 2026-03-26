-- LinguaMold: user_module_progress + user_lesson_progress
CREATE TABLE IF NOT EXISTS public.user_module_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  module_id UUID NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'locked',
  completion_pct DECIMAL(5,2) DEFAULT 0,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  best_score DECIMAL(5,2),
  UNIQUE(user_id, module_id)
);

CREATE INDEX IF NOT EXISTS idx_ump_user ON public.user_module_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_ump_module ON public.user_module_progress(module_id);
CREATE INDEX IF NOT EXISTS idx_ump_status ON public.user_module_progress(user_id, status);

CREATE TABLE IF NOT EXISTS public.user_lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'locked',
  score DECIMAL(5,2),
  attempts INT DEFAULT 0,
  best_score DECIMAL(5,2),
  stars INT DEFAULT 0,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  UNIQUE(user_id, lesson_id)
);

CREATE INDEX IF NOT EXISTS idx_ulp_user ON public.user_lesson_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_ulp_lesson ON public.user_lesson_progress(lesson_id);
CREATE INDEX IF NOT EXISTS idx_ulp_status ON public.user_lesson_progress(user_id, status);
