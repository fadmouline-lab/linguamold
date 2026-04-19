# LinguaMold Deployment Guide

This guide covers everything needed to go from a fresh Supabase project to a running LinguaMold instance.

---

## 1. SQL Execution Order

Run these migrations **in order** in the Supabase SQL Editor (Dashboard → SQL Editor → New Query). Each file is idempotent (`IF NOT EXISTS`, `ON CONFLICT DO NOTHING`), so re-running is safe.

| # | File | What it creates |
|---|------|----------------|
| 1 | `001_languages.sql` | `languages` table (code, name, direction, flag) |
| 2 | `002_language_pairs.sql` | `language_pairs` table (app\_language ↔ learning\_language) |
| 3 | `003_modules.sql` | `modules` table (themed content collections) |
| 4 | `004_lessons.sql` | `lessons` table (sessions within modules) |
| 5 | `005_exercises.sql` | `exercises` table (mold instances with JSONB content) |
| 6 | `006_user_profiles.sql` | `user_profiles` table (hearts, gems, XP, role, streaks) |
| 7 | `007_user_progress.sql` | `user_module_progress` + `user_lesson_progress` tables |
| 8 | `008_user_exercise_attempts.sql` | `user_exercise_attempts` table (answer history) |
| 9 | `009_user_streaks.sql` | `user_streaks` table (daily streak records) |
| 10 | `010_user_xp_log.sql` | `user_xp_log` table (XP source tracking) |
| 11 | `011_leaderboard.sql` | `leaderboard` table (weekly/monthly/all-time rankings) |
| 12 | `012_achievements.sql` | `achievements` table (unlock conditions and rewards) |
| 13 | `013_user_achievements.sql` | `user_achievements` table (unlocked achievements per user) |
| 14 | `014_ui_strings.sql` | `ui_strings` table (all localized UI text) |
| 15 | `015_app_config.sql` | `app_config` table (gamification constants) |
| 16 | `016_rls_policies.sql` | Row Level Security policies on all tables |
| 17 | `017_indexes.sql` | Performance indexes on all tables |
| 18 | `018_storage_buckets.sql` | Documentation only — see Section 2 below |
| 19 | `999_seed_data.sql` | Seed: app config, achievements, French UI strings, placement module |

**Important:** Run 001–017 before 999. Migration 018 is documentation only (storage buckets require Dashboard UI or storage API — see Section 2).

---

## 2. Storage Bucket Setup

Create two buckets in the Supabase Dashboard (Storage → New Bucket) or via SQL:

```sql
-- Run in SQL Editor after migrations
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('audio', 'audio', true),
  ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;
```

### Bucket Configuration

| Bucket | Public | Allowed MIME types | Path convention |
|--------|--------|--------------------|-----------------|
| `audio` | Yes | `audio/mpeg`, `audio/wav` | `{lang_code}/{slug}.mp3` |
| `images` | Yes | `image/png`, `image/jpeg`, `image/webp` | `exercises/{id}.png` |

### RLS Policies for Storage

Run these in the SQL Editor to allow authenticated reads and superadmin writes:

```sql
-- Allow authenticated users to read audio/images
CREATE POLICY "Authenticated users can read audio"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id IN ('audio', 'images'));

-- Allow superadmins to upload/update/delete
CREATE POLICY "Superadmins can manage storage"
ON storage.objects FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid() AND role = 'superadmin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid() AND role = 'superadmin'
  )
);
```

---

## 3. Edge Function Deployment

Install the Supabase CLI first: `npm install -g supabase` (or `brew install supabase/tap/supabase`).

```bash
# Login and link your project
supabase login
supabase link --project-ref YOUR_PROJECT_REF

# Deploy both edge functions
supabase functions deploy calculate-streak
supabase functions deploy update-leaderboard
```

Both functions use `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` — these are automatically injected by the Supabase runtime. No manual secret setting required.

To verify deployment:
```bash
supabase functions list
```

---

## 4. Environment Variables

Create a `.env` file in the project root (copy from `.env.example` if present):

```env
# Required — get these from Supabase Dashboard → Settings → API
EXPO_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...your_anon_key...

# Optional — for local Supabase development
# EXPO_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
# EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...local_anon_key...
```

| Variable | Where to find it | Required |
|----------|-----------------|----------|
| `EXPO_PUBLIC_SUPABASE_URL` | Dashboard → Settings → API → Project URL | Yes |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Dashboard → Settings → API → Project API keys → `anon public` | Yes |

**Never commit `.env` to git.** The `.gitignore` should already exclude it.

---

## 5. Creating a Superadmin User

1. **Register in the app** — open the app, create a normal user account with your email.

2. **Promote to superadmin** — run this in the Supabase SQL Editor:

```sql
UPDATE public.user_profiles
SET role = 'superadmin'
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'YOUR_EMAIL@example.com'
);
```

3. **Verify** — log out and log back in. You should see the orange `[ADMIN]` banner and an "Admin" button in the top-right of the home screen.

---

## 6. Smoke Test (Step-by-Step Verification)

After completing steps 1–5, verify the app works end-to-end:

### Step 1 — Register & Onboarding
- [ ] Open the app → Register with a new email
- [ ] Onboarding flow appears: select French as target language
- [ ] Choose proficiency level (Beginner)
- [ ] Optionally skip or complete placement test
- [ ] Lands on Home tab with adventure path visible

### Step 2 — Lesson Loop
- [ ] Tap a module node on the adventure path
- [ ] Start a lesson
- [ ] Complete at least 3 exercises (mold components render, answer buttons work)
- [ ] Correct answer shows green feedback; wrong answer deducts a heart
- [ ] Lesson complete screen shows XP earned

### Step 3 — Shop
- [ ] Navigate to Shop (not visible in tab bar by default — accessible via profile or direct route)
- [ ] Verify heart refill and streak freeze options appear with gem cost

### Step 4 — Leaderboard
- [ ] Tap Leaderboard tab
- [ ] Weekly ranking list renders (may show only your user initially)

### Step 5 — Profile
- [ ] Tap Profile tab
- [ ] Display name, XP, streak, gems visible
- [ ] Logout button works → returns to login screen

### Step 6 — SuperAdmin Mode
- [ ] Login with your superadmin account
- [ ] Orange `[ADMIN]` banner visible at top
- [ ] Tap "Admin" button → Admin stack opens
- [ ] Modules list renders; tap a module to see lessons; tap a lesson to see exercises
- [ ] Tap an exercise field to edit inline → Save/Cancel works
