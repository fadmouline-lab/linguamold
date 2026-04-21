import AsyncStorage from '@react-native-async-storage/async-storage';

import { APP_STRINGS_FALLBACK } from '@/lib/app-strings-fallback';
import { APP_STRINGS_FR_PRIORITY } from '@/lib/app-strings-fr-priority';
import { supabase } from '@/lib/supabase';
import { useUiStringStore } from '@/stores/uiStringStore';

const VALID_AL_CODES = ['en', 'fr', 'fa', 'ar', 'ru', 'tr', 'ur', 'sw', 'bn'] as const;
type AlCode = (typeof VALID_AL_CODES)[number];

const CACHE_KEY_PREFIX = 'app_strings_v1_';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

function offlineMergedMap(): Record<string, string> {
  return { ...APP_STRINGS_FALLBACK, ...APP_STRINGS_FR_PRIORITY };
}

async function resolveAlCode(userId: string | null): Promise<AlCode> {
  if (!userId) return 'fr';
  try {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('preferred_al')
      .eq('id', userId)
      .maybeSingle();
    const uuid = (profile as { preferred_al?: string | null } | null)?.preferred_al;
    if (!uuid) return 'fr';
    const { data: lang } = await supabase
      .from('languages')
      .select('code')
      .eq('id', uuid)
      .maybeSingle();
    const code = (lang as { code: string } | null)?.code;
    if (code && (VALID_AL_CODES as readonly string[]).includes(code)) {
      return code as AlCode;
    }
  } catch {
    /* ignore */
  }
  return 'fr';
}

/**
 * Single entry point: load app_strings for resolved AL, cache 24h, merge FR priority + EN fallback + DB.
 * Call from root bootstrap on auth changes; do not mount per-screen effects.
 */
export async function loadAppStrings(userId: string | null): Promise<void> {
  const al = await resolveAlCode(userId);
  const setStrings = useUiStringStore.getState().setStrings;

  try {
    const cached = await AsyncStorage.getItem(CACHE_KEY_PREFIX + al);
    if (cached) {
      const { data, ts } = JSON.parse(cached) as {
        data: Record<string, string>;
        ts: number;
      };
      if (Date.now() - ts < CACHE_TTL_MS) {
        setStrings(al, data);
        return;
      }
    }
  } catch {
    /* continue */
  }

  const base = offlineMergedMap();

  try {
    const { data: rows, error } = await supabase
      .from('app_strings')
      .select(`string_key, ${al}, en`);

    if (error || !rows) throw new Error(error?.message ?? 'DB fetch failed');

    const map: Record<string, string> = { ...base };
    for (const row of rows as Array<Record<string, string>>) {
      const val = row[al] ?? row['en'];
      if (val) map[row['string_key']] = val;
    }

    setStrings(al, map);
    try {
      await AsyncStorage.setItem(
        CACHE_KEY_PREFIX + al,
        JSON.stringify({ data: map, ts: Date.now() })
      );
    } catch {
      /* ignore */
    }
  } catch {
    setStrings(al, { ...base });
  }
}
