-- LinguaMold: user_exercise_attempts
CREATE TABLE IF NOT EXISTS public.user_exercise_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,
  is_correct BOOLEAN NOT NULL,
  user_answer JSONB,
  time_spent_ms INT,
  xp_earned INT DEFAULT 0,
  attempted_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_attempts_user ON public.user_exercise_attempts(user_id, attempted_at DESC);
CREATE INDEX IF NOT EXISTS idx_attempts_exercise ON public.user_exercise_attempts(exercise_id);
