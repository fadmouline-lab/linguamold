# File Manifest — LinguaMold build

## Config / tooling
- `package.json` — Expo 55, Router, Reanimated, Gesture Handler, Zustand, Supabase, notifications, AV, haptics, `expo-font`, `@expo/vector-icons`, `babel-plugin-module-resolver`
- `babel.config.js` — module resolver `@/*`, Reanimated plugin
- `tsconfig.json` — strict, paths, excludes `edge-functions` from app `tsc`
- `app.json` — scheme `linguamold`, plugins
- `expo-env.d.ts`
- `.env` (user-supplied keys)
- `.cursorrules`, `context/MASTER_STRATEGY.md`

## Migrations (`migrations/`)
- `001_languages.sql` … `018_storage_buckets.sql`
- `999_seed_data.sql`

## Edge functions (Deno, deploy separately)
- `edge-functions/calculate-streak/index.ts`
- `edge-functions/update-leaderboard/index.ts`

## Types
- `types/json.ts`, `types/index.ts`, `types/molds.ts`, `types/navigation.ts`, `types/supabase.ts`

## Lib
- `lib/supabase.ts`, `lib/constants.ts`, `lib/audio.ts`, `lib/scoring.ts`, `lib/mold-registry.ts`, `lib/exercise-mapper.ts`, `lib/french-ui-fallback.ts`, `lib/notifications.ts`

## Stores
- `stores/authStore.ts`, `stores/uiStringStore.ts`, `stores/lessonStore.ts`, `stores/gamificationStore.ts`, `stores/adminStore.ts`

## Hooks
- `hooks/useAuth.ts`, `hooks/useUIString.ts`, `hooks/useLanguagePair.ts`, `hooks/useExerciseEngine.ts`, `hooks/useHearts.ts`, `hooks/useModules.ts`, `hooks/useLessons.ts`, `hooks/useXP.ts`, `hooks/useStreak.ts`, `hooks/useLeaderboard.ts`, `hooks/useAchievements.ts`, `hooks/useAdminMode.ts`, `hooks/usePlacementTest.ts`

## App (Expo Router)
- `app/_layout.tsx`, `app/index.tsx`
- `app/(auth)/_layout.tsx`, `login.tsx`, `register.tsx`, `forgot-password.tsx`
- `app/(onboarding)/_layout.tsx`, `select-language.tsx`, `proficiency.tsx`, `placement-test.tsx`
- `app/(main)/_layout.tsx`, `home.tsx`, `leaderboard.tsx`, `profile.tsx`, `browse.tsx`, `shop.tsx`
- `app/lesson/[lessonId].tsx`
- `app/(admin)/_layout.tsx`, `index.tsx`, `modules.tsx`, `lessons/[moduleId].tsx`, `exercises/[lessonId].tsx`

## UI primitives (`components/ui/`)
- `theme.ts`, `Text.tsx`, `Button.tsx`, `Card.tsx`, `Input.tsx`, `ScreenContainer.tsx`

## Common (`components/common/`)
- `AudioPlayer.tsx`, `SuccessMessage.tsx`, `ErrorMessage.tsx`, `OptionButton.tsx`, `ExerciseHeader.tsx`, `SkeletonLoader.tsx`, `ErrorState.tsx`, `EmptyState.tsx`, `OfflineBanner.tsx`

## Molds (`components/molds/`)
- `EditableField.tsx`, `FillInTheBlank.tsx`, `TranslateSentence.tsx`, `WordReorder.tsx`, `ListenAndChoose.tsx`, `SpeakTheWord.tsx`, `MatchPairs.tsx`, `ImageSelect.tsx`, `ConversationListen.tsx`, `SelectCorrectVerb.tsx`, `Flashcard.tsx`, `TypeWhatYouHear.tsx`, `TrueOrFalse.tsx`

## Gamification (`components/gamification/`)
- `ProgressBar.tsx`, `HeartDisplay.tsx`, `CelebrationOverlay.tsx`, `XPGainFloat.tsx`, `ProgressRing.tsx`, `LessonCompleteScreen.tsx`, `LeaderboardRow.tsx`, `AchievementToast.tsx`, `StreakBadge.tsx`

## Adventure (`components/adventure/`)
- `PathConnector.tsx`, `ModuleNode.tsx`, `AdventurePath.tsx`

## Admin (`components/admin/`)
- `AdminToggleBar.tsx`, `InlineEditor.tsx`, `ReorderableList.tsx`

## Legacy scaffold (unused by Router entry)
- `index.ts`, `App.tsx`

## Docs
- `PROGRESS.md`, `FILE_MANIFEST.md`, `phases/PHASE_*.md`, `ORCHESTRATOR.md` (if present at repo root)
