import { useCallback, useMemo } from 'react';

import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { useGamificationStore } from '@/stores/gamificationStore';
import type { Achievement, UserAchievement } from '@/types/index';

export function useAchievements() {
  const userId = useAuthStore((s) => s.user?.id);
  const setAchievements = useGamificationStore((s) => s.setAchievements);

  const checkAchievements = useCallback(async () => {
    if (!userId) return;
    const { data: all } = await supabase.from('achievements').select('*');
    const { data: mine } = await supabase
      .from('user_achievements')
      .select('achievement_id')
      .eq('user_id', userId);
    const unlocked = new Set(
      (mine as { achievement_id: string }[] | null)?.map((m) => m.achievement_id) ?? []
    );
    const list = (all as Achievement[] | null) ?? [];
    for (const a of list) {
      if (unlocked.has(a.id)) continue;
      let ok = false;
      if (a.condition_type === 'streak_days') {
        const { data: p } = await supabase
          .from('user_profiles')
          .select('current_streak')
          .eq('id', userId)
          .maybeSingle();
        const s = (p as { current_streak: number } | null)?.current_streak ?? 0;
        ok = s >= a.condition_value;
      }
      if (a.condition_type === 'total_xp') {
        const { data: p } = await supabase
          .from('user_profiles')
          .select('total_xp')
          .eq('id', userId)
          .maybeSingle();
        const x = (p as { total_xp: number } | null)?.total_xp ?? 0;
        ok = x >= a.condition_value;
      }
      if (ok) {
        await supabase.from('user_achievements').insert({
          user_id: userId,
          achievement_id: a.id,
        });
      }
    }
    const { data: ua } = await supabase
      .from('user_achievements')
      .select('*')
      .eq('user_id', userId);
    setAchievements((ua as UserAchievement[]) ?? []);
  }, [setAchievements, userId]);

  const getUnlockedAchievements = useCallback(async () => {
    if (!userId) return [];
    const { data } = await supabase
      .from('user_achievements')
      .select('*')
      .eq('user_id', userId);
    return (data as UserAchievement[]) ?? [];
  }, [userId]);

  const getAllAchievements = useCallback(async () => {
    const { data: all } = await supabase.from('achievements').select('*');
    const { data: mine } = await supabase
      .from('user_achievements')
      .select('achievement_id')
      .eq('user_id', userId);
    const unlocked = new Set(
      (mine as { achievement_id: string }[] | null)?.map((m) => m.achievement_id) ?? []
    );
    return ((all as Achievement[] | null) ?? []).map((a) => ({
      ...a,
      unlocked: unlocked.has(a.id),
    }));
  }, [userId]);

  return useMemo(
    () => ({
      checkAchievements,
      getUnlockedAchievements,
      getAllAchievements,
    }),
    [checkAchievements, getAllAchievements, getUnlockedAchievements]
  );
}
