# PHASE 6 — SUPERADMIN SYSTEM

## Context
Phase 5 is complete. The full user experience works: lessons, gamification, leaderboard, profile. Now build the SuperAdmin overlay that lets admins edit content inline. Reference `context/MASTER_STRATEGY.md` Section 6.

## Key Principle
The admin system is NOT a separate app. It's an overlay on top of the normal user experience. When admin mode is on, the same screens render with edit capabilities added on top. Think of it as a CMS that lives inside the app.

## Tasks

### 6.1 — Admin Store + Hook
- `stores/adminStore.ts` — Zustand store:
  - isAdminMode: boolean
  - selectedAL: Language | null
  - selectedLL: Language | null
  - editingExerciseId: string | null
  - editedContent: any (temporary edited JSONB before save)
  - hasUnsavedChanges: boolean
  - isSaving: boolean

- `hooks/useAdminMode.ts`:
  - `checkIsAdmin()` — reads user_profiles.role, returns boolean
  - `toggleAdminMode()` — flips isAdminMode in store
  - `setAdminLanguages(al, ll)` — sets which language pair to manage
  - `startEditing(exerciseId, content)` — enters edit mode for an exercise
  - `saveEdit(exerciseId, newContent)` — PATCHes exercises.content JSONB in Supabase
  - `cancelEdit()` — discards changes, exits edit mode
  - `reorderItems(table, items[])` — updates display_order for a list of items (modules, lessons, or exercises)

### 6.2 — Admin Toggle Bar
- `components/admin/AdminToggleBar.tsx`:
  - Orange/amber background bar fixed at top of screen
  - Shows: "[ADMIN] {AL flag} → {LL flag}"
  - Toggle switch to exit admin mode
  - Only visible when isAdminMode is true

### 6.3 — Inline Editor
- `components/admin/InlineEditor.tsx`:
  - Wraps any text content
  - In normal mode: renders children as-is
  - In admin mode: adds a subtle orange border on tap
  - On tap: replaces text with a TextInput (pre-filled with current value)
  - Shows Save (green) and Cancel (gray) buttons below the input
  - Save calls onSave callback with new value
  - Cancel reverts to original value
  - Props: value, onSave, fieldPath (dot-notation into JSONB), multiline?

### 6.4 — Reorderable List
- `components/admin/ReorderableList.tsx`:
  - Takes an array of items with id + display_order
  - In admin mode: each item shows a drag handle (≡ icon) on the left
  - Long press + drag to reorder (use react-native-gesture-handler)
  - On release: updates display_order for all affected items
  - Calls onReorder callback with new ordered array
  - Smooth reorder animation

### 6.5 — Admin Entry Screen
- `app/(admin)/index.tsx`:
  - Two dropdown/picker controls:
    - "App Language" — lists all active languages
    - "Learning Language" — lists all active languages (filtered to exclude AL)
  - "Enter Admin View" button (disabled until both are selected)
  - On tap: sets admin languages in store, navigates to admin modules view

### 6.6 — Admin Module Management
- `app/(admin)/modules.tsx`:
  - Shows all modules for the selected language pair
  - Uses ReorderableList — admin can drag to reorder
  - Each module row shows: order number, icon, title_al, difficulty badge, published toggle
  - Tap module → navigates to lessons view for that module
  - Tapping module title → InlineEditor to rename
  - Toggle published status with a switch

### 6.7 — Admin Lesson Management
- `app/(admin)/lessons/[moduleId].tsx`:
  - Shows all lessons for the selected module
  - ReorderableList for reordering
  - Each lesson row: order number, title_al, lesson_type badge, exercise count, published toggle
  - Tap lesson → navigates to exercise view
  - InlineEditor on title

### 6.8 — Admin Exercise Management
- `app/(admin)/exercises/[lessonId].tsx`:
  - Shows all exercises in the lesson
  - Each exercise renders its MOLD COMPONENT with isAdminMode=true
  - This means: the admin sees the exercise exactly as the user would, but every text field is tappable/editable
  - Between exercises: a thin divider with the exercise's mold_type label and order number
  - ReorderableList for reordering exercises
  - "Add Exercise" button at bottom (opens a mold type picker, creates a new exercise with template content)
  - Delete exercise button (with confirmation)

### 6.9 — Wire Admin Mode into Existing Screens
Modify the following existing screens to respect isAdminMode:

- `app/(main)/home.tsx` — When admin mode is on, show AdminToggleBar at top. ModuleNodes become reorderable.
- `app/(main)/_layout.tsx` — Add admin toggle button in header if user role is superadmin
- All mold components (from Phase 3) already accept isAdminMode prop — verify they handle it (text becomes editable, options become editable)

### 6.10 — Admin Layout
- `app/(admin)/_layout.tsx` — Stack navigator for admin screens with orange-tinted header. Back button navigates up the admin hierarchy.

### 6.11 — Update Tracking
Update PROGRESS.md and FILE_MANIFEST.md.

## Completion Criteria
- [ ] SuperAdmin can toggle admin mode on/off
- [ ] Admin can select AL + LL and enter admin view
- [ ] Admin can tap any text in any exercise and edit it inline
- [ ] Save button persists changes to exercises.content JSONB in Supabase
- [ ] Cancel button reverts changes
- [ ] Admin can reorder modules, lessons, and exercises via drag
- [ ] Reorder persists new display_order values to Supabase
- [ ] Admin can toggle published status
- [ ] Admin toggle bar visible in admin mode
- [ ] No TypeScript errors

## WHEN DONE: Proceed immediately to phases/PHASE_7.md
