import { useCallback } from 'react';

import { APP_STRINGS_FALLBACK } from '@/lib/app-strings-fallback';
import { APP_STRINGS_FR_PRIORITY } from '@/lib/app-strings-fr-priority';
import { useUiStringStore } from '@/stores/uiStringStore';

/**
 * UI copy helper. Strings are loaded once from the root bootstrap (`loadAppStrings`);
 * this hook only reads the store and interpolates {{var}} placeholders.
 *
 * Fallback chain: store → FR priority (MVP) → EN fallback → key
 */
export function useUIString() {
  const { strings, isLoaded } = useUiStringStore();

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>): string => {
      const raw =
        strings[key] ??
        APP_STRINGS_FR_PRIORITY[key] ??
        APP_STRINGS_FALLBACK[key] ??
        key;
      if (!vars) return raw;
      return raw.replace(/\{\{(\w+)\}\}/g, (_, k: string) =>
        String(vars[k] ?? `{{${k}}}`)
      );
    },
    [strings]
  );

  return { t, isLoaded };
}
