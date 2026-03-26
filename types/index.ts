export type { Json } from './json';
import type { Json as JsonValue } from './json';

export interface Language {
  id: string;
  code: string;
  name_native: string;
  name_english: string;
  direction: 'ltr' | 'rtl';
  is_active: boolean;
  flag_emoji: string | null;
  created_at: string;
}

export interface LanguagePair {
  id: string;
  app_language_id: string;
  learning_language_id: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
}

export interface Module {
  id: string;
  language_pair_id: string;
  slug: string;
  title_al: string;
  title_ll: string;
  description_al: string | null;
  icon_name: string | null;
  color_hex: string | null;
  difficulty_level: number;
  display_order: number;
  is_published: boolean;
  xp_reward: number;
  estimated_minutes: number;
  created_at: string;
  updated_at: string;
}

export interface Lesson {
  id: string;
  module_id: string;
  slug: string;
  title_al: string;
  display_order: number;
  lesson_type: string;
  xp_reward: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface ExerciseRow {
  id: string;
  lesson_id: string;
  mold_type: string;
  display_order: number;
  content: JsonValue;
  difficulty: number;
  xp_value: number;
  tags: string[] | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  role: 'user' | 'superadmin';
  preferred_al: string | null;
  preferred_ll: string | null;
  proficiency_level: number;
  daily_goal_minutes: number;
  notification_enabled: boolean;
  notification_time: string;
  timezone: string;
  hearts: number;
  hearts_last_regen: string;
  gems: number;
  total_xp: number;
  current_streak: number;
  longest_streak: number;
  last_activity_date: string | null;
  streak_frozen_until: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserModuleProgress {
  id: string;
  user_id: string;
  module_id: string;
  status: string;
  completion_pct: number;
  started_at: string | null;
  completed_at: string | null;
  best_score: number | null;
}

export interface UserLessonProgress {
  id: string;
  user_id: string;
  lesson_id: string;
  status: string;
  score: number | null;
  attempts: number;
  best_score: number | null;
  stars: number;
  started_at: string | null;
  completed_at: string | null;
}

export interface UserExerciseAttempt {
  id: string;
  user_id: string;
  exercise_id: string;
  is_correct: boolean;
  user_answer: JsonValue | null;
  time_spent_ms: number | null;
  xp_earned: number;
  attempted_at: string;
}

export interface UserStreak {
  id: string;
  user_id: string;
  streak_date: string;
  xp_earned: number;
  minutes_practiced: number;
  exercises_completed: number;
}

export interface UserXpLog {
  id: string;
  user_id: string;
  xp_amount: number;
  source: string;
  reference_id: string | null;
  created_at: string;
}

export interface LeaderboardEntry {
  id: string;
  user_id: string;
  language_pair_id: string;
  period_type: string;
  period_start: string;
  xp_earned: number;
  rank: number | null;
}

export interface Achievement {
  id: string;
  slug: string;
  title_key: string;
  description_key: string;
  icon_name: string | null;
  xp_reward: number;
  condition_type: string;
  condition_value: number;
  created_at: string;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  unlocked_at: string;
}

export interface UiString {
  id: string;
  string_key: string;
  language_id: string;
  value: string;
  context_note: string | null;
}

export interface AppConfigRow {
  key: string;
  value: JsonValue;
  description: string | null;
  updated_at: string;
}

export * from './molds';
export * from './navigation';
export * from './supabase';
