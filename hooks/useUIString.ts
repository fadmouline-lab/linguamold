import { useCallback, useEffect } from 'react';

import { FRENCH_UI_FALLBACK } from '@/lib/french-ui-fallback';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { useUiStringStore } from '@/stores/uiStringStore';

/** MVP: French AL uuid resolved after languages load; fallback keys work without DB */
export function useUIString() {
  const user = useAuthStore((s) => s.user);
  const { strings, setStrings, isLoaded } = useUiStringStore();

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const { data: fr } = await supabase
          .from('languages')
          .select('id')
          .eq('code', 'fr')
          .maybeSingle();
        const langId = fr?.id as string | undefined;
        if (!langId) {
          if (!cancelled) setStrings('fr-fallback', { ...FRENCH_UI_FALLBACK });
          return;
        }
        const { data: rows, error } = await supabase
          .from('ui_strings')
          .select('string_key, value')
          .eq('language_id', langId);
        if (error || !rows) {
          if (!cancelled)
            setStrings(langId, { ...FRENCH_UI_FALLBACK });
          return;
        }
        const map: Record<string, string> = { ...FRENCH_UI_FALLBACK };
        for (const row of rows as { string_key: string; value: string }[]) {
          map[row.string_key] = row.value;
        }
        if (!cancelled) setStrings(langId, map);
      } catch {
        if (!cancelled) setStrings('fr-fallback', { ...FRENCH_UI_FALLBACK });
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [user?.id, setStrings]);

  const t = useCallback(
    (key: string) => {
      const v = strings[key];
      if (v !== undefined && v !== '') return v;
      return FRENCH_UI_FALLBACK[key] ?? key;
    },
    [strings]
  );

  return { t, isLoaded };
}
