-- UX Feedback Layer: word difficulty tracking, profile extensions, exercise tracking
-- Phase 1 foundation migration

-- Word difficulty tracking for spaced repetition
CREATE TABLE IF NOT EXISTS user_word_difficulty (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  word TEXT NOT NULL,
  language_pair_id UUID REFERENCES language_pairs NOT NULL,
  mistake_count INT DEFAULT 0,
  last_mistake_at TIMESTAMPTZ,
  last_correct_at TIMESTAMPTZ,
  next_review_at TIMESTAMPTZ,
  difficulty_level INT DEFAULT 0,
  UNIQUE(user_id, word, language_pair_id)
);

CREATE INDEX IF NOT EXISTS idx_uwd_review
  ON user_word_difficulty(user_id, next_review_at);

ALTER TABLE user_word_difficulty ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own word difficulty"
  ON user_word_difficulty FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Profile extensions for onboarding
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS learning_motivation JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ;

-- Exercise attempt extensions for hints and skips
ALTER TABLE user_exercise_attempts
  ADD COLUMN IF NOT EXISTS hints_used INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_skipped BOOLEAN DEFAULT false;
