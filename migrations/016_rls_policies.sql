-- LinguaMold: Row Level Security (all tables)
-- Idempotent: drops policies by name before recreate

CREATE OR REPLACE FUNCTION public.is_superadmin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.id = auth.uid() AND up.role = 'superadmin'
  );
$$;

ALTER TABLE public.languages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.language_pairs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_module_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_exercise_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_xp_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ui_strings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_config ENABLE ROW LEVEL SECURITY;

-- languages
DROP POLICY IF EXISTS languages_select_authenticated ON public.languages;
CREATE POLICY languages_select_authenticated ON public.languages
  FOR SELECT TO authenticated USING (is_active = true OR public.is_superadmin());

DROP POLICY IF EXISTS languages_all_sa ON public.languages;
CREATE POLICY languages_all_sa ON public.languages
  FOR ALL TO authenticated USING (public.is_superadmin()) WITH CHECK (public.is_superadmin());

-- language_pairs
DROP POLICY IF EXISTS language_pairs_select ON public.language_pairs;
CREATE POLICY language_pairs_select ON public.language_pairs
  FOR SELECT TO authenticated USING (is_active = true OR public.is_superadmin());

DROP POLICY IF EXISTS language_pairs_all_sa ON public.language_pairs;
CREATE POLICY language_pairs_all_sa ON public.language_pairs
  FOR ALL TO authenticated USING (public.is_superadmin()) WITH CHECK (public.is_superadmin());

-- modules
DROP POLICY IF EXISTS modules_select_user ON public.modules;
CREATE POLICY modules_select_user ON public.modules
  FOR SELECT TO authenticated USING (
    public.is_superadmin() OR is_published = true
  );

DROP POLICY IF EXISTS modules_all_sa ON public.modules;
CREATE POLICY modules_all_sa ON public.modules
  FOR ALL TO authenticated USING (public.is_superadmin()) WITH CHECK (public.is_superadmin());

-- lessons
DROP POLICY IF EXISTS lessons_select_user ON public.lessons;
CREATE POLICY lessons_select_user ON public.lessons
  FOR SELECT TO authenticated USING (
    public.is_superadmin() OR is_published = true
  );

DROP POLICY IF EXISTS lessons_all_sa ON public.lessons;
CREATE POLICY lessons_all_sa ON public.lessons
  FOR ALL TO authenticated USING (public.is_superadmin()) WITH CHECK (public.is_superadmin());

-- exercises
DROP POLICY IF EXISTS exercises_select_user ON public.exercises;
CREATE POLICY exercises_select_user ON public.exercises
  FOR SELECT TO authenticated USING (
    public.is_superadmin() OR is_published = true
  );

DROP POLICY IF EXISTS exercises_all_sa ON public.exercises;
CREATE POLICY exercises_all_sa ON public.exercises
  FOR ALL TO authenticated USING (public.is_superadmin()) WITH CHECK (public.is_superadmin());

-- user_profiles
DROP POLICY IF EXISTS user_profiles_select_own ON public.user_profiles;
CREATE POLICY user_profiles_select_own ON public.user_profiles
  FOR SELECT TO authenticated USING (id = auth.uid() OR public.is_superadmin());

DROP POLICY IF EXISTS user_profiles_insert_own ON public.user_profiles;
CREATE POLICY user_profiles_insert_own ON public.user_profiles
  FOR INSERT TO authenticated WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS user_profiles_update_own ON public.user_profiles;
CREATE POLICY user_profiles_update_own ON public.user_profiles
  FOR UPDATE TO authenticated USING (id = auth.uid() OR public.is_superadmin())
  WITH CHECK (id = auth.uid() OR public.is_superadmin());

DROP POLICY IF EXISTS user_profiles_delete_sa ON public.user_profiles;
CREATE POLICY user_profiles_delete_sa ON public.user_profiles
  FOR DELETE TO authenticated USING (public.is_superadmin());

-- user_module_progress
DROP POLICY IF EXISTS ump_all_own ON public.user_module_progress;
CREATE POLICY ump_all_own ON public.user_module_progress
  FOR ALL TO authenticated USING (user_id = auth.uid() OR public.is_superadmin())
  WITH CHECK (user_id = auth.uid() OR public.is_superadmin());

-- user_lesson_progress
DROP POLICY IF EXISTS ulp_all_own ON public.user_lesson_progress;
CREATE POLICY ulp_all_own ON public.user_lesson_progress
  FOR ALL TO authenticated USING (user_id = auth.uid() OR public.is_superadmin())
  WITH CHECK (user_id = auth.uid() OR public.is_superadmin());

-- user_exercise_attempts
DROP POLICY IF EXISTS uea_all_own ON public.user_exercise_attempts;
CREATE POLICY uea_all_own ON public.user_exercise_attempts
  FOR ALL TO authenticated USING (user_id = auth.uid() OR public.is_superadmin())
  WITH CHECK (user_id = auth.uid() OR public.is_superadmin());

-- user_streaks
DROP POLICY IF EXISTS us_all_own ON public.user_streaks;
CREATE POLICY us_all_own ON public.user_streaks
  FOR ALL TO authenticated USING (user_id = auth.uid() OR public.is_superadmin())
  WITH CHECK (user_id = auth.uid() OR public.is_superadmin());

-- user_xp_log
DROP POLICY IF EXISTS uxl_all_own ON public.user_xp_log;
CREATE POLICY uxl_all_own ON public.user_xp_log
  FOR ALL TO authenticated USING (user_id = auth.uid() OR public.is_superadmin())
  WITH CHECK (user_id = auth.uid() OR public.is_superadmin());

-- leaderboard (readable by authenticated; write own row)
DROP POLICY IF EXISTS lb_select_all ON public.leaderboard;
CREATE POLICY lb_select_all ON public.leaderboard
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS lb_insert_own ON public.leaderboard;
CREATE POLICY lb_insert_own ON public.leaderboard
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() OR public.is_superadmin());

DROP POLICY IF EXISTS lb_update_own ON public.leaderboard;
CREATE POLICY lb_update_own ON public.leaderboard
  FOR UPDATE TO authenticated USING (user_id = auth.uid() OR public.is_superadmin())
  WITH CHECK (user_id = auth.uid() OR public.is_superadmin());

DROP POLICY IF EXISTS lb_delete_sa ON public.leaderboard;
CREATE POLICY lb_delete_sa ON public.leaderboard
  FOR DELETE TO authenticated USING (public.is_superadmin());

-- achievements
DROP POLICY IF EXISTS achievements_select ON public.achievements;
CREATE POLICY achievements_select ON public.achievements
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS achievements_all_sa ON public.achievements;
CREATE POLICY achievements_all_sa ON public.achievements
  FOR ALL TO authenticated USING (public.is_superadmin()) WITH CHECK (public.is_superadmin());

-- user_achievements
DROP POLICY IF EXISTS ua_all_own ON public.user_achievements;
CREATE POLICY ua_all_own ON public.user_achievements
  FOR ALL TO authenticated USING (user_id = auth.uid() OR public.is_superadmin())
  WITH CHECK (user_id = auth.uid() OR public.is_superadmin());

-- ui_strings
DROP POLICY IF EXISTS ui_strings_select ON public.ui_strings;
CREATE POLICY ui_strings_select ON public.ui_strings
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS ui_strings_all_sa ON public.ui_strings;
CREATE POLICY ui_strings_all_sa ON public.ui_strings
  FOR ALL TO authenticated USING (public.is_superadmin()) WITH CHECK (public.is_superadmin());

-- app_config
DROP POLICY IF EXISTS app_config_select ON public.app_config;
CREATE POLICY app_config_select ON public.app_config
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS app_config_all_sa ON public.app_config;
CREATE POLICY app_config_all_sa ON public.app_config
  FOR ALL TO authenticated USING (public.is_superadmin()) WITH CHECK (public.is_superadmin());
