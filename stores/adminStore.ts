import { create } from 'zustand';

import type { Language } from '@/types/index';

export interface AdminState {
  isAdminMode: boolean;
  selectedAL: Language | null;
  selectedLL: Language | null;
  editingExerciseId: string | null;
  editedContent: Record<string, unknown> | null;
  hasUnsavedChanges: boolean;
  isSaving: boolean;
  setAdminMode: (isAdminMode: boolean) => void;
  setLanguages: (al: Language | null, ll: Language | null) => void;
  startEditing: (exerciseId: string, content: Record<string, unknown>) => void;
  setEdited: (c: Record<string, unknown> | null) => void;
  setSaving: (v: boolean) => void;
  setUnsaved: (v: boolean) => void;
  resetEdit: () => void;
}

export const useAdminStore = create<AdminState>((set) => ({
  isAdminMode: false,
  selectedAL: null,
  selectedLL: null,
  editingExerciseId: null,
  editedContent: null,
  hasUnsavedChanges: false,
  isSaving: false,
  setAdminMode: (isAdminMode) => set({ isAdminMode }),
  setLanguages: (selectedAL, selectedLL) => set({ selectedAL, selectedLL }),
  startEditing: (editingExerciseId, editedContent) =>
    set({ editingExerciseId, editedContent, hasUnsavedChanges: false }),
  setEdited: (editedContent) =>
    set({ editedContent, hasUnsavedChanges: true }),
  setSaving: (isSaving) => set({ isSaving }),
  setUnsaved: (hasUnsavedChanges) => set({ hasUnsavedChanges }),
  resetEdit: () =>
    set({
      editingExerciseId: null,
      editedContent: null,
      hasUnsavedChanges: false,
      isSaving: false,
    }),
}));
