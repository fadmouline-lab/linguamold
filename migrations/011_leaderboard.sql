-- LinguaMold: leaderboard
CREATE TABLE IF NOT EXISTS public.leaderboard (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  language_pair_id UUID NOT NULL REFERENCES public.language_pairs(id) ON DELETE CASCADE,
  period_type VARCHAR(10) NOT NULL,
  period_start DATE NOT NULL,
  xp_earned INT DEFAULT 0,
  rank INT,
  UNIQUE(user_id, language_pair_id, period_type, period_start)
);

CREATE INDEX IF NOT EXISTS idx_leaderboard_rank ON public.leaderboard(language_pair_id, period_type, period_start, xp_earned DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_user ON public.leaderboard(user_id);
