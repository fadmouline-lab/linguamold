-- LinguaMold: user_xp_log
CREATE TABLE IF NOT EXISTS public.user_xp_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  xp_amount INT NOT NULL,
  source VARCHAR(50) NOT NULL,
  reference_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_xp_log_user ON public.user_xp_log(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_xp_log_source ON public.user_xp_log(user_id, source);
