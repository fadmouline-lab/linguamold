# LinguaMold — Application Overview & Development Status

This document describes how the LinguaMold mobile app works today, how it is built, and where the project stands relative to its goals. It is intended for onboarding engineers, stakeholders, and future contributors.

For deeper schema and content-generation instructions, see `context/MASTER_STRATEGY.md`. For build history, deviations from the phased plan, and audit notes, see `PROGRESS.md` at the repository root. For visual rules, see `DESIGN.md`.

---

## 1. Product vision

### 1.1 What we are building

LinguaMold is a **mobile-first** language learning application structured like familiar consumer apps (Duolingo-style): **modules** contain **lessons**, and each lesson is a **linear sequence of exercises**. Learners earn **XP**, manage **hearts** (mistake budget), collect **gems**, maintain **streaks**, and see **star ratings** on completed lessons.

The **current MVP** teaches **English** to **French speakers** (app language French, learning language English). The architecture deliberately separates:

- **App language (AL)** — UI and instructional copy the learner reads in their native language.
- **Learning language (LL)** — the language being studied (English in the MVP).

Content, UI strings, audio references, and curriculum rows are keyed by **language pair**, so swapping French for another app language (for example Farsi) is primarily a **data and localization** exercise, not a rewrite of the lesson engine.

### 1.2 Long-term direction

The long-term goal is to serve **speakers of underserved languages** who lack high-quality, native-language apps for learning widely taught languages such as English. The codebase is shaped around **reusable exercise templates (“molds”)**, **Supabase-backed content**, and **column-based app strings** so new language pairs can be added without forking the app.

---

## 2. Tech stack

| Layer | Technology |
|--------|------------|
| App framework | **Expo SDK 55** (React Native **0.83**, React **19**) |
| Navigation | **Expo Router** (file-based routes, tabs, stacks) |
| State | **Zustand** stores (`auth`, `lesson`, `gamification`, `admin`, `uiString`, etc.) |
| Backend | **Supabase** — PostgreSQL, Auth, Storage, optional Edge Functions |
| Persistence / cache | **Async Storage** (e.g. onboarding flags, UI string cache); **Secure Store** where appropriate for auth |
| Media | **expo-av** for audio; assets and remote URLs from Storage |
| Gestures / motion | **react-native-gesture-handler**, **react-native-reanimated** |
| Types | **TypeScript** (strict); domain types in `types/` |

---

## 3. High-level architecture

```
Expo (React Native)
├── app/                    → Screens & navigation (Expo Router)
├── components/
│   ├── molds/              → One component per exercise type
│   ├── adventure/          → Home “path” UI
│   ├── gamification/     → Hearts, XP, streaks, completion, toasts
│   ├── admin/              → SuperAdmin overlay (CMS inside the app)
│   └── ui/                 → Theme, primitives (Text, Button, …)
├── hooks/                  → Auth, lesson engine, streaks, leaderboard, UI strings, …
├── stores/                 → Zustand slices
├── lib/                    → Supabase client, constants, scoring, mold registry, audio, notifications
├── migrations/             → SQL for Supabase (run in project order in production)
└── edge-functions/         → Deno functions (e.g. streak, leaderboard) — deploy via Supabase CLI
```

**Data flow (lesson):** The client loads **published** `exercises` for a `lesson_id` from Supabase, orders them by `display_order`, and renders each row through **`lib/mold-registry.ts`** using `mold_type`. User answers flow through **`useExerciseEngine`**, which updates local lesson state, persists **attempts** and **XP**, adjusts **hearts** (except in placement mode), and upserts **lesson progress** when the run completes.

**Gamification:** Profile fields (`user_profiles`: hearts, gems, total_xp, streaks, etc.) sync with **`useGamificationStore`** for the UI. Constants such as `HEARTS_MAX`, XP awards, and shop prices live in **`lib/constants.ts`** and may be complemented by **`app_config`** rows in the database.

---

## 4. Information model (conceptual)

### 4.1 Curriculum

- **`languages`** — Supported languages (code, native name, direction, flags).
- **`language_pairs`** — Active pairings (e.g. French → English) with ordering.
- **`modules`** — Themed units on the adventure path (slug, titles in AL/LL, difficulty, publish flag, rewards).
- **`lessons`** — Ordered units inside a module (`lesson_type` includes normal lessons and **placement**).
- **`exercises`** — Rows with `mold_type` and **`content` JSONB**; the app does not hardcode exercise text in code paths — molds render from data.

### 4.2 Progress and engagement

- **`user_profiles`** — Identity, preferences, **hearts** / **hearts_last_regen**, **gems**, **total_xp**, **current_streak** / **longest_streak**, **last_activity_date**, optional **streak_frozen_until**, role (`user` | `superadmin`), etc.
- **`user_module_progress`** / **`user_lesson_progress`** — Lock state, scores, **stars**, attempts, timestamps.
- **`user_exercise_attempts`** — Per-try correctness, answer payload, timing, XP earned.
- **`user_streaks`**, **`user_xp_log`**, **`user_achievements`** — Retention and analytics-oriented tables (see migrations and `MASTER_STRATEGY`).

### 4.3 Localization

- **`app_strings`** (see migrations `020`–`022`) — **Column-per-app-language** string table with RLS; the client loads strings for the learner’s AL, caches in session/AsyncStorage, and interpolates `{{variables}}`.
- Fallback dictionary **`lib/app-strings-fallback.ts`** keeps the app usable offline or before the first fetch.

---

## 5. Exercise system (“molds”)

A **mold** is both a **React component** and a **JSON schema** for `exercises.content`. The registry maps `mold_type` → component:

| `mold_type` | Purpose (summary) |
|-------------|---------------------|
| `flashcard` | Recall / flip card style exposure |
| `fill_in_the_blank` | Complete a sentence with blanks |
| `word_reorder` | Tap tokens into correct order |
| `translate_sentence` | Produce LL from AL prompt |
| `listen_and_choose` | Audio + multiple choice |
| `type_what_you_hear` | Dictation-style typing |
| `select_correct_verb` | Conjugation / form choice |
| `match_pairs` | Associate pairs |
| `image_select` | Image + choice |
| `true_or_false` | Statement judgment |
| `conversation_listen` | Dialogue comprehension |
| `speak_the_word` | Speak / self-check (no ASR in MVP) |

**Scoring** is centralized in **`lib/scoring.ts`** per mold type. **`lib/exercise-mapper.ts`** normalizes legacy or partial JSON into the shape each mold expects.

---

## 6. User-facing flows

### 6.1 Entry and auth

- **`app/index.tsx`** — Waits for auth and language pair; redirects to **login** if signed out, **select-language** if no LL, **proficiency** onboarding if not completed, else **`(main)/home`**.
- **`(auth)/`** — Login, register, forgot password; Supabase Auth.

### 6.2 Onboarding

- Select learning language, daily goal, motivation, notifications, etc. (see `app/(onboarding)/`).
- **Proficiency** path sets local/async flags and can route learners into a **placement** experience.

### 6.3 Placement test (as implemented)

- **`hooks/usePlacementTest.ts`** resolves the first **published** lesson with `lesson_type = 'placement'` inside the **`placement`** module for the active language pair (seeded in **`999_seed_data.sql`**).
- The app opens **`app/lesson/[lessonId].tsx`** with **`?placement=1`**: the **standard lesson engine** runs with **no heart deduction** for wrong answers (placement is “free”).
- **Note:** The Phase 7 specification described an **adaptive** difficulty ladder; the shipped implementation is a **fixed placement lesson** from seed data, not a dynamic pool. See **`PROGRESS.md` → “Decisions differing from the written phases”.**

### 6.4 Main experience

- **Home** — **Adventure path** (`components/adventure/AdventurePath.tsx`): modules as nodes; tapping opens lesson selection / continuation according to progress.
- **Browse** — Grid of modules (filter/search by difficulty and title).
- **Lesson** — Progress bar, current mold, hearts (non-placement), combo feedback, review queue behavior, completion screen (`LessonCompleteScreen`, etc.).
- **Leaderboard** — Weekly (or configured period) rankings tied to language pair.
- **Profile** — Stats, settings, link to **shop** where applicable.
- **Shop** — Spend **gems** on heart refill, streak freeze, etc. (some items may show “coming soon” per product decisions).

### 6.5 SuperAdmin (“CMS in the app”)

- Users with **`role = 'superadmin'`** see an **Admin** entry from the main shell.
- **`(admin)/`** — Pick AL/LL, manage **modules** (publish, reorder), **lessons**, and **exercises** with live mold preview, inline JSON editing, validation on save, and up/down reorder instead of long-press drag (see `PROGRESS.md`).

---

## 7. Gamification rules (client defaults)

Values in **`lib/constants.ts`** include (non-exhaustive):

- **Hearts:** max 5; regen interval reflected in client (`HEART_REGEN_MS` — four hours per comment in code).
- **XP:** per correct answer, combo bonus, lesson complete, perfect lesson; level steps via `LEVEL_XP_STEP`.
- **Shop:** heart refill and streak freeze costs; double XP may be reserved for future use.

Server-side **`app_config`** and Edge Functions can adjust behavior in production; the client remains the source of immediate UX feedback.

---

## 8. Design and UX guardrails

- **`DESIGN.md`** — Canonical palette (e.g. primary teal `#0891B2`), warm background, **Cabinet Grotesk** + **DM Sans**, module iconography rules.
- **`CLAUDE.md`** — Instructs contributors to align UI work with `DESIGN.md`.
- Recent work (per `PROGRESS.md`) includes **confirm dialogs**, **lesson exit handling**, **fuzzy matching** for typed answers, **skeleton loaders**, **offline banner**, **toast queue**, and **accessibility** improvements on key controls.

---

## 9. Current stage of development

### 9.1 Summary

The project treats the **core client and schema as “build complete”** for an MVP: auth, onboarding, lesson loop, twelve molds, adventure path, browse, shop, leaderboard, profile, SuperAdmin content tools, seed data, localization overhaul (English + French app strings with extensible columns), and deployment documentation.

**What remains “productization” rather than “greenfield build”:**

1. **Supabase project setup** — Run migrations in order, create storage buckets, set `.env`, deploy edge functions, promote a superadmin user (`PROGRESS.md` and `DEPLOYMENT_GUIDE.md`).
2. **Curriculum volume** — Seed `999` provides structure, placement module, sample exercises, module shells, and achievements; **full three-module depth** (every lesson fully populated at scale) may still require SuperAdmin edits or bulk imports — see **`PROGRESS.md`** seed caveat.
3. **Audio** — Placeholders or partial coverage until ElevenLabs (or similar) pipeline fills `audio` bucket URLs referenced in JSON.
4. **Adaptive placement** — Not implemented as specified in `phases/PHASE_7.md`; proficiency routing uses the standard engine on a dedicated placement lesson.
5. **Native speech recognition** — `speak_the_word` is self-assessment / MVP, not ASR-backed.
6. **Polish variance** — Haptics and error boundaries are not uniformly applied on every control; leaderboard/browse edge cases documented in `PROGRESS.md`.

### 9.2 Migrations present in the repo

SQL files under **`migrations/`** include core schema (`001`–`018`), **`999_seed_data.sql`**, localization (`020`–`022`), UX feedback (`023`), and related policy/index files. **Always apply in dependency order** for a fresh environment; do not assume only `001`–`018` + `999` if you need app strings and later tables.

### 9.3 Quality gates (as last recorded)

`PROGRESS.md` (2026-03-26) records **`npx tsc --noEmit` clean** and **`npx expo-doctor` 17/17** after dependency alignment. Re-run these before releases; the codebase may have evolved since.

---

## 10. How this document should be maintained

- After **major features** (new molds, new tables, onboarding changes), update **Sections 4–6** and **Section 9**.
- After **shipping or changing migrations**, update **Section 9.2** and cross-check **`DEPLOYMENT_GUIDE.md`**.
- Keep **vision** (Section 1) aligned with `MASTER_STRATEGY.md`; keep **honest limitations** aligned with **`PROGRESS.md` → Known limitations**.

---

## 11. Quick file map for developers

| Concern | Primary location |
|---------|-------------------|
| Routes / screens | `app/` |
| Lesson runtime | `hooks/useExerciseEngine.ts`, `stores/lessonStore.ts`, `app/lesson/[lessonId].tsx` |
| Mold list | `lib/mold-registry.ts`, `components/molds/*` |
| Gamification UI | `components/gamification/*`, `stores/gamificationStore.ts` |
| Strings | `hooks/useUIString.ts`, `stores/uiStringStore.ts`, `lib/app-strings-fallback.ts` |
| Theme | `components/ui/theme.ts` |
| Supabase client | `lib/supabase.ts` |
| Types | `types/index.ts`, `types/molds.ts` |

---

*Document generated to consolidate product intent, architecture, and status. Canonical timestamps and checklists remain in `PROGRESS.md` and `DEPLOYMENT_GUIDE.md`.*
