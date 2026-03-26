import { useCallback } from 'react';

import { LEVEL_XP_STEP } from '@/lib/constants';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { useGamificationStore } from '@/stores/gamificationStore';

export function useXP() {
  const userId = useAuthStore((s) => s.user?.id);
  const setFromProfile = useGamificationStore((s) => s.setFromProfile);

  const awardXP = useCallback(
    async (amount: number, source: string, referenceId: string | null) => {
      if (!userId || amount <= 0) return;
      await supabase.from('user_xp_log').insert({
        user_id: userId,
        xp_amount: amount,
        source,
        reference_id: referenceId,
      });
      const { data } = await supabase
        .from('user_profiles')
        .select('total_xp, current_streak, longest_streak, gems, hearts, hearts_last_regen')
        .eq('id', userId)
        .maybeSingle();
      const row = data as {
        total_xp: number;
        current_streak: number;
        longest_streak: number;
        gems: number;
        hearts: number;
        hearts_last_regen: string;
      } | null;
      if (row) {
        const next = row.total_xp + amount;
        await supabase
          .from('user_profiles')
          .update({
            total_xp: next,
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId);
        setFromProfile({ ...row, total_xp: next });
      }
    },
    [setFromProfile, userId]
  );

  const getXPBreakdown = useCallback(
    (_lessonId: string) => ({
      base: 0,
      combo: 0,
      lesson: 0,
      perfect: 0,
    }),
    []
  );

  const getTotalXP = useCallback(
    () => useGamificationStore.getState().totalXP,
    []
  );

  const getLevel = useCallback(() => {
    const xp = useGamificationStore.getState().totalXP;
    return Math.floor(xp / LEVEL_XP_STEP) + 1;
  }, []);

  return { awardXP, getXPBreakdown, getTotalXP, getLevel };
}
