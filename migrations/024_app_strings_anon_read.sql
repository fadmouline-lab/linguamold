-- Allow anonymous read of app UI strings so login/register/forgot-password
-- can render in the learner's app language before Supabase auth session exists.
-- Writes remain restricted to superadmin (see 020_app_strings.sql).

DROP POLICY IF EXISTS "app_strings_select_anon" ON public.app_strings;
CREATE POLICY "app_strings_select_anon" ON public.app_strings
  FOR SELECT TO anon
  USING (true);
