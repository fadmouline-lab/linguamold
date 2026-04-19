import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect } from 'react';

import { APP_STRINGS_FALLBACK } from '@/lib/app-strings-fallback';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { useUiStringStore } from '@/stores/uiStringStore';

/** Supported App Language codes (must match columns in app_strings table). */
const VALID_AL_CODES = ['en', 'fr', 'fa', 'ar', 'ru', 'tr', 'ur', 'sw', 'bn'] as const;
type AlCode = (typeof VALID_AL_CODES)[number];

const CACHE_KEY_PREFIX = 'app_strings_v1_';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Loads all app strings for the current App Language once per session.
 * Caches in AsyncStorage (24h TTL) for offline access.
 * Exposes a t(key, vars?) function that supports {{variable}} interpolation.
 *
 * Fallback chain: DB → AsyncStorage → APP_STRINGS_FALLBACK → key itself
 */
export function useUIString() {
  const user = useAuthStore((s) => s.user);
  const { strings, setStrings, isLoaded } = useUiStringStore();

  useEffect(() => {
    if (isLoaded) return; // Already loaded for this session

    let cancelled = false;

    const load = async () => {
      // Determine the App Language for the current user
      let al: AlCode = 'fr'; // Default to French (MVP)
      if (user?.id) {
        try {
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('preferred_al')
            .eq('id', user.id)
            .maybeSingle();
          const pref = (profile as { preferred_al?: string } | null)?.preferred_al;
          if (pref && (VALID_AL_CODES as readonly string[]).includes(pref)) {
            al = pref as AlCode;
          }
        } catch {
          // profile fetch failed — stay with 'fr' default
        }
      }

      // 1. Try AsyncStorage cache
      try {
        const cached = await AsyncStorage.getItem(CACHE_KEY_PREFIX + al);
        if (cached) {
          const { data, ts } = JSON.parse(cached) as {
            data: Record<string, string>;
            ts: number;
          };
          if (Date.now() - ts < CACHE_TTL_MS) {
            if (!cancelled) setStrings(al, data);
            return;
          }
        }
      } catch {
        // Cache miss or parse error — continue to DB fetch
      }

      // 2. Fetch from DB: one query, all strings for this AL
      try {
        const { data: rows, error } = await supabase
          .from('app_strings')
          .select(`string_key, ${al}, en`);

        if (error || !rows) throw new Error('DB fetch failed');

        // Build map: AL value > EN fallback > skip
        const map: Record<string, string> = { ...APP_STRINGS_FALLBACK };
        for (const row of rows as Array<Record<string, string>>) {
          const val = row[al] ?? row['en'];
          if (val) map[row['string_key']] = val;
        }

        if (!cancelled) {
          setStrings(al, map);
          // Write to AsyncStorage for offline access
          try {
            await AsyncStorage.setItem(
              CACHE_KEY_PREFIX + al,
              JSON.stringify({ data: map, ts: Date.now() })
            );
          } catch {
            // AsyncStorage full or unavailable — in-memory cache still works
          }
        }
      } catch {
        // DB unavailable — use fallback constant
        if (!cancelled) setStrings(al, { ...APP_STRINGS_FALLBACK });
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [user?.id, isLoaded, setStrings]);

  /**
   * Look up a string by key, optionally substituting {{variable}} placeholders.
   *
   * @example
   * t('lesson.correct')                          // "Correct!"
   * t('gamify.level_up', { level: 5 })           // "Level 5 reached!"
   * t('gamify.hearts_regen', { time: '2:34' })   // "Next life in 2:34"
   */
  const t = useCallback(
    (key: string, vars?: Record<string, string | number>): string => {
      const raw = strings[key] ?? APP_STRINGS_FALLBACK[key] ?? key;
      if (!vars) return raw;
      return raw.replace(/\{\{(\w+)\}\}/g, (_, k: string) =>
        String(vars[k] ?? `{{${k}}}`)
      );
    },
    [strings]
  );

  return { t, isLoaded };
}
