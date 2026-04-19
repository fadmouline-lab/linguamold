# UX LOGIC AUDIT — Defensive Design & Micro-Interactions

Read `context/MASTER_STRATEGY.md` for architecture context.

This app teaches languages to people who may not be tech-savvy and who may be using it in a second language. Every interaction must be forgiving, predictable, and impossible to get wrong by accident. Audit and fix every screen for the following patterns.

## Destructive action protection

**Leaving a lesson mid-progress:** The X/back button on the lesson screen must show a confirmation modal: "Tu veux vraiment quitter? Ta progression pour cette leçon sera perdue." with two buttons: "Continuer la leçon" (primary, green) and "Quitter" (secondary, muted). The safe choice (continue) must be the visually dominant button. Hardware back button and swipe-back gesture must trigger the same modal — not silently exit.

**Logging out:** The logout button in profile/settings must confirm: "Es-tu sûr(e) de vouloir te déconnecter?" Users who accidentally log out lose their flow and may not remember their password.

**Deleting progress or resetting:** If we ever add a "reset progress" option, it needs a two-step confirmation. For now, ensure no single tap can destroy user data.

**Admin saves:** When a SuperAdmin edits content and tries to navigate away with unsaved changes, intercept with: "Tu as des modifications non sauvegardées. Sauvegarder avant de quitter?" with Save / Discard / Cancel options.

## Preventing dead ends

**No screen without a way out.** Audit every screen:
- Auth screens: back arrow or toggle to login/register
- Onboarding screens: back button to previous step (don't trap users in a forward-only funnel — they might want to change their language choice)
- Main tabs: always visible tab bar
- Lesson screen: X button (with confirmation)
- Lesson complete: "Continuer" goes to home/adventure path — never to a blank screen
- Admin screens: back button in header + exit admin mode toggle always visible
- Bottom sheets / modals: tappable backdrop to dismiss + explicit close button. Never rely solely on swipe-to-dismiss — not all users know that gesture.
- Error states: always include a "Réessayer" (retry) button and a way to go back

**After placement test completion:** User must land on the adventure path with their starting module visible and highlighted — not on a generic home screen where they don't know what to do next.

**After registration:** Don't dump users on a blank home screen. The onboarding flow must be mandatory: register → select language → proficiency → (optional placement) → adventure path. Guard each step with a redirect if previous steps aren't complete.

## Loading and waiting states

**Never show a blank screen.** Every data fetch needs:
- Skeleton placeholders that match the expected layout shape (not a centered spinner)
- If loading takes > 3 seconds, show a reassuring message: "Chargement de ta leçon..." 
- If loading fails, show an error state with retry — not a crash or blank screen

**Audio loading:** When an exercise has audio that hasn't loaded yet, the play button should show a loading indicator, not be silently broken. If audio fails to load, the exercise should still be completable — audio is enhancement, not a gate.

**Image loading:** Image-based exercises (image_select) must show placeholder thumbnails while images load. If images fail, show the text label fallback — never show broken image icons.

## Input forgiveness

**Translate sentence — fuzzy matching:**
- Ignore case differences ("The cat" = "the cat")
- Ignore trailing/leading whitespace
- Ignore single vs double spaces
- Ignore presence/absence of final period ("The cat is here" = "The cat is here.")
- Accept common contractions ("I'm" = "I am", "don't" = "do not")
- If the answer is close but not quite right (1-2 characters off), show: "Presque! Vérifie l'orthographe." instead of a flat "wrong"

**Type what you hear — same forgiveness rules** plus:
- Ignore punctuation entirely (commas, apostrophes, question marks)
- Accept common mishearings as "close" answers

**Text inputs should:**
- Auto-trim whitespace on submission
- Not submit on Enter unless there's a visible submit button (prevent accidental submissions)
- Show character count or "minimum 2 characters" hint if input seems too short
- Auto-capitalize first letter for sentence inputs
- Show the appropriate keyboard type (default for text, number-pad for number exercises)

## Gamification edge cases

**Hearts at zero:** When hearts = 0 and user tries to start a lesson:
- Show a modal explaining they're out of hearts
- Show time until next heart regenerates (countdown timer, updating live)
- Offer "Recharge tes vies" button linking to the gems shop
- Offer "Mode révision" — review completed lessons without heart cost
- Do NOT let them start a lesson that they can't finish

**Streak protection:**
- When the app opens and it's been >24h since last activity, check for streak freeze BEFORE showing a "streak lost" message
- If streak IS lost, show an empathetic message: "Ta série de X jours est terminée. Recommençons!" — not just a cold counter reset
- If streak is maintained, show a celebration: "🔥 Jour X! Continue comme ça!"

**XP and level-up:** When a user crosses a level threshold (every 500 XP), show a level-up celebration screen, even if it happens mid-lesson. This is a dopamine moment — don't waste it.

**Leaderboard:** If there are fewer than 3 users, the podium looks empty and sad. Show a message: "Invite tes amis pour un vrai classement!" or populate with friendly bot entries for the first few weeks.

**Achievement unlock:** The achievement toast must not block interaction — it should be dismissible by tapping anywhere, and auto-dismiss after 4 seconds. Don't stack multiple toasts — queue them with 1 second gaps.

## Session and connectivity

**Offline detection:** Show a subtle banner at the top (not a blocking modal) when offline: "Pas de connexion. Certaines fonctionnalités sont limitées." The banner should auto-dismiss when connection returns.

**Session expiry:** If a Supabase session expires mid-lesson, don't kick the user out immediately. Queue the progress data locally and sync when they re-authenticate. Show a gentle "Reconnecte-toi pour sauvegarder ta progression" prompt after the lesson ends — not during.

**App backgrounding during a lesson:** If the user switches away from the app and comes back:
- If < 5 minutes: resume exactly where they were, no interruption
- If > 5 minutes: still resume, but pause any active timers
- If > 30 minutes: show the lesson from the beginning of the current exercise (not the beginning of the lesson)
- Never lose progress silently

## Accessibility and inclusivity

**Touch targets:** Every tappable element must be at least 44x44 points. Small icons that are tappable (like hearts, gems, close buttons) need an invisible touch area extension even if the visual is smaller.

**Color is never the only indicator:** Correct/wrong must also have an icon (checkmark/X), not just green/red. This matters for colorblind users — roughly 8% of men.

**Font scaling:** Respect the user's system font size preference. Test that screens don't break at 1.5x and 2x text scaling. If they do, use `allowFontScaling={false}` only on decorative text, never on content.

**Screen reader labels:** Add `accessibilityLabel` to all interactive elements that don't have visible text (icon buttons, progress rings, heart displays). Audio play buttons should say "Écouter la prononciation".

## First-time experience

**Empty states with personality:**
- Adventure path with no progress: "Ton voyage commence ici! Appuie sur le premier module pour commencer. 🌟"
- Leaderboard with no data: "Complète ta première leçon pour apparaître au classement!"
- Achievements with none unlocked: "Tes badges apparaîtront ici. Continue à apprendre!"
- Profile with no stats: Show zeros, not blank spaces — "0 jours de série" not an empty field

**Tooltips on first use:** 
- First time on adventure path: brief overlay highlighting the first module node: "Appuie ici pour commencer!"
- First lesson: brief highlight on the hearts: "Tu as 5 vies. Chaque erreur en coûte une."
- First correct answer: slightly longer celebration than usual to reinforce the reward loop

## Admin-specific UX

**Admin changes should feel safe:**
- Show a diff preview before saving: "Ancien: 'Tommy wants to ___ lunch' → Nouveau: 'Tommy wants to ___ dinner'"
- Undo last edit (within the current session) via a toast: "Modification sauvegardée. Annuler?" that shows for 5 seconds
- Published/unpublished toggle should confirm before unpublishing a module that users have already started

**Admin can't break the user experience:**
- Validate JSONB content on save: ensure required fields exist, options array is non-empty, at least one option is marked correct
- Prevent saving an exercise with no correct answer
- Prevent saving a lesson with zero exercises
- Prevent reordering that would place a locked module before an unlocked one

## Audit checklist

Go through every file in `app/` and `components/` and verify:
- [ ] No screen is a dead end (every screen has back/close/tabs)
- [ ] No destructive action happens on single tap (confirm dialogs)
- [ ] No data fetch shows a blank screen (skeletons/spinners/error states)
- [ ] No text input submits without visible button
- [ ] No exercise is broken by missing audio/images (graceful fallbacks)
- [ ] Hearts-at-zero is handled before lesson starts
- [ ] Streak logic runs on app open
- [ ] Admin unsaved changes are protected
- [ ] Touch targets are >= 44pt
- [ ] All interactive elements have accessibilityLabel or visible text
- [ ] Empty states have helpful messages, not blank space

Fix everything you find. Atomic commits per fix category (navigation fixes, input fixes, gamification fixes, admin fixes, accessibility fixes). Update PROGRESS.md when done.