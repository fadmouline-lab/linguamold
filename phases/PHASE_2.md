# PHASE 2 — AUTH + ONBOARDING

## Context
Phase 1 is complete. You have migrations, types, Supabase client, theme, and UI primitives. Now build the authentication and onboarding flow. Reference `context/MASTER_STRATEGY.md` Sections 5 and 7 if needed.

## Tasks

### 2.1 — Auth Store + Hook
- `stores/authStore.ts` — Zustand store holding: user, session, isLoading, isAuthenticated, role (user/superadmin)
- `hooks/useAuth.ts` — Functions: signIn(email, password), signUp(email, password, displayName), signOut(), getSession(), onAuthStateChange listener. All using the Supabase client from lib/supabase.ts. On sign-up, also create a row in user_profiles.

### 2.2 — UI String System
- `hooks/useUIString.ts` — A hook that:
  - Fetches all ui_strings for the current AL on first load (cache in Zustand)
  - Exports a `t(key: string) => string` function
  - If key not found, returns the key itself (useful for dev)
  - For now, hardcode a fallback dictionary of French UI strings directly in the file (50+ essential strings covering auth, onboarding, nav, errors, buttons). These will later come from the database.
- `stores/uiStringStore.ts` — Zustand store for cached strings

### 2.3 — Language Pair Hook
- `hooks/useLanguagePair.ts` — Manages the current AL + LL selection. Stores in AsyncStorage for persistence. Provides: currentAL, currentLL, setAL, setLL, availableLLs (fetched from language_pairs table for the given AL).

### 2.4 — Root Layout
- `app/_layout.tsx` — Root layout that:
  - Wraps app in SafeAreaProvider
  - Initializes auth state listener on mount
  - Shows a loading/splash screen while checking session
  - Redirects: no session → (auth)/login, session but no LL selected → (onboarding)/select-language, session + LL → (main)/home
  - Loads fonts if any custom ones are used

### 2.5 — Auth Screens
- `app/(auth)/login.tsx` — Email + password login. Themed with design system. Shows errors inline. "Don't have an account? Sign up" link. All text via t() function.
- `app/(auth)/register.tsx` — Email + password + display name. Same styling. "Already have an account? Login" link.
- `app/(auth)/forgot-password.tsx` — Email input, calls Supabase resetPasswordForEmail. Success message.
- `app/(auth)/_layout.tsx` — Simple Stack layout for auth screens.

### 2.6 — Onboarding Screens
- `app/(onboarding)/select-language.tsx` — Shows available LLs for the current AL (for MVP, just English with a British flag). Card-based selection. "What language do you want to learn?" in AL. On select, saves to user profile and navigates to proficiency.
- `app/(onboarding)/proficiency.tsx` — Self-assessment screen. 4 big cards:
  1. "Complete Beginner" (Je n'ai aucune connaissance)
  2. "Beginner" (Je connais quelques mots)
  3. "Intermediate" (Je peux tenir une conversation simple)
  4. "Advanced" (Je veux perfectionner mon niveau)
  Maps to difficulty levels 0, 1, 3, 4. On select:
  - If "Complete Beginner": skip placement test, assign to Module 1, go to home
  - Otherwise: navigate to placement test (which we'll build in Phase 7; for now, just go to home with the selected level)
- `app/(onboarding)/_layout.tsx` — Stack layout for onboarding.

### 2.7 — Index / Entry Point
- `app/index.tsx` — Redirects based on auth state to the appropriate screen. Can just be a Redirect component or useEffect with router.replace.

### 2.8 — Update Tracking
Update PROGRESS.md and FILE_MANIFEST.md.

## Completion Criteria
- [ ] Can register a new user (writes to auth.users + user_profiles)
- [ ] Can log in and get redirected to onboarding
- [ ] Language selection saves to user profile
- [ ] Proficiency selection saves to user profile
- [ ] t() function returns French strings for all UI text
- [ ] All screens follow the design system
- [ ] No TypeScript errors

## WHEN DONE: Proceed immediately to phases/PHASE_3.md
