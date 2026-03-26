# PHASE 7 — PLACEMENT TEST + POLISH + SEED DATA

## Context
Phase 6 is complete. The full app exists: auth, onboarding, 12 mold types, lesson engine, adventure path, gamification, and SuperAdmin. This final phase adds the placement test, the gems shop, seed data, and polishes everything. This is the LAST phase. When done, the app should be functional end-to-end.

## Tasks

### 7.1 — Placement Test

- `hooks/usePlacementTest.ts`:
  - Loads a special "placement" lesson containing ~15 exercises spanning difficulties 0-5
  - Adaptive algorithm:
    - Start with difficulty 1 exercises
    - If user gets 2 correct in a row → jump up a difficulty level
    - If user gets 2 wrong in a row → stop testing higher and assign current level
    - Minimum 8 exercises, maximum 15
  - On completion: calculates proficiency_level (the highest difficulty where user scored ≥ 60%)
  - Updates user_profiles.proficiency_level
  - Unlocks all modules up to and including that difficulty level (sets user_module_progress.status = 'available')
  - Returns the recommended starting module

- `app/(onboarding)/placement-test.tsx`:
  - Uses the same lesson screen layout (progress bar, exercises, mold rendering)
  - But with adaptive logic from usePlacementTest instead of linear progression
  - No hearts (placement test is free)
  - On completion: shows "Your level: {level_name}" screen with:
    - Level name in AL (e.g., "Intermédiaire")
    - Brief description of what this means
    - "Start Learning!" button → navigates to home with recommended module highlighted

### 7.2 — Browse / Explore Tab
- `app/(main)/browse.tsx`:
  - All modules displayed in a grid (not path format)
  - Grouped by difficulty level with section headers
  - Each module card: icon, title, difficulty badge, completion ring
  - Locked modules show lock overlay
  - Tap unlocked module → same lesson picker from Phase 4
  - Search/filter bar at top (filter by difficulty or search by title)

### 7.3 — Gems Shop
- `app/(main)/shop.tsx`:
  - Header: current gems count with gem icon
  - Shop items as cards:
    - "Refill Hearts" — 50 gems — restores hearts to 5
    - "Streak Freeze" — 100 gems — protects 1 missed day
    - "Double XP (1 hour)" — 200 gems — future feature, show as "Coming Soon"
  - Tap item → confirmation modal → deduct gems → apply effect
  - "Get More Gems" section (placeholder for IAP — shows "Coming Soon")
  - For MVP: users start with 500 gems (generous for testing)

### 7.4 — Notifications Setup
- `lib/notifications.ts`:
  - `registerForNotifications()` — requests permission, gets expo push token
  - `scheduleStreakReminder(time: string)` — schedules daily local notification at user's preferred time
  - `cancelAllNotifications()`
  - Messages in AL via t() function:
    - "Don't lose your {streak} day streak! 🔥"
    - "Time to practice! Your daily lesson awaits."

### 7.5 — Loading States
Add proper loading states to ALL screens that fetch data:
- `components/common/SkeletonLoader.tsx` — pulsing gray placeholder blocks
- Add skeleton loaders to: home screen (adventure path), leaderboard, profile, lesson loading, module detail
- Ensure no screen ever shows a blank white/black page while loading

### 7.6 — Error States
- `components/common/ErrorState.tsx` — Shows error icon + message + "Try Again" button
- `components/common/EmptyState.tsx` — Shows illustration + message for empty lists
- `components/common/OfflineBanner.tsx` — Banner at top when no internet connection detected
- Add error boundaries around main screens
- Every Supabase call should show ErrorState on failure with retry

### 7.7 — Screen Transitions + Polish
- Add smooth transitions between screens (Expo Router supports shared element transitions)
- Add haptic feedback (expo-haptics):
  - Light impact on button press
  - Success notification on correct answer
  - Error notification on wrong answer
  - Heavy impact on achievement unlock
- Ensure all animations complete without jank
- Check that the adventure path scrolls smoothly with 30 module nodes

### 7.8 — Seed Data (CRITICAL)
Create `migrations/999_seed_data.sql` — a comprehensive seed file that populates:

**Languages:**
- French (fr, Français, ltr, 🇫🇷)
- English (en, English, ltr, 🇬🇧)

**Language Pairs:**
- French → English (active)

**Modules (first 3 fully seeded):**

1. **Module: hello_goodbye** (Difficulty 0 — "Bonjour et Au Revoir")
   - 3 lessons, 8-10 exercises each
   - Exercises teach: Hello, Hi, Good morning, Good evening, Good night, Goodbye, Please, Thank you, Sorry, Excuse me, Yes, No
   - Mix of mold types: image_select, listen_and_choose, flashcard, match_pairs, fill_in_the_blank

2. **Module: numbers_1_20** (Difficulty 0 — "Les Chiffres 1-20")
   - 3 lessons, 8-10 exercises each
   - Exercises teach: numbers 1-20, "how many", "phone number"
   - Mold types: flashcard, listen_and_choose, type_what_you_hear, fill_in_the_blank

3. **Module: my_family** (Difficulty 1 — "Ma Famille")
   - 3 lessons, 8-10 exercises each
   - Exercises teach: mother, father, brother, sister, son, daughter, family, "This is my..."
   - Mold types: match_pairs, fill_in_the_blank, translate_sentence, word_reorder, select_correct_verb

**Each exercise must have COMPLETE content JSONB** — all AL text in French, all LL text in English, all options, correct answers, error explanations in French, audio_url placeholders.

**UI Strings:** Generate at least 80 French UI strings covering:
- Auth screens (10 strings)
- Onboarding (10 strings)
- Navigation/tabs (8 strings)
- Lesson flow (15 strings): progress, hearts, correct/wrong messages, lesson complete
- Gamification (15 strings): streak messages, XP, leaderboard, achievements
- Shop (8 strings)
- Profile/Settings (10 strings)
- Errors/empty states (8 strings)
- Common buttons (6 strings): next, continue, skip, try again, save, cancel

**Achievements (8 starter achievements):**
- first_lesson, streak_7, streak_30, perfect_lesson, module_master, speed_demon, xp_1000, polyglot_start

**App Config:**
- hearts_max: 5
- hearts_regen_minutes: 240
- xp_correct: 10
- xp_combo: 15
- xp_lesson_complete: 20
- xp_perfect_lesson: 50
- xp_module_complete: 100
- streak_freeze_cost: 100
- placement_exercise_count: 15
- starting_gems: 500

**Also create remaining module shells (modules 4-30):** Just the module rows with title, description, difficulty, display_order, is_published=false. No lessons/exercises needed — these will be filled later via content generation.

### 7.9 — Final Quality Gate
Run these commands and fix ALL issues:
```bash
npx tsc --noEmit
npx expo doctor
```

### 7.10 — Final PROGRESS.md Update
Update PROGRESS.md with:
```
Status: **BUILD COMPLETE** ✅

## Summary
- Total files created: {count}
- Migration files: 19 (001-018 + 999_seed)
- Edge functions: 2 (calculate-streak, update-leaderboard)
- Screens: {count}
- Components: {count}
- Hooks: {count}
- Stores: {count}

## What Works
{list everything functional}

## Manual Steps Required
1. Run all migrations in Supabase SQL Editor (in order 001-999)
2. Create storage buckets (audio, images) in Supabase Dashboard
3. Deploy edge functions via Supabase CLI
4. Update .env with real Supabase URL and anon key
5. Create a superadmin user (register normally, then update role in Supabase)
6. Generate audio files via ElevenLabs (see MASTER_STRATEGY.md Section 10)
7. Generate remaining module content via LLM (see MASTER_STRATEGY.md Section 11)

## Known Limitations
{list any features that were simplified or skipped}
```

## Completion Criteria
- [ ] Placement test works with adaptive logic
- [ ] Browse tab shows all modules in grid
- [ ] Shop allows spending gems for hearts and streak freeze
- [ ] All screens have loading and error states
- [ ] Seed data is comprehensive (3 full modules, 80+ UI strings, achievements, config)
- [ ] Haptic feedback on interactions
- [ ] No TypeScript errors
- [ ] PROGRESS.md shows BUILD COMPLETE

## 🎉 BUILD IS DONE. 

Update FILE_MANIFEST.md one final time. The app is ready for manual Supabase setup and testing.
