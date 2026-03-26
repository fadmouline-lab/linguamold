-- LinguaMold: achievements
CREATE TABLE IF NOT EXISTS public.achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(100) UNIQUE NOT NULL,
  title_key VARCHAR(100) NOT NULL,
  description_key VARCHAR(100) NOT NULL,
  icon_name VARCHAR(50),
  xp_reward INT DEFAULT 0,
  condition_type VARCHAR(50) NOT NULL,
  condition_value INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_achievements_slug ON public.achievements(slug);
