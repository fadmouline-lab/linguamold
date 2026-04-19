# Prompt: Generate ui_strings INSERT Statements

Copy this entire prompt, fill in the placeholders, then paste into Claude or GPT-4.

---

## YOUR INPUTS (fill these in before pasting)

- **Language code:** {{LANGUAGE_CODE}}  _(e.g. "fr" for French, "es" for Spanish)_
- **Language UUID:** {{LANGUAGE_ID}}  _(UUID from the `languages` table for this language)_
- **Language name:** {{LANGUAGE_NAME}}  _(e.g. "French")_

---

## PROMPT START — paste everything below this line

You are generating localized UI strings for LinguaMold, a language learning app. The app uses a `ui_strings` table to store all user-facing text. Your output must be valid PostgreSQL `INSERT` statements.

**Language:** {{LANGUAGE_NAME}} (code: `{{LANGUAGE_CODE}}`)
**Language UUID:** `{{LANGUAGE_ID}}`

Generate `INSERT INTO public.ui_strings (string_key, language_id, value)` statements for ALL of the following string keys. Translate each value into {{LANGUAGE_NAME}}. Keep translations natural and idiomatic — these appear in a mobile language learning app aimed at adult learners.

**Output format:**
```sql
INSERT INTO public.ui_strings (string_key, language_id, value)
VALUES
  ('KEY', '{{LANGUAGE_ID}}', 'TRANSLATION'),
  ...
ON CONFLICT (string_key, language_id) DO UPDATE SET value = EXCLUDED.value;
```

---

## STRING KEYS TO GENERATE (80+ keys)

### Authentication
- `auth.login_title` — Screen title for login page
- `auth.register_title` — Screen title for register page
- `auth.email` — Label for email input field
- `auth.password` — Label for password input field
- `auth.display_name` — Label for display name input field
- `auth.sign_in` — Button text: sign in
- `auth.sign_up` — Button text: sign up / register
- `auth.no_account` — "Don't have an account?"
- `auth.have_account` — "Already have an account?"
- `auth.forgot_password` — "Forgot your password?"
- `auth.reset_sent` — "Password reset email sent."
- `auth.error_invalid` — "Invalid email or password."
- `auth.error_generic` — "An error occurred. Please try again."

### Onboarding
- `onboarding.select_ll_title` — "What language do you want to learn?"
- `onboarding.select_ll_sub` — "Choose your target language."
- `onboarding.continue` — Button: continue
- `onboarding.proficiency_title` — "What's your level?"
- `onboarding.proficiency_sub` — "Help us personalize your path."
- `onboarding.level_beginner_0` — "Complete beginner"
- `onboarding.level_beginner_0_desc` — "I have no knowledge"
- `onboarding.level_beginner_1` — "Beginner"
- `onboarding.level_beginner_1_desc` — "I know a few words"
- `onboarding.level_intermediate` — "Intermediate"
- `onboarding.level_intermediate_desc` — "I can hold a basic conversation"
- `onboarding.level_advanced` — "Advanced"
- `onboarding.level_advanced_desc` — "I want to perfect my level"

### Navigation
- `nav.home` — Tab label: Home
- `nav.leaderboard` — Tab label: Leaderboard / Rankings
- `nav.profile` — Tab label: Profile
- `nav.browse` — Tab label: Browse / Explore
- `nav.shop` — Tab label: Shop

### Common Actions
- `common.next` — "Next"
- `common.continue` — "Continue"
- `common.skip` — "Skip"
- `common.try_again` — "Try again"
- `common.save` — "Save"
- `common.cancel` — "Cancel"
- `common.loading` — "Loading…"
- `common.close` — "Close"
- `common.back` — "Back"
- `common.confirm` — "Confirm"
- `common.done` — "Done"
- `common.edit` — "Edit"
- `common.delete` — "Delete"

### Errors & Empty States
- `error.network` — "Connection problem."
- `error.empty` — "Nothing to display."
- `error.load_failed` — "Failed to load. Tap to retry."
- `error.submit_failed` — "Could not submit. Please try again."

### Lesson Flow
- `lesson.progress` — "Progress"
- `lesson.hearts` — "Lives"
- `lesson.correct` — "Correct!"
- `lesson.wrong` — "Not quite…"
- `lesson.complete_title` — "Lesson complete!"
- `lesson.complete_subtitle` — "Great work!"
- `lesson.no_hearts` — "No lives left. Come back later or buy lives."
- `lesson.xp_earned` — "XP earned"
- `lesson.perfect` — "Perfect lesson!"
- `lesson.locked` — "Locked"

### Exercise Interactions
- `exercise.check` — Button: Check / Verify answer
- `exercise.hint` — "Hint"
- `exercise.self_correct` — "I got it right" (speak_the_word self-assess)
- `exercise.self_practice` — "I need more practice" (speak_the_word self-assess)
- `exercise.transcript` — "Transcript"
- `exercise.true` — "True"
- `exercise.false` — "False"
- `exercise.tap_to_hear` — "Tap to listen"
- `exercise.type_answer` — Placeholder for text input: "Type your answer…"
- `exercise.word_bank` — "Word bank"

### Gamification
- `gamify.xp` — "XP"
- `gamify.streak` — "Streak"
- `gamify.gems` — "Gems"
- `gamify.hearts` — "Hearts"
- `gamify.leaderboard_weekly` — "Weekly leaderboard"
- `gamify.achievements` — "Achievements"
- `gamify.rank` — "Rank"
- `gamify.level` — "Level"
- `gamify.combo` — "Combo!"
- `gamify.streak_days` — "{n} day streak" (use {n} as placeholder)

### Shop
- `shop.title` — "Shop"
- `shop.refill_hearts` — "Refill hearts"
- `shop.streak_freeze` — "Streak freeze"
- `shop.coming_soon` — "Coming soon"
- `shop.purchase_success` — "Purchase successful!"
- `shop.not_enough_gems` — "Not enough gems."
- `shop.hearts_full` — "Hearts already full."

### Profile
- `profile.settings` — "Settings"
- `profile.logout` — "Log out"
- `profile.learning_since` — "Learning since"
- `profile.daily_goal` — "Daily goal"
- `profile.notifications` — "Daily reminders"
- `profile.total_xp` — "Total XP"
- `profile.current_streak` — "Current streak"
- `profile.longest_streak` — "Longest streak"
- `profile.achievements_count` — "Achievements"

### Browse
- `browse.search` — Placeholder: "Search modules…"
- `browse.all` — "All"
- `browse.difficulty_filter` — "Filter by difficulty"
- `browse.no_results` — "No modules found."

### Admin
- `admin.enter` — "Enter admin mode"
- `admin.bar` — "[ADMIN]" (keep as-is or localize the word ADMIN)
- `admin.save` — "Save"
- `admin.cancel` — "Cancel"
- `admin.reorder` — "Reorder"
- `admin.add` — "Add"

### Notifications
- `notifications.streak_body` — "Don't lose your {streak}-day streak! 🔥" (use {streak} as placeholder)
- `notifications.practice_body` — "Time to practice! Your daily lesson is waiting."
- `notifications.streak_title` — "Streak reminder"
- `notifications.practice_title` — "Practice time"

### Achievements (display names)
- `ach.first_lesson` — "First lesson"
- `ach.first_lesson_d` — "Complete your first lesson"
- `ach.streak_7` — "Week on fire"
- `ach.streak_7_d` — "7 days in a row"
- `ach.streak_30` — "Month on fire"
- `ach.streak_30_d` — "30 days in a row"
- `ach.perfect` — "Perfect lesson"
- `ach.perfect_d` — "No mistakes"
- `ach.module` — "Module master"
- `ach.module_d` — "Completed a module"
- `ach.speed` — "Speed demon"
- `ach.speed_d` — "Lots of XP fast"
- `ach.xp1k` — "1,000 XP"
- `ach.xp1k_d` — "XP milestone"
- `ach.poly` — "Budding polyglot"
- `ach.poly_d` — "Learning multiple languages"

---

Generate all 90+ strings above, translated naturally into {{LANGUAGE_NAME}}.
Output only the SQL INSERT statement — no prose, no markdown code fences, no explanations.
