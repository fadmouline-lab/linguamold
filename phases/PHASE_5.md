# PHASE 5 — GAMIFICATION

## Context
Phase 4 is complete. Lessons work, the adventure path renders, basic XP and hearts function. Now build the full gamification layer: XP system, streaks, leaderboard, achievements, and the profile screen. Reference `context/MASTER_STRATEGY.md` Sections 8 and 15.

## Tasks

### 5.1 — Gamification Store
- `stores/gamificationStore.ts` — Zustand store holding:
  - totalXP, currentStreak, longestStreak, gems
  - weeklyXP (for leaderboard)
  - hearts, heartsLastRegen
  - achievements: UserAchievement[]
  - leaderboardRank: number | null

### 5.2 — XP Hook
- `hooks/useXP.ts`:
  - `awardXP(amount, source, referenceId)` — inserts into user_xp_log, updates user_profiles.total_xp, updates gamificationStore
  - `getXPBreakdown(lessonId)` — calculates: base XP + combo bonus + lesson complete bonus + perfect bonus
  - `getTotalXP()` — returns from store (cached)
  - `getLevel()` — calculate a "level" from total XP (every 500 XP = 1 level, or similar curve)

### 5.3 — Streak Hook
- `hooks/useStreak.ts`:
  - `recordActivity()` — called after each lesson completion. Upserts into user_streaks for today.
  - `checkStreak()` — on app open: checks if yesterday has an entry. If yes → streak continues. If no → check for streak freeze (deduct 50 gems). If no freeze → reset streak to 0.
  - `getCurrentStreak()` — from store
  - `useStreakFreeze()` — spends 50 gems to protect streak
  - `getStreakInfo()` — returns { currentStreak, longestStreak, isProtected, lastActivityDate }

### 5.4 — Leaderboard Hook
- `hooks/useLeaderboard.ts`:
  - `getWeeklyLeaderboard(languagePairId, limit=20)` — fetches from leaderboard table, ordered by xp_earned DESC. Returns array of { rank, displayName, avatarUrl, xpEarned, isCurrentUser }
  - `updateMyLeaderboardEntry(xpEarned)` — upserts current user's entry for this week
  - `getMyRank()` — returns user's current rank

### 5.5 — Achievements Hook
- `hooks/useAchievements.ts`:
  - `checkAchievements()` — called after significant events (lesson complete, streak update, XP milestone). Checks each achievement's condition against user's stats. If newly unlocked, inserts into user_achievements and shows toast.
  - `getUnlockedAchievements()` — returns all user's unlocked achievements
  - `getAllAchievements()` — returns all possible achievements with locked/unlocked status

### 5.6 — Leaderboard Screen
- `app/(main)/leaderboard.tsx`:
  - Weekly leaderboard title with countdown to reset (next Monday)
  - Top 3 displayed with podium-style layout (2nd | 1st | 3rd, 1st elevated)
  - Scrollable list below for ranks 4-20
  - Each row: rank, avatar, display name, XP earned this week
  - Current user's row highlighted (always visible, even if scrolled off — sticky at bottom)
  - Pull to refresh

### 5.7 — Profile Screen
- `app/(main)/profile.tsx`:
  - User avatar + display name (editable)
  - Stats grid:
    - Total XP with level badge
    - Current streak with fire emoji
    - Lessons completed count
    - Days learning count
  - Achievements section: horizontal scroll of unlocked achievement badges, tap for details
  - Settings section:
    - Daily reminder toggle + time picker
    - Daily goal (5/10/15/20 minutes)
    - Change learning language
    - Log out button
  - "Learning since {date}" at bottom

### 5.8 — Achievement Toast
- `components/gamification/AchievementToast.tsx`:
  - Slides down from top when an achievement unlocks
  - Shows achievement icon + title
  - Gold/shiny animation
  - Auto-dismisses after 4 seconds
  - Tap to dismiss

### 5.9 — Streak Badge Component
- `components/gamification/StreakBadge.tsx`:
  - Fire emoji 🔥 + streak count
  - Animated bounce on streak maintain
  - Tap to see streak details (longest streak, streak freeze status)

### 5.10 — Leaderboard Row Component
- `components/gamification/LeaderboardRow.tsx`:
  - Rank number, avatar, name, XP
  - Top 3 get gold/silver/bronze accent
  - Current user row has highlighted background

### 5.11 — Edge Functions
Create the edge function files (these will be deployed manually to Supabase):

- `edge-functions/calculate-streak/index.ts`:
  - Deno TypeScript
  - Receives userId
  - Checks user_streaks table for yesterday + today
  - Calculates correct streak value
  - Updates user_profiles
  - Returns { currentStreak, longestStreak, streakBroken }

- `edge-functions/update-leaderboard/index.ts`:
  - Receives userId, languagePairId, xpAmount
  - Calculates current week start (Monday)
  - Upserts leaderboard entry
  - Recalculates ranks for the week
  - Returns new rank

### 5.12 — Quality Gate
Run `npx tsc --noEmit`. Fix ALL TypeScript errors.

### 5.13 — Update Tracking
Update PROGRESS.md and FILE_MANIFEST.md.

## Completion Criteria
- [ ] XP awards correctly on lesson complete with breakdown (base + bonus)
- [ ] Streak tracks daily activity, handles missed days, supports freeze
- [ ] Leaderboard screen shows ranked users by weekly XP
- [ ] Profile screen shows all stats, achievements, settings
- [ ] Achievement toast appears on unlock
- [ ] Edge function files exist and are valid TypeScript
- [ ] No TypeScript errors

## WHEN DONE: Proceed immediately to phases/PHASE_6.md
