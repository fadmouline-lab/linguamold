# PHASE 3 — MOLD COMPONENTS

## Context
Phase 2 is complete. Auth and onboarding work. Now build the core exercise system — all 12 mold components, the registry, scoring logic, and the audio player. This is the LARGEST phase. Reference `context/MASTER_STRATEGY.md` Section 3 for exact data shapes.

## IMPORTANT
Every mold component must implement the SAME interface. This is what makes the plug-and-play system work:

```typescript
interface MoldProps {
  exercise: Exercise;                                    // full exercise row from DB
  onAnswer: (isCorrect: boolean, answer: any) => void;   // report answer to lesson engine
  onNext: () => void;                                    // advance to next exercise
  isAdminMode?: boolean;                                 // enables inline editing
  onContentChange?: (newContent: any) => void;           // admin saves edits
}
```

## Tasks

### 3.1 — Audio Player
- `components/common/AudioPlayer.tsx` — A reusable component that:
  - Takes an `audioUrl` prop (can be a Supabase storage URL or null)
  - Shows a play button (speaker icon)
  - Plays audio via expo-av
  - Shows loading state while audio loads
  - Handles missing/failed audio gracefully (show disabled button, don't crash)
  - Optional `autoPlay` prop
- `lib/audio.ts` — Helper functions: playAudio(url), preloadAudio(url), stopAudio()

### 3.2 — Scoring Logic
- `lib/scoring.ts` — Export a function for each mold type that validates answers:
  - `scoreFillInTheBlank(content, selectedOption) → boolean`
  - `scoreTranslateSentence(content, userText) → boolean` (case-insensitive, trim whitespace, check against accepted_answers array)
  - `scoreWordReorder(content, userOrder) → boolean`
  - `scoreListenAndChoose(content, selectedOption) → boolean`
  - `scoreSpeakTheWord() → boolean` (always true for self-assess MVP)
  - `scoreMatchPairs(content, userPairs) → boolean`
  - `scoreImageSelect(content, selectedIndex) → boolean`
  - `scoreConversationListen(content, selectedOption) → boolean`
  - `scoreSelectCorrectVerb(content, selectedOption) → boolean`
  - `scoreFlashcard() → boolean` (always true — it's a review card)
  - `scoreTypeWhatYouHear(content, userText) → boolean`
  - `scoreTrueOrFalse(content, userAnswer) → boolean`
  - Main dispatcher: `scoreExercise(moldType, content, answer) → boolean`

### 3.3 — Mold Registry
- `lib/mold-registry.ts` — Maps mold_type strings to React components. Import all 12 mold components. Export `MoldRegistry` object and a `getMoldComponent(type: string)` function.

### 3.4 — Build All 12 Mold Components

For EACH component below, build a complete, beautiful, animated screen. Each must:
- Render the exercise prompt/question using the AL text from exercise.content
- Show the interactive element (options, input, cards, etc.)
- Play audio when relevant (auto-play or via AudioPlayer button)
- On user interaction: validate answer using scoring.ts
- Correct: green highlight + success message (from content or generic) + call onAnswer(true, ...) + show "Next" button
- Wrong: red highlight + shake animation + error explanation (from content) + call onAnswer(false, ...) + show "Continue" button
- Respect isAdminMode: when true, tapping text fields makes them editable
- Use theme tokens for all colors, spacing, typography

**Create these files:**

1. `components/molds/FillInTheBlank.tsx`
   - Shows sentence with a highlighted blank
   - 2-4 option buttons below
   - Tap option → validate → show result

2. `components/molds/TranslateSentence.tsx`
   - Shows AL sentence as prompt
   - Text input for user to type LL translation
   - "Check" button → validate against accepted_answers → show result
   - Show hint button (reveals hint_al)

3. `components/molds/WordReorder.tsx`
   - Shows scrambled word chips at bottom
   - Empty slots at top (sentence builder area)
   - Tap chip → moves to next slot
   - Tap placed chip → returns to pool
   - "Check" button → validate order → show result

4. `components/molds/ListenAndChoose.tsx`
   - Auto-plays audio on mount
   - Replay button
   - 2-4 option cards (each shows text_ll + text_al)
   - Tap option → validate → show result

5. `components/molds/SpeakTheWord.tsx`
   - Shows word in LL with phonetic pronunciation
   - Shows translation in AL
   - Big audio play button (hear native pronunciation)
   - For MVP: two buttons "I got it right" / "I need practice"
   - Both advance, but "need practice" marks for spaced repetition

6. `components/molds/MatchPairs.tsx`
   - Two columns: AL words on left, LL words on right (shuffled)
   - Tap one from left, then one from right to match
   - Correct match: both highlight green and fade/shrink
   - Wrong match: both flash red, deselect
   - Complete when all pairs matched

7. `components/molds/ImageSelect.tsx`
   - Plays audio (the word/phrase)
   - Shows 4 images in a 2x2 grid
   - Tap image → validate → show result
   - For MVP: use colored placeholder boxes with text labels if no images available

8. `components/molds/ConversationListen.tsx`
   - Plays conversation audio
   - Shows transcript toggle (tap to show/hide transcript in LL + AL)
   - Shows comprehension question in AL
   - 2-3 option buttons
   - Tap option → validate → show result

9. `components/molds/SelectCorrectVerb.tsx`
   - Shows sentence in LL with blank for verb
   - Shows translation hint in AL
   - 3 verb options as buttons
   - Tap option → validate → show result
   - On correct: show grammar_hint_al as educational note

10. `components/molds/Flashcard.tsx`
    - Shows word in LL on the "front" of a card
    - Tap to flip (3D flip animation using Reanimated)
    - Back shows: AL translation + example sentence + audio button
    - "Got it" / "Need review" buttons at bottom
    - Always counts as "correct" for progression

11. `components/molds/TypeWhatYouHear.tsx`
    - Plays audio on mount
    - Replay button (big, prominent)
    - Text input for user to type what they heard
    - "Check" button → validate against accepted_answers (case-insensitive, punctuation-tolerant)
    - Show hint if available

12. `components/molds/TrueOrFalse.tsx`
    - Shows a statement in LL
    - Shows a proposed translation in AL
    - "True" and "False" buttons (is the translation correct?)
    - On answer: show explanation_al regardless of correct/wrong

### 3.5 — Shared Exercise UI Components
- `components/common/SuccessMessage.tsx` — Green banner with success text + animation
- `components/common/ErrorMessage.tsx` — Red banner with explanation text + shake animation
- `components/common/OptionButton.tsx` — Reusable option button with selected/correct/wrong states
- `components/common/ExerciseHeader.tsx` — Shows mold type label + exercise prompt

### 3.6 — Quality Gate
Run `npx tsc --noEmit`. Fix ALL TypeScript errors before proceeding.

### 3.7 — Update Tracking
Update PROGRESS.md and FILE_MANIFEST.md.

## Completion Criteria
- [ ] All 12 mold components exist and compile
- [ ] MoldRegistry maps all 12 types to components
- [ ] scoring.ts handles all 12 types
- [ ] AudioPlayer works with expo-av
- [ ] Each component handles correct and incorrect states with animations
- [ ] Each component supports isAdminMode prop
- [ ] No TypeScript errors

## WHEN DONE: Proceed immediately to phases/PHASE_4.md
