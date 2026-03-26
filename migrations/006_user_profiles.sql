-- LinguaMold: user_profiles (extends auth.users)
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name VARCHAR(100),
  avatar_url TEXT,
  role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'superadmin')),
  preferred_al UUID REFERENCES public.languages(id),
  preferred_ll UUID REFERENCES public.languages(id),
  proficiency_level INT DEFAULT 0,
  daily_goal_minutes INT DEFAULT 10,
  notification_enabled BOOLEAN DEFAULT true,
  notification_time TIME DEFAULT '09:00',
  timezone VARCHAR(50) DEFAULT 'UTC',
  hearts INT DEFAULT 5,
  hearts_last_regen TIMESTAMPTZ DEFAULT NOW(),
  gems INT DEFAULT 0,
  total_xp INT DEFAULT 0,
  current_streak INT DEFAULT 0,
  longest_streak INT DEFAULT 0,
  last_activity_date DATE,
  streak_frozen_until DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON public.user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_al ON public.user_profiles(preferred_al);
CREATE INDEX IF NOT EXISTS idx_user_profiles_ll ON public.user_profiles(preferred_ll);
