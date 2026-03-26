# PHASE 1 — FOUNDATION

## Context
You are building LinguaMold. If you haven't already, read `context/MASTER_STRATEGY.md` for the full architecture and `.cursorrules` for coding standards.

## Tasks

### 1.1 — SQL Migrations
Create all migration files in `migrations/`. Each file must be self-contained and idempotent (use IF NOT EXISTS, CREATE OR REPLACE, etc.). Reference the exact schemas from Section 4 of MASTER_STRATEGY.md.

Create these files:
- `migrations/001_languages.sql` — languages table + seed French and English
- `migrations/002_language_pairs.sql` — language_pairs table + seed FR→EN pair
- `migrations/003_modules.sql` — modules table
- `migrations/004_lessons.sql` — lessons table
- `migrations/005_exercises.sql` — exercises table with JSONB content column + indexes
- `migrations/006_user_profiles.sql` — user_profiles table (extends auth.users)
- `migrations/007_user_progress.sql` — user_module_progress + user_lesson_progress tables
- `migrations/008_user_exercise_attempts.sql` — user_exercise_attempts table + indexes
- `migrations/009_user_streaks.sql` — user_streaks table + indexes
- `migrations/010_user_xp_log.sql` — user_xp_log table
- `migrations/011_leaderboard.sql` — leaderboard table + indexes
- `migrations/012_achievements.sql` — achievements table
- `migrations/013_user_achievements.sql` — user_achievements table
- `migrations/014_ui_strings.sql` — ui_strings table + indexes
- `migrations/015_app_config.sql` — app_config table
- `migrations/016_rls_policies.sql` — ALL Row Level Security policies for ALL tables (superadmin full access, users read published + own data)
- `migrations/017_indexes.sql` — any additional indexes not already created
- `migrations/018_storage_buckets.sql` — SQL comments documenting the storage buckets to create manually (audio, images)

### 1.2 — TypeScript Types
Create `types/index.ts` with complete TypeScript interfaces for EVERY database table. Also create:
- `types/molds.ts` — MoldType enum, MoldProps interface, content types for each mold
- `types/navigation.ts` — route parameter types for Expo Router
- `types/supabase.ts` — Supabase Database type (generated-style, matching the schema)

### 1.3 — Supabase Client
Create `lib/supabase.ts`:
- Initialize Supabase client using env vars (EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY)
- Use @react-native-async-storage/async-storage for session persistence
- Export the typed client

### 1.4 — Constants
Create `lib/constants.ts`:
- All gamification constants (XP values, heart max, regen time, etc.)
- Mold type string constants
- Storage bucket URLs
- Any other magic values

### 1.5 — Design System
Create `components/ui/theme.ts`:
- Complete color palette (exact hex values from .cursorrules)
- Typography scale (sizes, weights, lineHeights)
- Spacing scale
- Border radii
- Shadow definitions for iOS and Android
- Export everything as typed constants

### 1.6 — UI Primitives
Create base components that ALL other components will use:
- `components/ui/Text.tsx` — Themed text with variants (h1, h2, h3, body, caption, button). Respects RTL via writingDirection.
- `components/ui/Button.tsx` — Primary, secondary, outline, ghost variants. Animated press feedback.
- `components/ui/Card.tsx` — Elevated surface with theme colors.
- `components/ui/Input.tsx` — Text input with label, error state, themed styling.
- `components/ui/ScreenContainer.tsx` — SafeAreaView wrapper with background color.

### 1.7 — Update Tracking
Update PROGRESS.md: mark Phase 1 as COMPLETE, list all files created.
Update FILE_MANIFEST.md: add every file path.

## Completion Criteria
- [ ] All 18 migration SQL files exist and are valid SQL
- [ ] Types cover every table and mold type
- [ ] Supabase client initializes without errors
- [ ] Theme file exports all design tokens
- [ ] All 5 UI primitives render correctly
- [ ] No TypeScript errors

## WHEN DONE: Proceed immediately to phases/PHASE_2.md
