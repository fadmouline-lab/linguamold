import { useCallback, useMemo } from 'react';

import {
  HEART_REGEN_MS,
  HEARTS_MAX,
} from '@/lib/constants';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';

export function useHearts() {
  const userId = useAuthStore((s) => s.user?.id);

  const regenCount = useCallback(
    (hearts: number, lastRegen: string): { hearts: number; last: string } => {
      if (hearts >= HEARTS_MAX) return { hearts, last: lastRegen };
      const last = new Date(lastRegen).getTime();
      const now = Date.now();
      const elapsed = now - last;
      const gained = Math.floor(elapsed / HEART_REGEN_MS);
      if (gained <= 0) return { hearts, last: lastRegen };
      const next = Math.min(HEARTS_MAX, hearts + gained);
      const newLast = new Date(last + gained * HEART_REGEN_MS).toISOString();
      return { hearts: next, last: newLast };
    },
    []
  );

  const loseHeart = useCallback(async () => {
    if (!userId) return;
    const { data } = await supabase
      .from('user_profiles')
      .select('hearts, hearts_last_regen')
      .eq('id', userId)
      .maybeSingle();
    const row = data as { hearts: number; hearts_last_regen: string } | null;
    if (!row) return;
    const synced = regenCount(row.hearts, row.hearts_last_regen);
    const next = Math.max(0, synced.hearts - 1);
    await supabase
      .from('user_profiles')
      .update({
        hearts: next,
        hearts_last_regen: synced.last,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);
    return next;
  }, [regenCount, userId]);

  const canPlay = useCallback(
    async (): Promise<boolean> => {
      if (!userId) return true;
      const { data } = await supabase
        .from('user_profiles')
        .select('hearts, hearts_last_regen')
        .eq('id', userId)
        .maybeSingle();
      const row = data as { hearts: number; hearts_last_regen: string } | null;
      if (!row) return true;
      const { hearts } = regenCount(row.hearts, row.hearts_last_regen);
      return hearts > 0;
    },
    [regenCount, userId]
  );

  const getTimeToNextHeart = useCallback(
    async (): Promise<number> => {
      if (!userId) return 0;
      const { data } = await supabase
        .from('user_profiles')
        .select('hearts, hearts_last_regen')
        .eq('id', userId)
        .maybeSingle();
      const row = data as { hearts: number; hearts_last_regen: string } | null;
      if (!row) return 0;
      const { hearts, last } = regenCount(row.hearts, row.hearts_last_regen);
      if (hearts >= HEARTS_MAX) return 0;
      const lastMs = new Date(last).getTime();
      const nextAt = lastMs + HEART_REGEN_MS;
      return Math.max(0, Math.ceil((nextAt - Date.now()) / 60000));
    },
    [regenCount, userId]
  );

  return useMemo(
    () => ({ loseHeart, canPlay, getTimeToNextHeart, regenCount }),
    [loseHeart, canPlay, getTimeToNextHeart, regenCount]
  );
}
