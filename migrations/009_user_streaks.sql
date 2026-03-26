-- LinguaMold: user_streaks
CREATE TABLE IF NOT EXISTS public.user_streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  streak_date DATE NOT NULL,
  xp_earned INT DEFAULT 0,
  minutes_practiced INT DEFAULT 0,
  exercises_completed INT DEFAULT 0,
  UNIQUE(user_id, streak_date)
);

CREATE INDEX IF NOT EXISTS idx_streaks_user_date ON public.user_streaks(user_id, streak_date DESC);
