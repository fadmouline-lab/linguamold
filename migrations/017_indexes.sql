-- LinguaMold: additional indexes (idempotent)
CREATE INDEX IF NOT EXISTS idx_modules_slug ON public.modules(language_pair_id, slug);
CREATE INDEX IF NOT EXISTS idx_lessons_slug ON public.lessons(module_id, slug);
CREATE INDEX IF NOT EXISTS idx_exercises_lesson_order ON public.exercises(lesson_id, display_order, is_published);
CREATE INDEX IF NOT EXISTS idx_user_profiles_xp ON public.user_profiles(total_xp DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_period ON public.leaderboard(period_start, period_type);
