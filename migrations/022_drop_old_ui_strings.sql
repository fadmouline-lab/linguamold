-- Migration 022: Drop the old row-per-language ui_strings table.
-- app_strings (column-per-language) fully replaces it.
--
-- WARNING: migrations/999_seed_data.sql still inserts into ui_strings.
-- Those INSERT statements will silently fail after this migration.
-- Remove or guard the ui_strings section in 999 if you re-run seed data.

-- Drop RLS policies first (must happen before table drop)
DROP POLICY IF EXISTS "ui_strings_select"  ON public.ui_strings;
DROP POLICY IF EXISTS "ui_strings_all_sa"  ON public.ui_strings;

-- Drop the table (CASCADE removes indexes and any dependent objects)
DROP TABLE IF EXISTS public.ui_strings CASCADE;
