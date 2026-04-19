# LOCALIZATION OVERHAUL — Zero Hardcoded App Language Strings

Read `context/MASTER_STRATEGY.md` for architecture context and `.cursorrules` for coding standards.

## The Problem
The app currently has French strings hardcoded throughout the frontend — in JSX, in fallback dictionaries, in component files. This means adding a new App Language (like Farsi) requires touching hundreds of files. That's unacceptable for an app whose entire value proposition is serving underserved languages.

## The Goal
After this change:
- **Zero hardcoded AL strings anywhere in the codebase.** Not in JSX, not in fallback objects, not in constants. Every user-facing string comes from the database via the `t()` function.
- **Adding a new App Language = one SQL column + one backfill query.** No frontend changes.
- **All strings load once at login** (or language switch) and are cached in memory for the session. No per-screen fetches.

## Task 1: New Table Design

Replace or restructure the existing `ui_strings` table with this column-per-language approach:

```sql
-- Migration: Replace ui_strings with app_strings
-- This table stores EVERY user-facing string in the app.
-- Each row is a unique string. Each language gets its own column.
-- Adding a new App Language = ALTER TABLE ADD COLUMN + UPDATE statements.

CREATE TABLE IF NOT EXISTS app_strings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- The lookup key used in frontend code: t('home.welcome_back')
  string_key VARCHAR(200) UNIQUE NOT NULL,
  
  -- Category for organization and bulk operations
  category VARCHAR(50) NOT NULL,
  -- Examples: 'auth', 'onboarding', 'navigation', 'lesson', 
  -- 'gamification', 'shop', 'profile', 'admin', 'errors', 'buttons',
  -- 'mold_feedback', 'achievements', 'notifications', 'empty_states'
  
  -- English is the source/reference language (always filled)
  en TEXT NOT NULL,
  
  -- App Languages — one column per AL we support
  fr TEXT,          -- French (MVP)
  fa TEXT,          -- Farsi (next release)
  ar TEXT,          -- Arabic
  ru TEXT,          -- Russian
  tr TEXT,          -- Turkish
  ur TEXT,          -- Urdu
  sw TEXT,          -- Swahili
  bn TEXT,          -- Bengali
  
  -- Context for translators/LLMs generating translations
  context_note TEXT,
  -- Example: "Shown on the home screen when user returns after a session"
  -- Example: "Button label, must be short (max 15 chars)"
  -- Example: "Success message after correct answer, can be playful"
  
  -- Max character limit (helps translators/LLMs keep translations compact)
  max_chars INT,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast bulk loading by language
CREATE INDEX idx_app_strings_key ON app_strings(string_key);
CREATE INDEX idx_app_strings_category ON app_strings(category);

-- RLS: Everyone can read, only superadmins can write
ALTER TABLE app_strings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anyone_can_read_strings" ON app_strings
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "superadmin_can_write_strings" ON app_strings
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'superadmin'));
```

**Write this migration to `migrations/020_app_strings.sql`.**

**Why column-per-language instead of row-per-language:**
- One query loads ALL strings for a language: `SELECT string_key, fr FROM app_strings`
- Adding a new language is one ALTER TABLE + one UPDATE/backfill
- A translator or LLM can see the English source right next to the translation in the same row
- SuperAdmin can view/edit source + translation side by side
- No JOINs needed, no pivot tables, no language_id lookups

## Task 2: Backfill — Comprehensive French Strings

Generate INSERT statements for EVERY string the app needs. This must be exhaustive. Go through every file in `app/` and `components/` and extract every piece of user-facing text.

**Minimum string count by category:**

### auth (15+ strings)
```
auth.login_title                → "Connexion" / "Log in"
auth.register_title             → "Créer un compte" / "Create account"
auth.email_label                → "Adresse e-mail" / "Email address"
auth.email_placeholder          → "ton@email.com" / "your@email.com"
auth.password_label             → "Mot de passe" / "Password"
auth.password_placeholder       → "Ton mot de passe" / "Your password"
auth.display_name_label         → "Ton prénom" / "Your first name"
auth.login_button               → "Se connecter" / "Log in"
auth.register_button            → "Créer mon compte" / "Create my account"
auth.forgot_password            → "Mot de passe oublié?" / "Forgot password?"
auth.no_account                 → "Pas de compte?" / "No account?"
auth.has_account                → "Déjà inscrit(e)?" / "Already registered?"
auth.signup_link                → "Inscris-toi" / "Sign up"
auth.login_link                 → "Connecte-toi" / "Log in"
auth.reset_password_title       → "Réinitialiser le mot de passe" / "Reset password"
auth.reset_password_sent        → "Un e-mail de réinitialisation a été envoyé!" / "Reset email sent!"
auth.reset_password_button      → "Envoyer le lien" / "Send link"
```

### onboarding (12+ strings)
```
onboarding.welcome_title        → "Bienvenue sur LinguaMold!" / "Welcome to LinguaMold!"
onboarding.select_language      → "Quelle langue veux-tu apprendre?" / "What language do you want to learn?"
onboarding.select_level         → "Quel est ton niveau?" / "What's your level?"
onboarding.level_beginner       → "Débutant complet" / "Complete beginner"
onboarding.level_beginner_desc  → "Je n'ai aucune connaissance" / "I have no knowledge"
onboarding.level_elementary     → "Débutant" / "Beginner"
onboarding.level_elementary_desc→ "Je connais quelques mots" / "I know a few words"
onboarding.level_intermediate   → "Intermédiaire" / "Intermediate"
onboarding.level_intermediate_desc → "Je peux tenir une conversation simple" / "I can hold a simple conversation"
onboarding.level_advanced       → "Avancé" / "Advanced"
onboarding.level_advanced_desc  → "Je veux perfectionner mon niveau" / "I want to perfect my level"
onboarding.continue             → "Continuer" / "Continue"
onboarding.start_learning       → "Commencer à apprendre!" / "Start learning!"
```

### navigation (8+ strings)
```
nav.home                        → "Accueil" / "Home"
nav.leaderboard                 → "Classement" / "Leaderboard"
nav.profile                     → "Profil" / "Profile"
nav.browse                      → "Explorer" / "Browse"
nav.shop                        → "Boutique" / "Shop"
nav.admin                       → "Admin" / "Admin"
nav.back                        → "Retour" / "Back"
nav.close                       → "Fermer" / "Close"
```

### lesson (25+ strings)
```
lesson.loading                  → "Chargement de ta leçon..." / "Loading your lesson..."
lesson.exit_confirm_title       → "Quitter la leçon?" / "Leave lesson?"
lesson.exit_confirm_message     → "Ta progression pour cette leçon sera perdue." / "Your progress for this lesson will be lost."
lesson.exit_confirm_stay        → "Continuer la leçon" / "Continue lesson"
lesson.exit_confirm_leave       → "Quitter" / "Leave"
lesson.correct_generic          → "Bravo!" / "Great job!"
lesson.correct_perfect          → "Parfait!" / "Perfect!"
lesson.correct_excellent        → "Excellent!" / "Excellent!"
lesson.correct_amazing          → "Incroyable!" / "Amazing!"
lesson.wrong_generic            → "Pas tout à fait..." / "Not quite..."
lesson.wrong_try_again          → "Essaie encore!" / "Try again!"
lesson.wrong_almost             → "Presque!" / "Almost!"
lesson.wrong_check_spelling     → "Vérifie l'orthographe!" / "Check your spelling!"
lesson.next                     → "Continuer" / "Continue"
lesson.check                    → "Vérifier" / "Check"
lesson.skip                     → "Passer" / "Skip"
lesson.complete_title           → "Leçon terminée!" / "Lesson complete!"
lesson.complete_perfect         → "Sans faute!" / "Flawless!"
lesson.complete_score           → "Ton score" / "Your score"
lesson.complete_xp              → "XP gagnés" / "XP earned"
lesson.complete_continue        → "Continuer" / "Continue"
lesson.no_hearts_title          → "Plus de vies!" / "No lives left!"
lesson.no_hearts_message        → "Attends que tes vies se régénèrent ou utilise des gemmes." / "Wait for your lives to regenerate or use gems."
lesson.no_hearts_timer          → "Prochaine vie dans" / "Next life in"
lesson.no_hearts_refill         → "Recharger mes vies" / "Refill my lives"
lesson.review_mode              → "Mode révision" / "Review mode"
```

### mold-specific (20+ strings)
```
mold.fill_blank_prompt          → "Trouve le mot manquant" / "Find the missing word"
mold.translate_prompt           → "Traduis cette phrase" / "Translate this sentence"
mold.reorder_prompt             → "Remets les mots dans l'ordre" / "Put the words in order"
mold.listen_prompt              → "Qu'as-tu entendu?" / "What did you hear?"
mold.speak_prompt               → "Prononce ce mot" / "Say this word"
mold.match_prompt               → "Associe les paires" / "Match the pairs"
mold.image_prompt               → "Sélectionne la bonne image" / "Select the correct image"
mold.conversation_prompt        → "Écoute la conversation" / "Listen to the conversation"
mold.verb_prompt                → "Choisis le bon verbe" / "Choose the correct verb"
mold.flashcard_knew             → "Je le savais!" / "I knew it!"
mold.flashcard_review           → "À revoir" / "Need review"
mold.flashcard_tap_to_flip      → "Appuie pour retourner" / "Tap to flip"
mold.type_hear_prompt           → "Écris ce que tu entends" / "Type what you hear"
mold.true_false_prompt          → "Cette traduction est-elle correcte?" / "Is this translation correct?"
mold.true_label                 → "Vrai" / "True"
mold.false_label                → "Faux" / "False"
mold.replay_audio               → "Rejouer" / "Replay"
mold.show_hint                  → "Indice" / "Hint"
mold.show_transcript            → "Voir la transcription" / "Show transcript"
mold.hide_transcript            → "Masquer" / "Hide"
```

### gamification (20+ strings)
```
gamify.streak_title             → "Série en cours" / "Current streak"
gamify.streak_maintained        → "Jour {{count}}! Continue comme ça! 🔥" / "Day {{count}}! Keep it up! 🔥"
gamify.streak_lost              → "Ta série est terminée. Recommençons!" / "Your streak ended. Let's start again!"
gamify.streak_freeze_used       → "Gel de série utilisé! Ta série est sauvée!" / "Streak freeze used! Your streak is saved!"
gamify.xp_earned                → "+{{count}} XP" / "+{{count}} XP"
gamify.level_up                 → "Niveau {{level}}!" / "Level {{level}}!"
gamify.level_up_message         → "Tu es passé(e) au niveau {{level}}!" / "You've reached level {{level}}!"
gamify.hearts_full              → "Vies pleines" / "Full lives"
gamify.hearts_regen             → "Prochaine vie dans {{time}}" / "Next life in {{time}}"
gamify.leaderboard_title        → "Classement de la semaine" / "Weekly leaderboard"
gamify.leaderboard_resets       → "Réinitialisation dans" / "Resets in"
gamify.leaderboard_empty        → "Complète une leçon pour apparaître ici!" / "Complete a lesson to appear here!"
gamify.leaderboard_invite       → "Invite tes amis!" / "Invite your friends!"
gamify.achievement_unlocked     → "Badge débloqué!" / "Achievement unlocked!"
gamify.achievements_title       → "Badges" / "Achievements"
gamify.achievements_empty       → "Tes badges apparaîtront ici." / "Your badges will appear here."
gamify.module_complete          → "Module terminé! 🎉" / "Module complete! 🎉"
gamify.perfect_lesson           → "Leçon parfaite! ⭐" / "Perfect lesson! ⭐"
gamify.daily_goal_reached       → "Objectif quotidien atteint!" / "Daily goal reached!"
gamify.combo_bonus              → "Combo! +{{count}} XP bonus" / "Combo! +{{count}} XP bonus"
```

### shop (10+ strings)
```
shop.title                      → "Boutique" / "Shop"
shop.gems_count                 → "Tes gemmes" / "Your gems"
shop.refill_hearts              → "Recharger les vies" / "Refill lives"
shop.refill_hearts_desc         → "Restaure tes 5 vies" / "Restore your 5 lives"
shop.streak_freeze              → "Gel de série" / "Streak freeze"
shop.streak_freeze_desc         → "Protège 1 jour manqué" / "Protect 1 missed day"
shop.double_xp                  → "Double XP (1 heure)" / "Double XP (1 hour)"
shop.coming_soon                → "Bientôt disponible" / "Coming soon"
shop.get_gems                   → "Obtenir des gemmes" / "Get gems"
shop.buy_button                 → "Acheter — {{cost}} 💎" / "Buy — {{cost}} 💎"
shop.not_enough_gems            → "Pas assez de gemmes!" / "Not enough gems!"
shop.purchase_confirm           → "Confirmer l'achat?" / "Confirm purchase?"
```

### profile (15+ strings)
```
profile.title                   → "Mon profil" / "My profile"
profile.total_xp                → "XP total" / "Total XP"
profile.current_streak          → "Série actuelle" / "Current streak"
profile.lessons_done            → "Leçons terminées" / "Lessons completed"
profile.days_active             → "Jours actifs" / "Days active"
profile.learning_since          → "J'apprends depuis" / "Learning since"
profile.settings                → "Paramètres" / "Settings"
profile.daily_reminder          → "Rappel quotidien" / "Daily reminder"
profile.daily_goal              → "Objectif quotidien" / "Daily goal"
profile.daily_goal_minutes      → "{{count}} minutes par jour" / "{{count}} minutes per day"
profile.change_language         → "Changer de langue" / "Change language"
profile.logout                  → "Se déconnecter" / "Log out"
profile.logout_confirm          → "Tu veux vraiment te déconnecter?" / "Are you sure you want to log out?"
profile.edit_name               → "Modifier le nom" / "Edit name"
profile.save                    → "Sauvegarder" / "Save"
```

### admin (12+ strings)
```
admin.mode_label                → "Mode Admin" / "Admin Mode"
admin.banner_label              → "[ADMIN]" / "[ADMIN]"
admin.select_al                 → "Langue de l'app" / "App language"
admin.select_ll                 → "Langue d'apprentissage" / "Learning language"
admin.enter                     → "Entrer en mode admin" / "Enter admin mode"
admin.save                      → "Sauvegarder" / "Save"
admin.cancel                    → "Annuler" / "Cancel"
admin.unsaved_title             → "Modifications non sauvegardées" / "Unsaved changes"
admin.unsaved_message           → "Sauvegarder avant de quitter?" / "Save before leaving?"
admin.unsaved_discard           → "Abandonner" / "Discard"
admin.reorder_hint              → "Maintiens pour réorganiser" / "Hold to reorder"
admin.add_exercise              → "Ajouter un exercice" / "Add exercise"
admin.delete_exercise           → "Supprimer l'exercice" / "Delete exercise"
admin.publish                   → "Publier" / "Publish"
admin.unpublish                 → "Dépublier" / "Unpublish"
```

### errors (10+ strings)
```
error.generic                   → "Quelque chose s'est mal passé." / "Something went wrong."
error.network                   → "Pas de connexion internet." / "No internet connection."
error.network_retry             → "Réessayer" / "Try again"
error.login_failed              → "E-mail ou mot de passe incorrect." / "Incorrect email or password."
error.register_failed           → "Impossible de créer le compte." / "Could not create account."
error.email_taken               → "Cet e-mail est déjà utilisé." / "This email is already in use."
error.weak_password             → "Le mot de passe doit contenir au moins 6 caractères." / "Password must be at least 6 characters."
error.load_lesson               → "Impossible de charger la leçon." / "Could not load the lesson."
error.save_failed               → "Sauvegarde échouée. Réessaye." / "Save failed. Try again."
error.session_expired           → "Reconnecte-toi pour continuer." / "Log in again to continue."
```

### empty_states (8+ strings)
```
empty.adventure_start           → "Ton voyage commence ici! Appuie sur le premier module. 🌟" / "Your journey starts here! Tap the first module. 🌟"
empty.no_lessons                → "Aucune leçon disponible pour le moment." / "No lessons available yet."
empty.no_achievements           → "Tes badges apparaîtront ici. Continue à apprendre!" / "Your badges will appear here. Keep learning!"
empty.no_leaderboard            → "Complète une leçon pour rejoindre le classement!" / "Complete a lesson to join the leaderboard!"
empty.no_progress               → "Pas encore de progression. Commence ta première leçon!" / "No progress yet. Start your first lesson!"
empty.no_modules                → "Aucun module disponible." / "No modules available."
empty.browse_locked             → "Continue ton parcours pour débloquer plus de modules!" / "Continue your path to unlock more modules!"
empty.search_no_results         → "Aucun résultat trouvé." / "No results found."
```

### buttons (common reusable)
```
btn.continue                    → "Continuer" / "Continue"
btn.next                        → "Suivant" / "Next"
btn.back                        → "Retour" / "Back"
btn.cancel                      → "Annuler" / "Cancel"
btn.save                        → "Sauvegarder" / "Save"
btn.retry                       → "Réessayer" / "Try again"
btn.skip                        → "Passer" / "Skip"
btn.confirm                     → "Confirmer" / "Confirm"
btn.done                        → "Terminé" / "Done"
btn.start                       → "Commencer" / "Start"
btn.yes                         → "Oui" / "Yes"
btn.no                          → "Non" / "No"
```

**Note on interpolation:** Strings with `{{variable}}` syntax (like `{{count}}`, `{{time}}`, `{{level}}`) must be supported by the t() function. The function should accept a second argument for substitutions: `t('gamify.xp_earned', { count: 10 })` → "+10 XP".

## Task 3: Frontend — Rewrite the t() system

The `useUIString` hook and underlying store need to be rebuilt:

```typescript
// hooks/useUIString.ts — the new implementation

// 1. At login (or language switch), fetch ALL strings for the current AL:
//    SELECT string_key, {al_column} FROM app_strings
//    Example for French: SELECT string_key, fr FROM app_strings
//
// 2. Store as a flat Map<string, string> in Zustand
//
// 3. Export t(key, substitutions?) function:
//    t('lesson.correct_generic') → "Bravo!"
//    t('gamify.xp_earned', { count: 10 }) → "+10 XP"
//    t('gamify.hearts_regen', { time: '2:34' }) → "Prochaine vie dans 2:34"
//
// 4. If key not found, return the English fallback (fetch en column as backup)
//    If English also missing, return the key itself (for debugging)
//
// 5. Expose a loading state so screens can show skeletons while strings load

// The AL column name comes from the languages table:
// languages.code = 'fr' → column name = 'fr'
// This means the user_profiles.preferred_al determines which column to query
```

**The store should:**
- Load once at login / app start
- Cache in AsyncStorage for offline access
- Reload when user switches App Language
- Expose `isLoaded` boolean for conditional rendering
- Never block the app from rendering — show English fallbacks while loading

## Task 4: Search and Replace Every Hardcoded String

**This is the critical step.** Go through EVERY file in `app/`, `components/`, and `hooks/` and:

1. Find every hardcoded French string in JSX (any text inside `<Text>`, `<Button>`, `title=`, `placeholder=`, `label=`, alert messages, etc.)
2. Find every hardcoded English string that appears as user-facing text
3. Find any fallback dictionaries or hardcoded string objects
4. Replace each one with a `t()` call using the appropriate key from the app_strings table
5. If a string doesn't exist in the table above, ADD IT to the backfill SQL

**Search patterns to find hardcoded strings:**
```bash
# French text in JSX
grep -rn "[àâäéèêëîïôùûüÿçœæ]" app/ components/
# Quoted strings in JSX that aren't imports or keys
grep -rn '<Text[^>]*>.*[A-Za-z]' app/ components/
# Alert/confirm messages
grep -rn 'Alert\.' app/ components/
# Placeholder text
grep -rn 'placeholder=' app/ components/
# Title props
grep -rn 'title=' app/ components/
```

**Do not miss:**
- Error messages in catch blocks
- Toast/notification messages
- Accessibility labels
- Navigation header titles
- Tab labels
- Modal/dialog text
- Empty state messages
- Validation error messages

## Task 5: SQL Output

Create these files:

**`migrations/020_app_strings.sql`** — The CREATE TABLE migration from Task 1.

**`migrations/021_app_strings_backfill.sql`** — All INSERT statements with COMPLETE en and fr columns filled. Use this format:
```sql
INSERT INTO app_strings (string_key, category, en, fr, context_note, max_chars) VALUES
('auth.login_title', 'auth', 'Log in', 'Connexion', 'Title on login screen', 20),
('auth.register_title', 'auth', 'Create account', 'Créer un compte', 'Title on register screen', 25),
-- ... all strings ...
ON CONFLICT (string_key) DO UPDATE SET
  en = EXCLUDED.en,
  fr = EXCLUDED.fr,
  context_note = EXCLUDED.context_note,
  max_chars = EXCLUDED.max_chars,
  updated_at = NOW();
```

The ON CONFLICT clause makes this safe to run multiple times.

**`migrations/022_drop_old_ui_strings.sql`** — If the old `ui_strings` table exists, migrate any data from it into app_strings, then drop it. If nothing references it, just drop it.

## Task 6: Verify Completeness

After all changes:
1. `grep -rn "\"[A-Z]" app/ components/ | grep -v import | grep -v require | grep -v '//' | grep -v 'key=' | grep -v 'mold_type'` — this should return ZERO user-facing hardcoded strings
2. `npx tsc --noEmit` — no TypeScript errors
3. Count the total strings in the backfill SQL. It should be **150+**. If it's under 120, you missed things.
4. Verify the t() function supports interpolation: `t('key', { var: 'value' })`
5. Verify AsyncStorage caching works (strings available offline after first load)

Update PROGRESS.md with everything changed. List every file modified and every string extracted.