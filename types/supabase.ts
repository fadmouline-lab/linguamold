import type { Json } from './json';

export type Database = {
  public: {
    Tables: {
      languages: {
        Row: {
          id: string;
          code: string;
          name_native: string;
          name_english: string;
          direction: string;
          is_active: boolean;
          flag_emoji: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          name_native: string;
          name_english: string;
          direction?: string;
          is_active?: boolean;
          flag_emoji?: string | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['languages']['Insert']>;
      };
      language_pairs: {
        Row: {
          id: string;
          app_language_id: string;
          learning_language_id: string;
          is_active: boolean;
          display_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          app_language_id: string;
          learning_language_id: string;
          is_active?: boolean;
          display_order?: number;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['language_pairs']['Insert']>;
      };
      modules: {
        Row: {
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
        };
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
      };
      lessons: {
        Row: {
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
        };
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
      };
      exercises: {
        Row: {
          id: string;
          lesson_id: string;
          mold_type: string;
          display_order: number;
          content: Json;
          difficulty: number;
          xp_value: number;
          tags: string[] | null;
          is_published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
      };
      user_profiles: {
        Row: {
          id: string;
          display_name: string | null;
          avatar_url: string | null;
          role: string;
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
        };
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
      };
      user_module_progress: {
        Row: Record<string, unknown>;
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
      };
      user_lesson_progress: {
        Row: Record<string, unknown>;
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
      };
      user_exercise_attempts: {
        Row: Record<string, unknown>;
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
      };
      user_streaks: {
        Row: Record<string, unknown>;
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
      };
      user_xp_log: {
        Row: Record<string, unknown>;
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
      };
      leaderboard: {
        Row: Record<string, unknown>;
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
      };
      achievements: {
        Row: Record<string, unknown>;
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
      };
      user_achievements: {
        Row: Record<string, unknown>;
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
      };
      ui_strings: {
        Row: Record<string, unknown>;
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
      };
      app_config: {
        Row: Record<string, unknown>;
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
};
