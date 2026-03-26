import { useCallback, useEffect, useState } from 'react';

import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { useLanguagePair } from '@/hooks/useLanguagePair';
import type { Module, UserModuleProgress } from '@/types/index';

export interface ModuleWithProgress extends Module {
  progress?: UserModuleProgress | null;
}

export function useModules() {
  const userId = useAuthStore((s) => s.user?.id);
  const { currentAL, currentLL } = useLanguagePair();
  const [modules, setModules] = useState<ModuleWithProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!currentAL || !currentLL) {
      setModules([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { data: pair } = await supabase
        .from('language_pairs')
        .select('id')
        .eq('app_language_id', currentAL.id)
        .eq('learning_language_id', currentLL.id)
        .maybeSingle();
      const pairId = (pair as { id: string } | null)?.id;
      if (!pairId) {
        setModules([]);
        return;
      }
      const { data: mods, error: e1 } = await supabase
        .from('modules')
        .select('*')
        .eq('language_pair_id', pairId)
        .eq('is_published', true)
        .order('display_order', { ascending: true });
      if (e1) throw e1;
      let withProg: ModuleWithProgress[] = (mods ?? []) as Module[];
      if (userId) {
        const { data: prog } = await supabase
          .from('user_module_progress')
          .select('*')
          .eq('user_id', userId);
        const map = new Map(
          (prog as UserModuleProgress[] | null)?.map((p) => [p.module_id, p]) ??
            []
        );
        withProg = withProg.map((m) => ({
          ...m,
          progress: map.get(m.id) ?? null,
        }));
      }
      setModules(withProg);
    } catch {
      setError('load_failed');
      setModules([]);
    } finally {
      setLoading(false);
    }
  }, [currentAL, currentLL, userId]);

  useEffect(() => {
    void load();
  }, [load]);

  return { modules, loading, error, reload: load };
}
