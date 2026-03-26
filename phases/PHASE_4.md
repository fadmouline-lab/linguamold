# PHASE 4 — LESSON ENGINE + ADVENTURE PATH

## Context
Phase 3 is complete. All 12 mold components exist, the registry works, scoring works. Now build the core gameplay loop (lesson engine) and the home screen (adventure path). Reference `context/MASTER_STRATEGY.md` Sections 5 and 7.

## Tasks

### 4.1 — Lesson Store
- `stores/lessonStore.ts` — Zustand store holding:
  - exercises: Exercise[] (loaded for current lesson)
  - currentIndex: number
  - answers: { exerciseId, isCorrect, answer, timeSpentMs }[]
  - score: number (percentage)
  - isComplete: boolean
  - isLoading: boolean
  - hearts: number (from user profile)

### 4.2 — Exercise Engine Hook
- `hooks/useExerciseEngine.ts` — The core lesson orchestrator:
  - `loadLesson(lessonId)` — fetches exercises from Supabase, ordered by display_order, stores in lessonStore
  - `submitAnswer(isCorrect, answer)` — records attempt, updates hearts if wrong, calculates running score, logs XP
  - `advance()` — moves to next exercise or marks lesson complete
  - `getScore()` — returns final score percentage
  - `isPerfect()` — true if all answers correct
  - Writes to user_exercise_attempts table on each answer
  - On lesson complete: writes to user_lesson_progress, awards XP (via user_xp_log)

### 4.3 — Hearts Hook
- `hooks/useHearts.ts` — Manages the lives system:
  - Reads hearts + hearts_last_regen from user_profiles
  - Calculates regenerated hearts based on elapsed time (1 per 4 hours, cap at 5)
  - `loseHeart()` — decrements, updates DB
  - `canPlay()` — returns false if hearts === 0
  - `getTimeToNextHeart()` — returns minutes until next regen

### 4.4 — Lesson Screen
- `app/lesson/[lessonId].tsx` — THE core screen. Flow:
  1. On mount: load lesson via useExerciseEngine
  2. Show loading skeleton while fetching
  3. If hearts === 0: show "No hearts" modal with timer + option to buy hearts
  4. Render: top bar with progress bar (X of N) + hearts display + close button
  5. Current exercise: look up MoldComponent from MoldRegistry, render with MoldProps
  6. On answer submitted: show success/error state, wait for user to tap Next/Continue
  7. On advance: move to next exercise, animate transition (slide left)
  8. When all exercises done: show LessonCompleteScreen
- Use Reanimated for exercise transition animations (slide in from right)

### 4.5 — Lesson Complete Screen
- `components/gamification/LessonCompleteScreen.tsx` — Shown after last exercise:
  - Star rating (1-3 stars based on score: <60% = 1, 60-89% = 2, 90%+ = 3)
  - Score percentage with animated counter
  - XP earned (animated counter)
  - Streak status (maintained/broken)
  - If perfect: confetti animation
  - "Continue" button → returns to adventure path

### 4.6 — Gamification Display Components
- `components/gamification/ProgressBar.tsx` — Animated horizontal bar showing lesson progress (current/total exercises). Green fill that grows smoothly.
- `components/gamification/HeartDisplay.tsx` — Row of 5 heart icons (filled red = available, outline = lost). Shows count. Animated shrink when losing a heart.
- `components/gamification/CelebrationOverlay.tsx` — Full-screen confetti + "Perfect!" text. Uses Reanimated for particle animation (falling confetti pieces with rotation). Auto-dismisses after 3 seconds.
- `components/gamification/XPGainFloat.tsx` — "+10 XP" text that floats up from the answer and fades out. Triggered on correct answers.
- `components/gamification/ProgressRing.tsx` — Circular progress indicator for module completion on the adventure path.

### 4.7 — Module + Lesson Data Hooks
- `hooks/useModules.ts` — Fetches all modules for current language_pair_id, ordered by display_order. Joins with user_module_progress to get completion status per module.
- `hooks/useLessons.ts` — Fetches all lessons for a given module_id, ordered by display_order. Joins with user_lesson_progress. Provides lesson lock/unlock status (a lesson unlocks when previous one is completed).

### 4.8 — Adventure Path Components
- `components/adventure/AdventurePath.tsx` — A vertical ScrollView that renders ModuleNodes connected by PathConnectors. Scrolls to the user's current (in-progress) module on mount. Background has a subtle gradient or pattern.
- `components/adventure/ModuleNode.tsx` — A circular/rounded node for each module:
  - Shows module icon (or first letter if no icon)
  - ProgressRing around it showing completion_pct
  - Title below
  - States: locked (gray, lock icon), available (colored, glowing), in_progress (pulsing), completed (gold, checkmark)
  - Tap → navigate to module detail (lesson list)
- `components/adventure/PathConnector.tsx` — A curved/dotted line connecting adjacent ModuleNodes. Colored portion shows completed path, gray for remaining.

### 4.9 — Home Screen
- `app/(main)/home.tsx` — The main tab:
  - Top bar: streak badge (left), "LinguaMold" title (center), gems count (right)
  - Body: AdventurePath component (full height scroll)
  - Tapping a module node opens a bottom sheet or navigates to lesson picker showing all lessons in that module

### 4.10 — Module Detail / Lesson Picker
- Create a bottom sheet or screen that shows when a module node is tapped:
  - Module title + description
  - List of lessons with status (locked/available/completed/stars)
  - Tap a lesson → navigate to `lesson/[lessonId]`

### 4.11 — Tab Navigator
- `app/(main)/_layout.tsx` — Bottom tab navigator with 4 tabs:
  - Home (house icon) — the adventure path
  - Leaderboard (trophy icon) — placeholder for Phase 5
  - Profile (person icon) — placeholder for Phase 5
  - Browse (grid icon) — placeholder: all modules in a flat grid (can jump to any unlocked one)

### 4.12 — Update Tracking
Update PROGRESS.md and FILE_MANIFEST.md.

## Completion Criteria
- [ ] Lesson screen loads exercises and renders mold components
- [ ] Correct/wrong answers update score and hearts
- [ ] Lesson complete screen shows with score + XP + stars
- [ ] Adventure path renders module nodes with connections
- [ ] Module nodes show correct status (locked/available/completed)
- [ ] Tapping a module shows lessons; tapping a lesson starts it
- [ ] Tab navigation works between 4 tabs
- [ ] Animations feel smooth (progress bar, heart loss, celebrations)
- [ ] No TypeScript errors

## WHEN DONE: Proceed immediately to phases/PHASE_5.md
