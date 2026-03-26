# 🌍 LinguaMold — Master Strategy Blueprint

## Project Codename: LinguaMold
### "Language learning for the underserved — built overnight, scales globally"

---

# TABLE OF CONTENTS

1. [Vision & Architecture Overview](#1-vision--architecture-overview)
2. [Tech Stack & Tooling Decisions](#2-tech-stack--tooling-decisions)
3. [The Mold System — Core Innovation](#3-the-mold-system--core-innovation)
4. [Database Schema — Complete](#4-database-schema--complete)
5. [Frontend Architecture](#5-frontend-architecture)
6. [SuperAdmin System](#6-superadmin-system)
7. [User Experience Flow](#7-user-experience-flow)
8. [Gamification & Retention Engine](#8-gamification--retention-engine)
9. [Curriculum Architecture](#9-curriculum-architecture)
10. [Audio Pipeline — Synthesia / ElevenLabs](#10-audio-pipeline--synthesia--elevenlabs)
11. [Content Generation Instructions — LLM Prompts](#11-content-generation-instructions--llm-prompts)
12. [Cursor Rules File](#12-cursor-rules-file)
13. [The Overnight Build — Execution Plan](#13-the-overnight-build--execution-plan)
14. [Supabase Migrations — Complete SQL](#14-supabase-migrations--complete-sql)
15. [Edge Functions Spec](#15-edge-functions-spec)
16. [Post-Build Checklist](#16-post-build-checklist)

---

# 1. Vision & Architecture Overview

## What We're Building
A mobile-first language learning app that teaches **English** to **French speakers** (MVP). The architecture is designed so that the "App Language" (AL) and "Learning Language" (LL) are completely decoupled — every piece of content, every UI string, every audio file is keyed by language pair. Swap French for Farsi, and the entire app transforms.

## Core Principles
- **Mold-based architecture**: Exercise types are reusable templates ("molds"). Content is data, not code.
- **Language-pair agnostic**: The same mold renders differently depending on AL + LL combination.
- **Offline-first where possible**: Lessons can be cached. Audio can be pre-downloaded.
- **Duolingo-grade UX**: Adventure path, streaks, leaderboards, XP, hearts/lives, celebration animations.
- **SuperAdmin as CMS**: SA can edit any content inline — no separate admin panel needed.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────┐
│                    EXPO / REACT NATIVE                │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌─────────┐ │
│  │ Auth     │ │ Lesson   │ │ Gamify   │ │ Admin   │ │
│  │ Screens  │ │ Engine   │ │ Engine   │ │ Overlay │ │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬────┘ │
│       │             │            │             │      │
│  ┌────▼─────────────▼────────────▼─────────────▼────┐ │
│  │              Supabase JS Client                   │ │
│  └───────────────────┬───────────────────────────────┘ │
└──────────────────────┼─────────────────────────────────┘
                       │
         ┌─────────────▼─────────────┐
         │        SUPABASE           │
         │  ┌─────────────────────┐  │
         │  │   PostgreSQL DB     │  │
         │  │   (all content,     │  │
         │  │    progress, users) │  │
         │  ├─────────────────────┤  │
         │  │   Auth (email/pw,   │  │
         │  │    social login)    │  │
         │  ├─────────────────────┤  │
         │  │   Storage Buckets   │  │
         │  │   (audio files,     │  │
         │  │    images)          │  │
         │  ├─────────────────────┤  │
         │  │   Edge Functions    │  │
         │  │   (scoring, streak  │  │
         │  │    logic, XP calc)  │  │
         │  └─────────────────────┘  │
         └───────────────────────────┘
```

---

# 2. Tech Stack & Tooling Decisions

## Frontend
| Choice | Reason |
|--------|--------|
| **Expo (React Native)** | Cross-platform (iOS + Android), hot reload, EAS Build for app stores, Expo Router for navigation |
| **Expo Router** | File-based routing, deep linking, tab navigation built-in |
| **React Native Reanimated** | Smooth 60fps animations for celebration screens, card flips, progress bars |
| **React Native Gesture Handler** | Swipe gestures for card-based exercises |
| **Zustand** | Lightweight state management — simpler than Redux for this use case |
| **expo-av** | Audio playback for pronunciation exercises |
| **expo-notifications** | Push notifications for streak reminders |

## Backend
| Choice | Reason |
|--------|--------|
| **Supabase** | Auth + DB + Storage + Edge Functions in one platform. Free tier is generous. |
| **PostgreSQL** | The DB behind Supabase. Supports JSONB for flexible exercise content. |
| **Supabase Storage** | Audio files (MP3/WAV), lesson images |
| **Supabase Edge Functions** | Deno-based serverless functions for scoring, streak calculation, leaderboard updates |
| **Supabase Realtime** | Optional: live leaderboard updates |

## Content & Audio Generation (Build-time only, not runtime)
| Tool | Purpose |
|------|---------|
| **Claude / GPT-4** | Generate curriculum content, sentences, word lists, explanations, hints |
| **ElevenLabs** | Generate natural-sounding audio for all English sentences and words |
| **Synthesia** (if enterprise) | Generate video-based lessons for premium tier (future) |

## Vibe Coding Setup
| Tool | Role |
|------|------|
| **Cursor** (primary) | IDE with Composer for autonomous coding sessions |
| **Factory AI + Kimi 2.5** (backup) | Alternative if Cursor hits rate limits |

---

# 3. The Mold System — Core Innovation

A "mold" is a reusable exercise template. Each mold is:
1. A **frontend component** (renders the exercise UI)
2. A **backend table structure** (stores the exercise data)
3. A **scoring function** (determines correct/incorrect + XP)

## Complete Mold Catalog

### MOLD 01 — `fill_in_the_blank`
**User sees**: A sentence with a blank, and 2-4 options to choose from.
**Example (FR→EN)**: "Tommy wants to ___ lunch right now." → [eat, sleep, drink]
**Data shape**:
```json
{
  "mold_type": "fill_in_the_blank",
  "sentence_al": "Tommy veut ___ le déjeuner maintenant.",
  "sentence_ll": "Tommy wants to ___ lunch right now.",
  "blank_position": 3,
  "options": [
    { "text": "eat", "is_correct": true },
    { "text": "sleep", "is_correct": false },
    { "text": "drink", "is_correct": false }
  ],
  "success_message_al": "Bravo! Passons à la prochaine question!",
  "error_explanation_al": "'Sleep' veut dire dormir! Manger, c'est 'eat'!",
  "audio_url_ll": "storage://audio/en/tommy_wants_to_eat.mp3"
}
```

### MOLD 02 — `translate_sentence`
**User sees**: A sentence in AL. User must type the translation in LL.
**Example**: "Le chat est sur la table" → User types: "The cat is on the table"
**Data shape**:
```json
{
  "mold_type": "translate_sentence",
  "prompt_al": "Le chat est sur la table.",
  "accepted_answers_ll": [
    "The cat is on the table",
    "The cat is on the table.",
    "the cat is on the table"
  ],
  "hint_al": "Pensez à 'cat' et 'table'",
  "audio_url_ll": "storage://audio/en/the_cat_is_on_the_table.mp3"
}
```

### MOLD 03 — `word_reorder`
**User sees**: Scrambled words. Tap them in correct order to form a sentence.
**Example**: [is, The, table, on, cat, the] → "The cat is on the table"
**Data shape**:
```json
{
  "mold_type": "word_reorder",
  "prompt_al": "Remettez les mots dans l'ordre:",
  "scrambled_words_ll": ["is", "The", "table", "on", "cat", "the"],
  "correct_order": [1, 4, 0, 3, 5, 2],
  "correct_sentence_ll": "The cat is on the table",
  "audio_url_ll": "storage://audio/en/the_cat_is_on_the_table.mp3"
}
```

### MOLD 04 — `listen_and_choose`
**User sees**: Audio plays. User picks what they heard from 2-4 options.
**Example**: Audio plays "Good morning" → [Good morning, Good evening, Good night]
**Data shape**:
```json
{
  "mold_type": "listen_and_choose",
  "audio_url_ll": "storage://audio/en/good_morning.mp3",
  "prompt_al": "Qu'avez-vous entendu?",
  "options": [
    { "text_ll": "Good morning", "text_al": "Bonjour", "is_correct": true },
    { "text_ll": "Good evening", "text_al": "Bonsoir", "is_correct": false },
    { "text_ll": "Good night", "text_al": "Bonne nuit", "is_correct": false }
  ]
}
```

### MOLD 05 — `speak_the_word`
**User sees**: A word/phrase in LL with pronunciation guide. User taps mic and speaks.
**Note**: For MVP, this can be simplified to "tap to hear, then self-assess" (skip speech recognition).
**Data shape**:
```json
{
  "mold_type": "speak_the_word",
  "word_ll": "Breakfast",
  "phonetic_ll": "/ˈbrek.fəst/",
  "translation_al": "Petit-déjeuner",
  "audio_url_ll": "storage://audio/en/breakfast.mp3",
  "self_assess": true
}
```

### MOLD 06 — `match_pairs`
**User sees**: Two columns. Match AL words to LL translations by tapping.
**Example**: Left: [Chat, Chien, Oiseau] → Right: [Dog, Cat, Bird]
**Data shape**:
```json
{
  "mold_type": "match_pairs",
  "prompt_al": "Associez les mots:",
  "pairs": [
    { "al": "Chat", "ll": "Cat" },
    { "al": "Chien", "ll": "Dog" },
    { "al": "Oiseau", "ll": "Bird" },
    { "al": "Poisson", "ll": "Fish" }
  ]
}
```

### MOLD 07 — `image_select`
**User sees**: An image + audio. Pick the image that matches.
**Example**: Audio says "Apple" → User picks apple image from 4 images.
**Data shape**:
```json
{
  "mold_type": "image_select",
  "audio_url_ll": "storage://audio/en/apple.mp3",
  "prompt_al": "Sélectionnez l'image correcte:",
  "options": [
    { "image_url": "storage://images/apple.png", "is_correct": true },
    { "image_url": "storage://images/banana.png", "is_correct": false },
    { "image_url": "storage://images/grape.png", "is_correct": false },
    { "image_url": "storage://images/orange.png", "is_correct": false }
  ]
}
```

### MOLD 08 — `conversation_listen`
**User sees**: A short dialogue plays. User answers a comprehension question.
**Example**: Audio: "Hi, how are you?" "I'm fine, thank you." → Q: "How is the person feeling?"
**Data shape**:
```json
{
  "mold_type": "conversation_listen",
  "audio_url_ll": "storage://audio/en/conv_greeting_01.mp3",
  "transcript_ll": "A: Hi, how are you?\nB: I'm fine, thank you.",
  "transcript_al": "A: Salut, comment vas-tu?\nB: Je vais bien, merci.",
  "question_al": "Comment se sent la personne?",
  "options": [
    { "text_al": "Bien", "is_correct": true },
    { "text_al": "Mal", "is_correct": false },
    { "text_al": "Fatigué", "is_correct": false }
  ]
}
```

### MOLD 09 — `select_correct_verb`
**User sees**: A sentence with a verb blank and 3 conjugation options.
**Example**: "She ___ to school every day." → [go, goes, going]
**Data shape**:
```json
{
  "mold_type": "select_correct_verb",
  "sentence_ll": "She ___ to school every day.",
  "translation_al": "Elle ___ à l'école tous les jours.",
  "options": [
    { "text": "go", "is_correct": false },
    { "text": "goes", "is_correct": true },
    { "text": "going", "is_correct": false }
  ],
  "grammar_hint_al": "Avec 'she', on utilise la 3ème personne du singulier."
}
```

### MOLD 10 — `flashcard`
**User sees**: Card with word in LL on front. Tap to flip and see AL translation + example sentence.
**Data shape**:
```json
{
  "mold_type": "flashcard",
  "word_ll": "Perseverance",
  "pronunciation_ll": "/ˌpɜː.sɪˈvɪə.rəns/",
  "translation_al": "Persévérance",
  "example_ll": "Her perseverance paid off in the end.",
  "example_al": "Sa persévérance a fini par payer.",
  "audio_url_ll": "storage://audio/en/perseverance.mp3"
}
```

### MOLD 11 — `type_what_you_hear`
**User sees**: Audio plays a word/sentence. User types what they heard.
**Data shape**:
```json
{
  "mold_type": "type_what_you_hear",
  "audio_url_ll": "storage://audio/en/she_is_reading_a_book.mp3",
  "accepted_answers": [
    "She is reading a book",
    "she is reading a book",
    "She is reading a book."
  ],
  "hint_al": "Écoutez attentivement le verbe utilisé."
}
```

### MOLD 12 — `true_or_false`
**User sees**: A statement in LL. User decides if the translation shown is correct.
**Data shape**:
```json
{
  "mold_type": "true_or_false",
  "statement_ll": "The sun rises in the west.",
  "proposed_translation_al": "Le soleil se lève à l'ouest.",
  "is_translation_correct": true,
  "is_statement_factually_true": false,
  "explanation_al": "La traduction est correcte. Mais attention, le soleil se lève à l'EST!"
}
```

---

# 4. Database Schema — Complete

## Overview of Tables

```
users
languages
language_pairs
modules
lessons
exercises                ← the "mold instances" live here
exercise_content         ← JSONB content keyed by mold_type
user_progress
user_module_progress
user_exercise_attempts
user_streaks
user_xp_log
leaderboard
achievements
user_achievements
ui_strings               ← all app UI text, keyed by language
app_config
notifications
```

## Detailed Table Definitions

### `languages`
```sql
CREATE TABLE languages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(10) UNIQUE NOT NULL,        -- 'en', 'fr', 'fa', 'ru', 'ar', etc.
  name_native VARCHAR(100) NOT NULL,       -- 'English', 'Français', 'فارسی'
  name_english VARCHAR(100) NOT NULL,      -- always English name for internal use
  direction VARCHAR(3) DEFAULT 'ltr',      -- 'ltr' or 'rtl' (critical for Farsi, Arabic)
  is_active BOOLEAN DEFAULT true,
  flag_emoji VARCHAR(10),                  -- '🇬🇧', '🇫🇷', etc.
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### `language_pairs`
```sql
CREATE TABLE language_pairs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_language_id UUID REFERENCES languages(id) NOT NULL,     -- AL (French)
  learning_language_id UUID REFERENCES languages(id) NOT NULL, -- LL (English)
  is_active BOOLEAN DEFAULT true,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(app_language_id, learning_language_id)
);
```

### `modules`
A module is a themed collection of lessons (e.g., "Greetings", "Family", "Food & Drink").
```sql
CREATE TABLE modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  language_pair_id UUID REFERENCES language_pairs(id) NOT NULL,
  slug VARCHAR(100) NOT NULL,              -- 'greetings', 'family', 'food_and_drink'
  title_al VARCHAR(255) NOT NULL,          -- "Salutations" (in French)
  title_ll VARCHAR(255) NOT NULL,          -- "Greetings" (in English)
  description_al TEXT,                     -- Module description in AL
  icon_name VARCHAR(50),                   -- icon identifier for the adventure path
  color_hex VARCHAR(7),                    -- module theme color
  difficulty_level INT NOT NULL,           -- 0=absolute beginner, 1=beginner, ..., 5=advanced
  display_order INT NOT NULL,              -- order on the adventure path
  is_published BOOLEAN DEFAULT false,
  xp_reward INT DEFAULT 50,               -- XP for completing entire module
  estimated_minutes INT DEFAULT 15,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### `lessons`
A lesson is a single "session" within a module (5-15 exercises).
```sql
CREATE TABLE lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID REFERENCES modules(id) NOT NULL,
  slug VARCHAR(100) NOT NULL,
  title_al VARCHAR(255) NOT NULL,
  display_order INT NOT NULL,
  lesson_type VARCHAR(30) DEFAULT 'standard',  -- 'standard', 'review', 'test', 'placement'
  xp_reward INT DEFAULT 10,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### `exercises` — The Heart of the Mold System
```sql
CREATE TABLE exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID REFERENCES lessons(id) NOT NULL,
  mold_type VARCHAR(50) NOT NULL,          -- 'fill_in_the_blank', 'translate_sentence', etc.
  display_order INT NOT NULL,
  content JSONB NOT NULL,                  -- the mold-specific data (see Mold Catalog above)
  difficulty INT DEFAULT 1,                -- 1-5 scale within the lesson
  xp_value INT DEFAULT 5,                 -- XP earned for correct answer
  tags TEXT[],                             -- ['grammar', 'verb_conjugation', 'present_tense']
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lesson loading
CREATE INDEX idx_exercises_lesson ON exercises(lesson_id, display_order);
-- Index for mold-type queries (admin filtering)
CREATE INDEX idx_exercises_mold ON exercises(mold_type);
```

### `users` (extends Supabase auth.users)
```sql
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  display_name VARCHAR(100),
  avatar_url TEXT,
  role VARCHAR(20) DEFAULT 'user',             -- 'user' or 'superadmin'
  preferred_al UUID REFERENCES languages(id),   -- user's native/app language
  preferred_ll UUID REFERENCES languages(id),   -- language they're learning
  proficiency_level INT DEFAULT 0,              -- 0-5, set after placement test
  daily_goal_minutes INT DEFAULT 10,
  notification_enabled BOOLEAN DEFAULT true,
  notification_time TIME DEFAULT '09:00',
  timezone VARCHAR(50) DEFAULT 'UTC',
  hearts INT DEFAULT 5,                         -- lives system (regens over time)
  hearts_last_regen TIMESTAMPTZ DEFAULT NOW(),
  gems INT DEFAULT 0,                           -- premium currency
  total_xp INT DEFAULT 0,
  current_streak INT DEFAULT 0,
  longest_streak INT DEFAULT 0,
  last_activity_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### `user_module_progress`
```sql
CREATE TABLE user_module_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) NOT NULL,
  module_id UUID REFERENCES modules(id) NOT NULL,
  status VARCHAR(20) DEFAULT 'locked',          -- 'locked', 'available', 'in_progress', 'completed'
  completion_pct DECIMAL(5,2) DEFAULT 0,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  best_score DECIMAL(5,2),
  UNIQUE(user_id, module_id)
);
```

### `user_lesson_progress`
```sql
CREATE TABLE user_lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) NOT NULL,
  lesson_id UUID REFERENCES lessons(id) NOT NULL,
  status VARCHAR(20) DEFAULT 'locked',
  score DECIMAL(5,2),
  attempts INT DEFAULT 0,
  best_score DECIMAL(5,2),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  UNIQUE(user_id, lesson_id)
);
```

### `user_exercise_attempts`
```sql
CREATE TABLE user_exercise_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) NOT NULL,
  exercise_id UUID REFERENCES exercises(id) NOT NULL,
  is_correct BOOLEAN NOT NULL,
  user_answer JSONB,                           -- what the user submitted
  time_spent_ms INT,                           -- milliseconds to answer
  xp_earned INT DEFAULT 0,
  attempted_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_attempts_user ON user_exercise_attempts(user_id, attempted_at DESC);
```

### `user_streaks`
```sql
CREATE TABLE user_streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) NOT NULL,
  streak_date DATE NOT NULL,
  xp_earned INT DEFAULT 0,
  minutes_practiced INT DEFAULT 0,
  exercises_completed INT DEFAULT 0,
  UNIQUE(user_id, streak_date)
);

CREATE INDEX idx_streaks_user_date ON user_streaks(user_id, streak_date DESC);
```

### `user_xp_log`
```sql
CREATE TABLE user_xp_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) NOT NULL,
  xp_amount INT NOT NULL,
  source VARCHAR(50) NOT NULL,                 -- 'exercise', 'lesson_complete', 'module_complete', 'streak_bonus', 'perfect_lesson'
  reference_id UUID,                           -- exercise_id, lesson_id, etc.
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### `leaderboard`
```sql
CREATE TABLE leaderboard (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) NOT NULL,
  language_pair_id UUID REFERENCES language_pairs(id) NOT NULL,
  period_type VARCHAR(10) NOT NULL,            -- 'weekly', 'monthly', 'alltime'
  period_start DATE NOT NULL,
  xp_earned INT DEFAULT 0,
  rank INT,
  UNIQUE(user_id, language_pair_id, period_type, period_start)
);

CREATE INDEX idx_leaderboard_rank ON leaderboard(language_pair_id, period_type, period_start, xp_earned DESC);
```

### `achievements`
```sql
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(100) UNIQUE NOT NULL,
  title_key VARCHAR(100) NOT NULL,             -- references ui_strings
  description_key VARCHAR(100) NOT NULL,
  icon_name VARCHAR(50),
  xp_reward INT DEFAULT 0,
  condition_type VARCHAR(50) NOT NULL,         -- 'streak_days', 'total_xp', 'modules_completed', 'perfect_lessons'
  condition_value INT NOT NULL,                -- e.g., 7 for "7-day streak"
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### `user_achievements`
```sql
CREATE TABLE user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) NOT NULL,
  achievement_id UUID REFERENCES achievements(id) NOT NULL,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);
```

### `ui_strings` — The Localization Table
Every single piece of UI text lives here. This is what makes the AL swap possible.
```sql
CREATE TABLE ui_strings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  string_key VARCHAR(200) NOT NULL,            -- 'onboarding.welcome_title', 'exercise.success_generic'
  language_id UUID REFERENCES languages(id) NOT NULL,
  value TEXT NOT NULL,
  context_note TEXT,                            -- for translators: where this string appears
  UNIQUE(string_key, language_id)
);

CREATE INDEX idx_ui_strings_lang ON ui_strings(language_id, string_key);
```

### `app_config`
```sql
CREATE TABLE app_config (
  key VARCHAR(100) PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Example entries:
-- key: 'hearts_max', value: 5
-- key: 'hearts_regen_minutes', value: 240
-- key: 'xp_per_correct_answer', value: 10
-- key: 'streak_freeze_cost_gems', value: 50
-- key: 'placement_test_exercise_count', value: 15
```

---

# 5. Frontend Architecture

## Folder Structure (Expo Router)

```
linguamold/
├── app/
│   ├── _layout.tsx                 ← Root layout (auth check, providers)
│   ├── index.tsx                   ← Splash / redirect
│   ├── (auth)/
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   └── forgot-password.tsx
│   ├── (onboarding)/
│   │   ├── select-language.tsx     ← User picks LL
│   │   ├── proficiency.tsx         ← Self-assess level
│   │   └── placement-test.tsx      ← Placement test flow
│   ├── (main)/
│   │   ├── _layout.tsx             ← Tab navigator
│   │   ├── home.tsx                ← Adventure path (module scroll)
│   │   ├── leaderboard.tsx
│   │   ├── profile.tsx
│   │   └── shop.tsx                ← Gems shop (hearts, streak freezes)
│   ├── lesson/
│   │   └── [lessonId].tsx          ← Lesson engine (renders mold sequence)
│   ├── review/
│   │   └── [moduleId].tsx          ← Spaced repetition review
│   └── (admin)/
│       ├── _layout.tsx             ← Admin layout with toggle bar
│       ├── index.tsx               ← AL/LL selector
│       ├── modules.tsx             ← Module list (reorderable)
│       ├── lessons/[moduleId].tsx  ← Lesson list for module
│       └── exercises/[lessonId].tsx ← Exercise list (inline edit)
├── components/
│   ├── molds/                      ← ONE component per mold type
│   │   ├── FillInTheBlank.tsx
│   │   ├── TranslateSentence.tsx
│   │   ├── WordReorder.tsx
│   │   ├── ListenAndChoose.tsx
│   │   ├── SpeakTheWord.tsx
│   │   ├── MatchPairs.tsx
│   │   ├── ImageSelect.tsx
│   │   ├── ConversationListen.tsx
│   │   ├── SelectCorrectVerb.tsx
│   │   ├── Flashcard.tsx
│   │   ├── TypeWhatYouHear.tsx
│   │   └── TrueOrFalse.tsx
│   ├── gamification/
│   │   ├── XPBar.tsx
│   │   ├── StreakBadge.tsx
│   │   ├── HeartDisplay.tsx
│   │   ├── CelebrationOverlay.tsx  ← confetti, animations
│   │   ├── ProgressRing.tsx
│   │   └── LeaderboardRow.tsx
│   ├── adventure/
│   │   ├── AdventurePath.tsx       ← The vertical scroll path
│   │   ├── ModuleNode.tsx          ← Each "bubble" on the path
│   │   └── PathConnector.tsx       ← Lines between nodes
│   ├── admin/
│   │   ├── InlineEditor.tsx        ← Tap-to-edit overlay
│   │   ├── ReorderableList.tsx
│   │   └── AdminToggleBar.tsx
│   ├── common/
│   │   ├── AudioPlayer.tsx
│   │   ├── AnimatedButton.tsx
│   │   ├── ProgressBar.tsx
│   │   └── BottomSheet.tsx
│   └── ui/                         ← Design primitives
│       ├── Text.tsx                ← Respects RTL, uses ui_strings
│       ├── Card.tsx
│       ├── Button.tsx
│       ├── Input.tsx
│       └── theme.ts                ← Colors, spacing, typography tokens
├── hooks/
│   ├── useAuth.ts
│   ├── useLanguagePair.ts
│   ├── useExerciseEngine.ts        ← Core: loads exercises, tracks state, scores
│   ├── useStreak.ts
│   ├── useXP.ts
│   ├── useHearts.ts
│   ├── useLeaderboard.ts
│   ├── useUIString.ts              ← t('onboarding.welcome_title') → localized string
│   └── useAdminMode.ts
├── lib/
│   ├── supabase.ts                 ← Supabase client init
│   ├── mold-registry.ts            ← Maps mold_type string → Component
│   ├── scoring.ts                  ← Client-side answer validation
│   ├── audio.ts                    ← Audio playback helpers
│   └── constants.ts
├── stores/
│   ├── authStore.ts                ← Zustand
│   ├── lessonStore.ts
│   ├── gamificationStore.ts
│   └── adminStore.ts
└── assets/
    ├── fonts/
    ├── images/
    └── animations/                 ← Lottie files for celebrations
```

## The Mold Registry — Plug & Play

```typescript
// lib/mold-registry.ts
import FillInTheBlank from '@/components/molds/FillInTheBlank';
import TranslateSentence from '@/components/molds/TranslateSentence';
import WordReorder from '@/components/molds/WordReorder';
import ListenAndChoose from '@/components/molds/ListenAndChoose';
import SpeakTheWord from '@/components/molds/SpeakTheWord';
import MatchPairs from '@/components/molds/MatchPairs';
import ImageSelect from '@/components/molds/ImageSelect';
import ConversationListen from '@/components/molds/ConversationListen';
import SelectCorrectVerb from '@/components/molds/SelectCorrectVerb';
import Flashcard from '@/components/molds/Flashcard';
import TypeWhatYouHear from '@/components/molds/TypeWhatYouHear';
import TrueOrFalse from '@/components/molds/TrueOrFalse';

export const MoldRegistry: Record<string, React.ComponentType<MoldProps>> = {
  fill_in_the_blank: FillInTheBlank,
  translate_sentence: TranslateSentence,
  word_reorder: WordReorder,
  listen_and_choose: ListenAndChoose,
  speak_the_word: SpeakTheWord,
  match_pairs: MatchPairs,
  image_select: ImageSelect,
  conversation_listen: ConversationListen,
  select_correct_verb: SelectCorrectVerb,
  flashcard: Flashcard,
  type_what_you_hear: TypeWhatYouHear,
  true_or_false: TrueOrFalse,
};

// Every mold component receives the same prop interface:
export interface MoldProps {
  exercise: Exercise;            // the full exercise row
  onAnswer: (isCorrect: boolean, answer: any) => void;
  onNext: () => void;
  isAdminMode?: boolean;         // enables inline editing
  onContentChange?: (newContent: JSONB) => void;  // admin save
}
```

## The Lesson Engine — Core Loop

```typescript
// Simplified logic in lesson/[lessonId].tsx
function LessonScreen() {
  const { lessonId } = useLocalSearchParams();
  const { exercises, currentIndex, advance, submitAnswer, isComplete, score }
    = useExerciseEngine(lessonId);

  const currentExercise = exercises[currentIndex];
  const MoldComponent = MoldRegistry[currentExercise.mold_type];

  if (isComplete) return <LessonCompleteScreen score={score} />;

  return (
    <View>
      <ProgressBar current={currentIndex} total={exercises.length} />
      <HeartDisplay />
      <MoldComponent
        exercise={currentExercise}
        onAnswer={(isCorrect, answer) => submitAnswer(isCorrect, answer)}
        onNext={() => advance()}
      />
    </View>
  );
}
```

---

# 6. SuperAdmin System

## SA Flow
1. SA logs in → sees language pair selector (two dropdowns: AL and LL)
2. SA selects AL=French, LL=English → clicks "Enter"
3. SA sees the same adventure path as users, but with an **orange admin banner** at top
4. SA can:
   - **Tap any module** → see its lessons
   - **Long-press a module** → drag to reorder
   - **Tap any lesson** → see its exercises
   - **Tap any exercise** → enters inline edit mode
   - **Tap any text field** in an exercise → edit it with keyboard
   - **Save/Cancel buttons** appear at bottom when editing

## Inline Edit Behavior
```
┌─────────────────────────────────┐
│ [ADMIN MODE] FR → EN            │  ← Orange banner
├─────────────────────────────────┤
│                                 │
│  Fill in the Blank              │
│                                 │
│  "Tommy wants to ___ lunch"     │  ← SA taps this text
│                                 │
│  ┌─────────────────────────┐    │
│  │ Tommy wants to ___ lunch│    │  ← Becomes editable input
│  │ right now.              │    │
│  └─────────────────────────┘    │
│                                 │
│  Options:                       │
│  [eat ✓]  [sleep]  [drink]     │  ← SA can tap to edit/toggle correct
│                                 │
│  ┌──────┐  ┌──────────┐        │
│  │ Save │  │  Cancel  │        │
│  └──────┘  └──────────┘        │
└─────────────────────────────────┘
```

## What SA Edits Update
When SA saves, the app sends a PATCH to the `exercises` table, updating the `content` JSONB field. This immediately affects what all users see.

## RLS Policies
```sql
-- SuperAdmins can read/write everything
CREATE POLICY "sa_full_access" ON exercises
  FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'superadmin')
  );

-- Regular users can only READ published exercises
CREATE POLICY "user_read_published" ON exercises
  FOR SELECT
  TO authenticated
  USING (is_published = true);
```

---

# 7. User Experience Flow

## Complete User Journey

```
[App Open]
    │
    ▼
[Logged in?] ──No──► [Login/Register Screen]
    │                        │
   Yes                       │
    │                        ▼
    ▼               [Create Account]
[Has selected LL?] ──No──► [Select Learning Language]
    │                              │
   Yes                             ▼
    │                     [Proficiency Self-Assessment]
    │                        │
    │                        ▼
    │                  [Placement Test]
    │                   (15 exercises spanning difficulties)
    │                        │
    │                        ▼
    │                  [Assign Starting Module]
    │                        │
    ▼                        ▼
[MAIN SCREEN — ADVENTURE PATH]
    │
    ├── Tab 1: Home (Adventure Path)
    │     └── Vertical scroll of module nodes
    │         Each node shows: icon, title, completion ring
    │         Tap node → Enter lesson picker
    │         Current node glows/pulses
    │
    ├── Tab 2: Leaderboard
    │     └── Weekly XP ranking
    │         Your position highlighted
    │         Top 3 get special badges
    │
    ├── Tab 3: Profile
    │     └── Stats: streak, total XP, achievements
    │         Settings: notifications, daily goal
    │         Language switch
    │
    └── Tab 4: Browse (optional)
          └── All modules by theme
              Can jump to any unlocked module
```

## Lesson Flow Detail

```
[User taps a module node]
    │
    ▼
[Module detail: list of lessons]
    │
    ▼
[User taps lesson]
    │
    ▼
[Lesson starts: progress bar at top, hearts top-right]
    │
    ├── Exercise 1 (random mold, e.g., fill_in_the_blank)
    │     User answers → Correct: +XP, green flash, "Bravo!" → auto-advance after 1.5s
    │     User answers → Wrong: -1 heart, red flash, explanation shown → tap "Continue"
    │
    ├── Exercise 2 (different mold, e.g., listen_and_choose)
    │     ...
    ├── Exercise 3...
    │     ...
    ├── Exercise N (last)
    │
    ▼
[Lesson Complete Screen]
    ├── Score: 8/10
    ├── XP earned: +85
    ├── Streak maintained: 🔥 Day 5
    ├── If perfect: special celebration animation
    │
    ▼
[Return to Adventure Path — next lesson unlocked]
```

---

# 8. Gamification & Retention Engine

## XP System
| Action | XP |
|--------|-----|
| Correct answer | 10 |
| Correct answer (no mistakes in lesson so far) | 15 (combo bonus) |
| Complete a lesson | 20 bonus |
| Perfect lesson (0 mistakes) | 50 bonus |
| Complete a module | 100 bonus |
| Daily streak maintained | 5 × streak_day_count (capped at 50) |

## Hearts / Lives System
- Users start with **5 hearts**
- Each wrong answer costs **1 heart**
- Hearts regenerate: **1 heart every 4 hours** (configurable in app_config)
- At 0 hearts: user must wait OR spend gems to refill
- "Practice mode" (review old lessons): no heart cost

## Streak System
- A "day" = at least 1 lesson completed in user's timezone
- Streak counter shows on home screen with fire emoji 🔥
- **Streak freeze**: costs 50 gems, auto-protects 1 missed day
- Push notification at user's chosen time: "Don't break your 12-day streak!"
- Milestone streaks (7, 30, 100, 365) unlock achievements

## Leaderboard
- Weekly leaderboard, resets every Monday
- Ranked by XP earned in current week
- Top 10 visible, user's position always shown
- Simple model: one global leaderboard per language pair (no divisions for MVP)

## Achievements (Starter Set)
| Slug | Condition | Title (FR) |
|------|-----------|------------|
| `first_lesson` | Complete 1 lesson | Première leçon! |
| `streak_7` | 7-day streak | Une semaine de feu! |
| `streak_30` | 30-day streak | Un mois incroyable! |
| `perfect_lesson` | Score 100% on a lesson | Perfection! |
| `module_master` | Complete a module | Maître du module |
| `speed_demon` | Complete a lesson in under 2 min | Éclair rapide! |
| `xp_1000` | Earn 1000 total XP | Mille points! |
| `polyglot_start` | Start learning a 2nd language | Polyglotte en herbe |

---

# 9. Curriculum Architecture

## Module Sequence for English (FR→EN)

### Difficulty 0 — Absolute Beginner
| # | Module Slug | Title (FR) | Topics |
|---|-------------|------------|--------|
| 1 | `alphabet_sounds` | L'Alphabet et les Sons | Letters A-Z, basic phonics, vowel sounds |
| 2 | `hello_goodbye` | Bonjour et Au Revoir | Hi, Hello, Goodbye, Please, Thank you, Sorry |
| 3 | `numbers_1_20` | Les Chiffres 1-20 | Counting, phone numbers, "how many" |
| 4 | `colors_shapes` | Couleurs et Formes | Basic colors, circle/square/triangle |

### Difficulty 1 — Beginner
| # | Module Slug | Title (FR) | Topics |
|---|-------------|------------|--------|
| 5 | `my_family` | Ma Famille | Mother, father, brother, sister, family vocab |
| 6 | `food_drink` | Nourriture et Boissons | Common foods, drinks, "I want...", "I like..." |
| 7 | `daily_routine` | Ma Journée | Wake up, eat, go to school/work, sleep |
| 8 | `my_body` | Mon Corps | Body parts, "my head hurts", basic health |
| 9 | `clothes` | Les Vêtements | Shirt, pants, shoes, "I'm wearing..." |
| 10 | `animals` | Les Animaux | Common animals, pets, "I have a..." |

### Difficulty 2 — Elementary
| # | Module Slug | Title (FR) | Topics |
|---|-------------|------------|--------|
| 11 | `at_the_restaurant` | Au Restaurant | Ordering food, menu reading, paying |
| 12 | `directions` | Les Directions | Left, right, straight, "Where is...?" |
| 13 | `shopping` | Faire du Shopping | Prices, sizes, "How much?", "Too expensive" |
| 14 | `weather_seasons` | Météo et Saisons | Hot, cold, rainy, spring/summer/fall/winter |
| 15 | `time_dates` | L'Heure et les Dates | Telling time, days, months, appointments |
| 16 | `hobbies` | Passe-temps | Sports, music, reading, "I like to..." |

### Difficulty 3 — Intermediate
| # | Module Slug | Title (FR) | Topics |
|---|-------------|------------|--------|
| 17 | `past_tense` | Le Passé | "I went", "I ate", irregular past verbs |
| 18 | `future_plans` | Projets Futurs | "I will", "I'm going to", making plans |
| 19 | `feelings_opinions` | Sentiments et Opinions | Happy, sad, angry, "I think that..." |
| 20 | `travel` | Voyager | Airport, hotel, taxi, "I'd like to book..." |
| 21 | `doctor_emergency` | Chez le Médecin | Symptoms, medicine, emergency phrases |
| 22 | `phone_email` | Téléphone et Email | Calling, texting, formal/informal writing |

### Difficulty 4 — Upper Intermediate
| # | Module Slug | Title (FR) | Topics |
|---|-------------|------------|--------|
| 23 | `work_office` | Au Bureau | Meeting vocab, presenting, "Could you...?" |
| 24 | `news_media` | Actualités | Reading headlines, discussing current events |
| 25 | `idioms_common` | Expressions Courantes | "Break a leg", "It's raining cats and dogs" |
| 26 | `conditionals` | Les Conditionnels | "If I were...", "I would have..." |

### Difficulty 5 — Advanced
| # | Module Slug | Title (FR) | Topics |
|---|-------------|------------|--------|
| 27 | `business_english` | Anglais des Affaires | Negotiation, formal emails, presentations |
| 28 | `academic_english` | Anglais Académique | Essay writing, citations, debate |
| 29 | `slang_culture` | Argot et Culture | Informal speech, cultural references |
| 30 | `mastery_review` | Révision Finale | Comprehensive review across all levels |

## Exercises Per Lesson
Each lesson contains **8-12 exercises** using a mix of mold types. The mix varies by difficulty:

| Level | Preferred Molds | Rationale |
|-------|----------------|-----------|
| 0 (Absolute Beginner) | image_select, listen_and_choose, flashcard, match_pairs | Visual/audio-heavy, minimal typing |
| 1 (Beginner) | fill_in_the_blank, match_pairs, speak_the_word, true_or_false | Some text, recognition-focused |
| 2 (Elementary) | translate_sentence, word_reorder, fill_in_the_blank, conversation_listen | More production, simple sentences |
| 3 (Intermediate) | translate_sentence, select_correct_verb, type_what_you_hear, conversation_listen | Grammar focus, longer sentences |
| 4 (Upper Inter.) | translate_sentence, conversation_listen, type_what_you_hear, word_reorder | Complex sentences, idioms |
| 5 (Advanced) | translate_sentence, type_what_you_hear, conversation_listen | Near-native comprehension |

---

# 10. Audio Pipeline — Synthesia / ElevenLabs

## What Needs Audio
Every piece of **Learning Language (English)** content that appears to the user should ideally have audio:
- Individual words (flashcards, vocabulary)
- Full sentences (exercises, examples)
- Conversations (dialogue exercises)

## Estimated Audio Count (MVP — 30 modules)
- ~30 modules × 5 lessons × 10 exercises = **1,500 exercises**
- Each exercise averages ~2 audio clips = **~3,000 audio files**
- Plus vocabulary words: ~50 per module × 30 = **~1,500 word audios**
- **Total estimate: ~4,500 audio files**

## ElevenLabs Strategy
ElevenLabs is the recommended tool (natural-sounding, many voices, API for batch generation).

### Voice Selection
- **Primary voice (male)**: Pick one clear, neutral American English voice
- **Secondary voice (female)**: For conversations and variety
- **Use consistent voices** across the entire curriculum for familiarity

### Audio File Naming Convention
```
{language_code}/{module_slug}/{type}_{sequence}.mp3

Examples:
en/hello_goodbye/word_hello.mp3
en/hello_goodbye/sentence_001.mp3
en/at_the_restaurant/conversation_001.mp3
```

### Batch Generation Script (to run via ElevenLabs API)
After generating all exercise content (see Section 11), export a CSV:
```csv
text,filename,voice_id
"Hello",en/hello_goodbye/word_hello.mp3,voice_abc123
"Good morning, how are you?",en/hello_goodbye/sentence_001.mp3,voice_abc123
```

Then run a batch script:
```python
# generate_audio.py — to be run AFTER content generation
import csv
import requests
import time
import os

API_KEY = "your_elevenlabs_api_key"
VOICE_ID = "your_chosen_voice_id"

with open("audio_manifest.csv") as f:
    reader = csv.DictReader(f)
    for row in reader:
        response = requests.post(
            f"https://api.elevenlabs.io/v1/text-to-speech/{row['voice_id']}",
            headers={"xi-api-key": API_KEY, "Content-Type": "application/json"},
            json={"text": row["text"], "model_id": "eleven_multilingual_v2"}
        )
        os.makedirs(os.path.dirname(row["filename"]), exist_ok=True)
        with open(row["filename"], "wb") as audio_file:
            audio_file.write(response.content)
        time.sleep(0.5)  # rate limit
```

### Upload to Supabase Storage
```bash
# After generating all audio files
for file in en/**/*.mp3; do
  supabase storage cp "$file" "audio/$file"
done
```

## Synthesia (Enterprise) — Future Use
Reserve Synthesia for **premium video lessons** — talking-head explanations of grammar concepts, cultural notes. Not needed for MVP but the architecture supports it (just add a `video_url` field to module or lesson content).

---

# 11. Content Generation Instructions — LLM Prompts

## Phase 1: Generate Module Content Skeleton

Feed this to Claude/GPT-4 to generate the curriculum JSON:

```
SYSTEM: You are a curriculum designer for a language learning app. You create
exercises in a specific JSON format. Every exercise has a "mold_type" that
determines its structure.

TASK: Generate all exercises for the module "{module_slug}" in the
"{AL_name} → {LL_name}" language pair.

Module info:
- Title: {title_al}
- Difficulty: {difficulty_level}
- Topics: {topics}
- Number of lessons: 5
- Exercises per lesson: 10

RULES:
1. Each lesson should use at least 4 different mold types
2. Vary difficulty within each lesson (start easy, build up)
3. Earlier exercises in a lesson should introduce vocabulary
   that later exercises test
4. ALL text shown to the user in the app must be in {AL_name} (the App Language)
5. The Learning Language content is in {LL_name}
6. Sentences should be natural, not textbook-stilted
7. For fill_in_the_blank: the blank word should be meaningful, not articles/prepositions
8. For translate_sentence: provide 2-3 accepted_answers with common variations
9. Include audio_url placeholders using the format:
   storage://audio/{ll_code}/{module_slug}/{type}_{seq}.mp3

OUTPUT FORMAT: Return a JSON array of lessons, each containing exercises.
Follow the exact mold schemas provided below:

{paste the mold catalog from Section 3}

Generate the complete module now.
```

## Phase 2: Generate UI Strings

```
SYSTEM: You are a localization expert. Generate all UI strings for a language
learning app in {language_name}.

OUTPUT: A JSON array of objects with keys: string_key, value, context_note

Generate strings for these categories:
- Onboarding (welcome, language selection, proficiency assessment)
- Navigation (home, leaderboard, profile, shop)
- Lesson flow (progress, hearts, correct/incorrect feedback)
- Gamification (streak messages, XP messages, achievement unlocks)
- Settings (notifications, daily goal, language switch)
- Errors (network error, login failed, etc.)
- Common buttons (next, continue, skip, try again, save, cancel)

Each string_key should use dot notation: "category.specific_name"
Example: "onboarding.welcome_title" → "Bienvenue sur LinguaMold!"
```

## Phase 3: Generate Audio Manifest

```
SYSTEM: Given the following exercise JSON data, extract every piece of
Learning Language text that needs audio and output a CSV with columns:
text, filename, voice_gender

Rules:
- Every LL sentence, word, or phrase needs audio
- Filename format: {ll_code}/{module_slug}/{type}_{sequence}.mp3
- For conversations: create one file per turn AND one combined file
- Deduplicate: if the same text appears in multiple exercises, only one audio file
```

## Phase 4: Backfill SQL Generation

```
SYSTEM: Given the following curriculum JSON, generate INSERT statements for
the Supabase PostgreSQL database. Use the exact table schemas provided.

Rules:
- Generate UUIDs using gen_random_uuid() in DEFAULT, or use deterministic
  UUIDs based on slugs for referenceability
- Exercise content goes in the JSONB "content" column
- Set is_published = true for all content
- Include display_order values
- Group by: languages → language_pairs → modules → lessons → exercises
```

---

# 12. Cursor Rules File

Save this as `.cursorrules` in your project root:

```
# ═══════════════════════════════════════════════════════
# LINGUAMOLD — CURSOR RULES
# ═══════════════════════════════════════════════════════

## IDENTITY
You are a senior full-stack mobile engineer building LinguaMold, a Duolingo-
style language learning app. You work methodically, writing production-grade
code. You never leave TODOs or placeholders.

## CONTEXT MANAGEMENT
1. ALWAYS read MASTER_STRATEGY.md before starting any task
2. After completing each major component, update PROGRESS.md with:
   - What was built
   - What changed from the plan (if anything)
   - What comes next
3. If you create a new file, add it to FILE_MANIFEST.md
4. If you create SQL migrations, add them to migrations/ folder with
   sequential numbering: 001_languages.sql, 002_modules.sql, etc.

## TECH STACK (NEVER DEVIATE)
- Expo SDK 52+ with Expo Router
- React Native with TypeScript (strict mode)
- Supabase JS client (@supabase/supabase-js)
- Zustand for state management
- React Native Reanimated for animations
- expo-av for audio
- expo-notifications for push notifications
- No Tailwind, No NativeWind — use StyleSheet.create()

## CODE STYLE
- TypeScript strict: no `any` types
- All components are functional with hooks
- Use named exports, not default exports
- File names: PascalCase for components, camelCase for hooks/utils
- Hooks prefix: use* (useAuth, useStreak, etc.)
- All Supabase queries go through hook functions, never inline in components

## MOLD SYSTEM RULES
- Every mold component implements the MoldProps interface
- Mold components are PURE renderers — they receive data, render UI, report answers
- Scoring logic lives in hooks, not in mold components
- New mold types can be added by: (1) creating component, (2) adding to MoldRegistry,
  (3) defining JSONB schema — NO other changes needed

## DATABASE RULES
- NEVER run migrations directly. Output all SQL to files in migrations/
- Each migration file is self-contained and idempotent (use IF NOT EXISTS)
- Always include RLS policies with migrations
- Use gen_random_uuid() for PKs
- All timestamps are TIMESTAMPTZ DEFAULT NOW()
- Index any column used in WHERE clauses

## SUPABASE EDGE FUNCTIONS
- Write in TypeScript (Deno runtime)
- Output to edge-functions/{function-name}/index.ts
- Include the deploy command as a comment at top of file
- Never hardcode secrets — use Deno.env.get()

## UI/UX RULES
- Support RTL layouts from day 1 (use I18nManager)
- ALL user-facing strings come from ui_strings table via useUIString hook
- Never hardcode text in components
- Color palette: define in theme.ts, reference everywhere
- Animations: celebrate correct answers (confetti/glow), gentle shake on wrong
- Adventure path: vertical ScrollView with nodes connected by a curved line

## DESIGN PRIMITIVES
Primary: #58CC02 (Duolingo green — success, correct)
Secondary: #FF4B4B (error, hearts, wrong)
Accent: #FFD900 (XP, streaks, gems)
Background: #131F24 (dark mode default)
Surface: #1A2C34
Text Primary: #FFFFFF
Text Secondary: #AFAFAF
Card: #233A44
Correct Glow: rgba(88, 204, 2, 0.3)
Error Glow: rgba(255, 75, 75, 0.3)

Font Family: System default (SF Pro on iOS, Roboto on Android)
Heading: 24px bold
Body: 16px regular
Caption: 12px regular
Button: 16px bold, uppercase

Spacing scale: 4, 8, 12, 16, 24, 32, 48

## SUPERADMIN RULES
- Admin mode is a toggle, not a separate app
- Admin UI overlays the normal UI with edit capabilities
- When admin taps text, it becomes a TextInput with Save/Cancel
- Admin changes update exercises.content JSONB directly
- Admin reorder changes update display_order integers

## WORKING PATTERN
1. Start with database migrations (output SQL files)
2. Build Supabase client + auth flow
3. Build theme + design primitives
4. Build mold components (one at a time, test each)
5. Build lesson engine (the core loop)
6. Build adventure path (home screen)
7. Build gamification (XP, streaks, hearts, leaderboard)
8. Build onboarding (language select, proficiency, placement)
9. Build admin overlay
10. Build edge functions
11. Polish: animations, transitions, error states

## ERROR HANDLING
- Every Supabase call wrapped in try/catch
- Show user-friendly error messages (from ui_strings)
- Offline detection: show banner, queue actions
- Never crash on missing data — show graceful fallbacks

## STAY PERSISTENT
- If you encounter an error, fix it and continue
- If a package install fails, try an alternative approach
- Keep going until the entire app is built
- Do not stop to ask questions — make reasonable assumptions and document them
```

---

# 13. The Overnight Build — Execution Plan

## Pre-Build Setup (15 minutes, done by you)

```bash
# 1. Create the project
npx create-expo-app@latest linguamold --template tabs
cd linguamold

# 2. Install dependencies
npx expo install @supabase/supabase-js
npx expo install expo-av expo-notifications expo-secure-store
npx expo install react-native-reanimated react-native-gesture-handler
npm install zustand
npm install @react-native-async-storage/async-storage

# 3. Create the context files
mkdir -p context migrations edge-functions
# Copy MASTER_STRATEGY.md into context/
# Copy .cursorrules into project root

# 4. Create PROGRESS.md
echo "# Build Progress\n\n## Status: Not Started" > PROGRESS.md

# 5. Create FILE_MANIFEST.md
echo "# File Manifest\n\nAll files created during build:" > FILE_MANIFEST.md

# 6. Open in Cursor, enable terminal access
```

## The Prompts — Sequential Feed to Cursor Composer

### PROMPT 1 — Foundation (Estimated: 20 min)
```
Read the MASTER_STRATEGY.md file in context/. This is your complete blueprint.

TASK 1: Create the following foundation files:
1. All SQL migration files in migrations/ (numbered 001 through 015)
   following the exact schemas in Section 4
2. lib/supabase.ts — Supabase client initialization
3. lib/constants.ts — all constants
4. components/ui/theme.ts — complete design token system
5. components/ui/Text.tsx, Button.tsx, Card.tsx, Input.tsx — base primitives
6. types/ folder with all TypeScript interfaces matching the DB schema

After completing, update PROGRESS.md and FILE_MANIFEST.md.
```

### PROMPT 2 — Auth + Onboarding (Estimated: 25 min)
```
Continue building LinguaMold. Read PROGRESS.md for current state.

TASK 2: Build the complete authentication and onboarding flow:
1. stores/authStore.ts — Zustand store for auth state
2. hooks/useAuth.ts — login, register, logout, session management
3. app/(auth)/login.tsx — email/password login screen
4. app/(auth)/register.tsx — registration screen
5. app/_layout.tsx — root layout with auth check and redirect logic
6. app/(onboarding)/select-language.tsx — LL picker screen
7. app/(onboarding)/proficiency.tsx — self-assessment (4 levels)
8. hooks/useUIString.ts — the t() function that reads from ui_strings
9. hooks/useLanguagePair.ts — manages AL/LL state

All screens should be fully styled using theme.ts primitives.
Update PROGRESS.md and FILE_MANIFEST.md.
```

### PROMPT 3 — Mold Components (Estimated: 40 min)
```
Continue building LinguaMold. Read PROGRESS.md.

TASK 3: Build ALL 12 mold components + the mold registry:
1. lib/mold-registry.ts
2. components/molds/FillInTheBlank.tsx
3. components/molds/TranslateSentence.tsx
4. components/molds/WordReorder.tsx
5. components/molds/ListenAndChoose.tsx
6. components/molds/SpeakTheWord.tsx
7. components/molds/MatchPairs.tsx
8. components/molds/ImageSelect.tsx
9. components/molds/ConversationListen.tsx
10. components/molds/SelectCorrectVerb.tsx
11. components/molds/Flashcard.tsx
12. components/molds/TypeWhatYouHear.tsx
13. components/molds/TrueOrFalse.tsx

Each component must:
- Implement MoldProps interface
- Handle correct/incorrect states with animations
- Show success/error messages from exercise content
- Support isAdminMode prop for inline editing
- Use AudioPlayer for any audio content
- Be fully styled with theme tokens

Also build:
14. components/common/AudioPlayer.tsx
15. lib/scoring.ts — answer validation logic for each mold type

Update PROGRESS.md and FILE_MANIFEST.md.
```

### PROMPT 4 — Lesson Engine + Adventure Path (Estimated: 30 min)
```
Continue building LinguaMold. Read PROGRESS.md.

TASK 4: Build the core lesson engine and home screen:
1. hooks/useExerciseEngine.ts — loads exercises for a lesson, tracks
   current index, handles answer submission, calculates score
2. app/lesson/[lessonId].tsx — the lesson screen that renders molds
   in sequence with progress bar and hearts
3. components/gamification/ProgressBar.tsx
4. components/gamification/HeartDisplay.tsx
5. components/gamification/CelebrationOverlay.tsx — confetti animation
   on lesson complete
6. Lesson complete screen showing score, XP, streak status

7. components/adventure/AdventurePath.tsx — the vertical scrollable path
8. components/adventure/ModuleNode.tsx — each bubble with icon + progress ring
9. components/adventure/PathConnector.tsx — curved lines between nodes
10. app/(main)/home.tsx — main home tab integrating the adventure path

11. hooks/useModules.ts — fetch modules for current language pair
12. hooks/useLessons.ts — fetch lessons for a module
13. stores/lessonStore.ts — Zustand store for lesson state

Update PROGRESS.md and FILE_MANIFEST.md.
```

### PROMPT 5 — Gamification (Estimated: 20 min)
```
Continue building LinguaMold. Read PROGRESS.md.

TASK 5: Build the full gamification system:
1. hooks/useXP.ts — XP earning, logging, total calculation
2. hooks/useStreak.ts — streak tracking, freeze logic
3. hooks/useHearts.ts — hearts with regeneration timer
4. hooks/useLeaderboard.ts — weekly leaderboard data
5. hooks/useAchievements.ts — check + unlock achievements

6. components/gamification/XPBar.tsx — animated XP gain bar
7. components/gamification/StreakBadge.tsx — fire emoji + counter
8. components/gamification/LeaderboardRow.tsx
9. components/gamification/AchievementToast.tsx — popup on unlock

10. app/(main)/leaderboard.tsx — leaderboard tab
11. app/(main)/profile.tsx — profile + stats + settings tab
12. stores/gamificationStore.ts

13. Edge function: edge-functions/calculate-streak/index.ts
14. Edge function: edge-functions/update-leaderboard/index.ts

Update PROGRESS.md and FILE_MANIFEST.md.
```

### PROMPT 6 — SuperAdmin (Estimated: 20 min)
```
Continue building LinguaMold. Read PROGRESS.md.

TASK 6: Build the complete SuperAdmin system:
1. hooks/useAdminMode.ts — toggle admin, check role
2. stores/adminStore.ts
3. components/admin/AdminToggleBar.tsx — orange bar with AL/LL selectors
4. components/admin/InlineEditor.tsx — tap-to-edit with Save/Cancel
5. components/admin/ReorderableList.tsx — drag to reorder items

6. app/(admin)/_layout.tsx
7. app/(admin)/index.tsx — AL/LL selector entry point
8. app/(admin)/modules.tsx — reorderable module list
9. app/(admin)/lessons/[moduleId].tsx — lesson management
10. app/(admin)/exercises/[lessonId].tsx — exercise inline editing

Admin must be able to:
- Tap any text field in any exercise → edit it
- Save → updates exercises.content JSONB
- Reorder modules and lessons via drag
- Toggle exercise published/unpublished

Update PROGRESS.md and FILE_MANIFEST.md.
```

### PROMPT 7 — Placement Test + Polish (Estimated: 20 min)
```
Continue building LinguaMold. Read PROGRESS.md.

TASK 7: Build placement test and final polish:
1. app/(onboarding)/placement-test.tsx — 15 exercises spanning all
   difficulty levels, adaptive (if user gets 3 wrong in a row at a
   level, stop and assign that level)
2. hooks/usePlacementTest.ts — adaptive logic

3. Tab navigation: app/(main)/_layout.tsx with 4 tabs
   (Home, Leaderboard, Profile, Browse)
4. app/(main)/shop.tsx — gems shop (hearts refill, streak freeze)

5. Polish all screens:
   - Loading states (skeleton screens)
   - Empty states
   - Error states with retry
   - Smooth transitions between screens
   - Haptic feedback on correct/incorrect (expo-haptics)

6. Generate seed data: Create a comprehensive seed SQL file
   (migrations/999_seed_data.sql) that includes:
   - Languages: French, English
   - Language pair: FR→EN
   - First 3 modules with complete lessons and exercises
   - Sample UI strings in French
   - Sample achievements
   - App config values

Update PROGRESS.md and FILE_MANIFEST.md.
MARK BUILD AS COMPLETE.
```

---

# 14. Supabase Migrations — Complete SQL

All migrations should be output to numbered files. Here is the execution order:

```
migrations/
├── 001_languages.sql
├── 002_language_pairs.sql
├── 003_modules.sql
├── 004_lessons.sql
├── 005_exercises.sql
├── 006_user_profiles.sql
├── 007_user_progress.sql
├── 008_user_exercise_attempts.sql
├── 009_user_streaks.sql
├── 010_user_xp_log.sql
├── 011_leaderboard.sql
├── 012_achievements.sql
├── 013_user_achievements.sql
├── 014_ui_strings.sql
├── 015_app_config.sql
├── 016_rls_policies.sql
├── 017_indexes.sql
├── 018_storage_buckets.sql
├── 999_seed_data.sql
```

### 018 — Storage Buckets
```sql
-- Run via Supabase Dashboard → Storage
-- Create buckets:
-- 1. "audio" — public read, authenticated write
-- 2. "images" — public read, authenticated write

-- RLS for storage (via Dashboard):
-- SELECT: allow public
-- INSERT: allow authenticated + role = 'superadmin'
-- UPDATE: allow authenticated + role = 'superadmin'
-- DELETE: allow authenticated + role = 'superadmin'
```

---

# 15. Edge Functions Spec

### `calculate-streak`
**Trigger**: Called after each lesson completion.
**Logic**:
1. Check if user has a streak entry for today → if not, create one
2. Check if yesterday has an entry → if yes, increment streak; if no, check for streak freeze
3. Update user_profiles.current_streak and longest_streak
4. Check for streak-based achievements

### `update-leaderboard`
**Trigger**: Called after XP is earned.
**Logic**:
1. Get current week's start date (Monday)
2. Upsert leaderboard entry for user + language_pair + week
3. Recalculate ranks for the language_pair + week
4. Return user's new rank

### `heart-regen`
**Trigger**: Called when app opens or when hearts are displayed.
**Logic**:
1. Check hearts_last_regen timestamp
2. Calculate elapsed time
3. Add hearts (1 per 4 hours, capped at 5)
4. Update hearts and hearts_last_regen

### `placement-score`
**Trigger**: Called after placement test completion.
**Logic**:
1. Receive array of (exercise_id, is_correct, difficulty) tuples
2. Find highest difficulty level where user got ≥ 60% correct
3. Set user's proficiency_level
4. Unlock all modules up to that level
5. Return assigned module starting point

---

# 16. Post-Build Checklist

## Immediately After Build
- [ ] Review all migration SQL files
- [ ] Run migrations in Supabase (in order)
- [ ] Create storage buckets in Supabase
- [ ] Deploy edge functions
- [ ] Run seed data
- [ ] Test login/register flow
- [ ] Test one complete lesson flow
- [ ] Test admin inline editing

## Content Generation Phase (Day 2)
- [ ] Use LLM prompts from Section 11 to generate all 30 modules of content
- [ ] Review generated content for accuracy (especially FR translations)
- [ ] Generate audio manifest CSV
- [ ] Run ElevenLabs batch generation
- [ ] Upload audio files to Supabase Storage
- [ ] Generate and insert all UI strings
- [ ] Run complete backfill SQL

## Pre-Launch
- [ ] Full regression test of all 12 mold types
- [ ] Test RTL readiness (set up Farsi language pair)
- [ ] Performance test with full dataset
- [ ] Set up Expo EAS builds for iOS and Android
- [ ] Configure push notifications via Expo
- [ ] Set up error tracking (Sentry)

## Monetization Ready
- [ ] Add RevenueCat or Expo IAP for subscription
- [ ] Free tier: 1 lesson/day, basic modules
- [ ] Premium: unlimited lessons, all modules, no ads, streak freeze included
- [ ] Price: $4.99/month or $29.99/year

---

# APPENDIX A: Cursor vs Factory AI + Kimi 2.5

## Recommendation: Start with Cursor

| Factor | Cursor | Factory + Kimi 2.5 |
|--------|--------|---------------------|
| Composer limits | Generous (especially Pro) | Varies |
| Code quality | Excellent with Claude/GPT-4 | Kimi 2.5 is good but less tested for RN |
| Terminal access | Native | May require setup |
| Context window | Large (reads files) | Large (Kimi 2.5 has 1M tokens) |
| Ecosystem | Mature, many Cursor rules available | Newer, less community support |
| **Verdict** | **Use for overnight build** | Backup for content generation |

## Hybrid Approach
1. **Cursor** → all frontend + backend code (7 prompts above)
2. **Factory + Kimi 2.5** → curriculum content generation (massive context, cheap tokens, perfect for generating thousands of exercise JSONs)

---

# APPENDIX B: Scaling to Farsi and Beyond

When ready to add Farsi as an AL:

1. Add Farsi to `languages` table (code: 'fa', direction: 'rtl')
2. Create language_pair: FA→EN
3. Use LLM to generate all UI strings in Farsi
4. Use LLM to generate all exercise content with Farsi AL text
5. The frontend already supports RTL (built from day 1)
6. All mold components render correctly because they use ui_strings
7. SuperAdmin can review/edit all Farsi content inline

**Time estimate to add a new AL**: 1-2 days (mostly content generation + QA)
**Time estimate to add a new LL**: 3-5 days (new curriculum + audio generation)

---

# APPENDIX C: Key Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| Cursor stops mid-build (context limit) | Split into 7 focused prompts, each independent |
| Supabase free tier limits | Start with small seed data, scale after validation |
| Audio generation takes too long | Start with Module 1-3 only, add incrementally |
| RTL breaks layout | Test with Farsi language pair early, use flexDirection awareness |
| Exercise content quality | Human review all generated content before publishing |
| Placement test accuracy | Use adaptive algorithm, refine thresholds with real data |
| App Store rejection | Follow Apple/Google guidelines from day 1, no manipulative dark patterns |

---

*This document is the single source of truth for the LinguaMold overnight build.*
*Last updated: March 2026*
*Version: 1.0*