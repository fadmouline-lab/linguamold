-- LinguaMold: exercises (mold instances)
CREATE TABLE IF NOT EXISTS public.exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  mold_type VARCHAR(50) NOT NULL,
  display_order INT NOT NULL,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  difficulty INT DEFAULT 1,
  xp_value INT DEFAULT 5,
  tags TEXT[],
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_exercises_lesson ON public.exercises(lesson_id, display_order);
CREATE INDEX IF NOT EXISTS idx_exercises_mold ON public.exercises(mold_type);
CREATE INDEX IF NOT EXISTS idx_exercises_published ON public.exercises(is_published);
CREATE INDEX IF NOT EXISTS idx_exercises_difficulty ON public.exercises(difficulty);
