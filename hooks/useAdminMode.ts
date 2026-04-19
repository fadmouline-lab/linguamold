import { useCallback } from 'react';

import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { useAdminStore } from '@/stores/adminStore';
import type { Language } from '@/types/index';

export function useAdminMode() {
  const userId = useAuthStore((s) => s.user?.id);
  const role = useAuthStore((s) => s.role);
  const {
    setAdminMode,
    setLanguages,
    startEditing,
    setEdited,
    resetEdit,
    setSaving,
  } = useAdminStore();

  const checkIsAdmin = useCallback(() => role === 'superadmin', [role]);

  const toggleAdminMode = useCallback(() => {
    setAdminMode(!useAdminStore.getState().isAdminMode);
  }, [setAdminMode]);

  const setAdminLanguages = useCallback(
    (al: Language | null, ll: Language | null) => {
      setLanguages(al, ll);
    },
    [setLanguages]
  );

  const startEditingExercise = useCallback(
    (exerciseId: string, content: Record<string, unknown>) => {
      startEditing(exerciseId, content);
    },
    [startEditing]
  );

  const saveEdit = useCallback(
    async (exerciseId: string, newContent: Record<string, unknown>) => {
      // Validate content before saving
      if (!newContent || typeof newContent !== 'object') {
        throw new Error('Invalid content');
      }
      const options = newContent.options as Array<{ is_correct?: boolean }> | undefined;
      if (options !== undefined) {
        if (!Array.isArray(options) || options.length === 0) {
          throw new Error('Options must be a non-empty array');
        }
        if (!options.some((o) => o.is_correct === true)) {
          throw new Error('At least one option must be correct');
        }
      }
      const acceptedLL = newContent.accepted_answers_ll as string[] | undefined;
      if (acceptedLL !== undefined) {
        if (!Array.isArray(acceptedLL) || acceptedLL.length === 0 || acceptedLL.some((a) => !a.trim())) {
          throw new Error('Accepted answers must be non-empty');
        }
      }
      const accepted = newContent.accepted_answers as string[] | undefined;
      if (accepted !== undefined) {
        if (!Array.isArray(accepted) || accepted.length === 0 || accepted.some((a) => !a.trim())) {
          throw new Error('Accepted answers must be non-empty');
        }
      }

      setSaving(true);
      try {
        await supabase
          .from('exercises')
          .update({
            content: newContent,
            updated_at: new Date().toISOString(),
          })
          .eq('id', exerciseId);
        resetEdit();
      } finally {
        setSaving(false);
      }
    },
    [resetEdit, setSaving]
  );

  const cancelEdit = useCallback(() => {
    resetEdit();
  }, [resetEdit]);

  const reorderItems = useCallback(
    async (
      table: 'modules' | 'lessons' | 'exercises',
      items: { id: string; display_order: number }[]
    ) => {
      for (const it of items) {
        await supabase
          .from(table)
          .update({
            display_order: it.display_order,
            updated_at: new Date().toISOString(),
          })
          .eq('id', it.id);
      }
    },
    []
  );

  return {
    checkIsAdmin,
    toggleAdminMode,
    setAdminLanguages,
    startEditing: startEditingExercise,
    saveEdit,
    cancelEdit,
    reorderItems,
    setEditedContent: setEdited,
    userId,
  };
}
