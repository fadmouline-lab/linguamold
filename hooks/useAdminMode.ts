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
