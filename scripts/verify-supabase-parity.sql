-- Optional: run in Supabase SQL editor after applying migrations 001–024.
-- Confirms columns the React client writes to exist.

SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'user_exercise_attempts'
ORDER BY ordinal_position;

SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'user_lesson_progress'
ORDER BY ordinal_position;
