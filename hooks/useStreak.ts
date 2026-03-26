import { useCallback } from 'react';

import { STREAK_FREEZE_COST_GEMS } from '@/lib/constants';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { useGamificationStore } from '@/stores/gamificationStore';

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function useStreak() {
  const userId = useAuthStore((s) => s.user?.id);
  const setFromProfile = useGamificationStore((s) => s.setFromProfile);

  const recordActivity = useCallback(async () => {
    if (!userId) return;
    const d = todayISO();
    await supabase.from('user_streaks').upsert(
      {
        user_id: userId,
        streak_date: d,
        exercises_completed: 1,
      },
      { onConflict: 'user_id,streak_date' }
    );
    const { data: prof } = await supabase
      .from('user_profiles')
      .select('current_streak, longest_streak, total_xp, gems, hearts, hearts_last_regen')
      .eq('id', userId)
      .maybeSingle();
    const p = prof as {
      current_streak: number;
      longest_streak: number;
      total_xp: number;
      gems: number;
      hearts: number;
      hearts_last_regen: string;
    } | null;
    if (!p) return;
    const nextStreak = p.current_streak + 1;
    const longest = Math.max(p.longest_streak, nextStreak);
    await supabase
      .from('user_profiles')
      .update({
        current_streak: nextStreak,
        longest_streak: longest,
        last_activity_date: d,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);
    setFromProfile({
      total_xp: p.total_xp,
      current_streak: nextStreak,
      longest_streak: longest,
      gems: p.gems,
      hearts: p.hearts,
      hearts_last_regen: p.hearts_last_regen,
    });
  }, [setFromProfile, userId]);

  const checkStreak = useCallback(async () => {
    if (!userId) return;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const y = yesterday.toISOString().slice(0, 10);
    const { data: row } = await supabase
      .from('user_streaks')
      .select('id')
      .eq('user_id', userId)
      .eq('streak_date', y)
      .maybeSingle();
    if (row) return;
    const { data: prof } = await supabase
      .from('user_profiles')
      .select('gems, current_streak, longest_streak, total_xp, hearts, hearts_last_regen, streak_frozen_until')
      .eq('id', userId)
      .maybeSingle();
    const p = prof as {
      gems: number;
      current_streak: number;
      longest_streak: number;
      total_xp: number;
      hearts: number;
      hearts_last_regen: string;
      streak_frozen_until: string | null;
    } | null;
    if (!p) return;
    const frozen = p.streak_frozen_until && p.streak_frozen_until >= todayISO();
    if (frozen) return;
    await supabase
      .from('user_profiles')
      .update({
        current_streak: 0,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);
    setFromProfile({
      total_xp: p.total_xp,
      current_streak: 0,
      longest_streak: p.longest_streak,
      gems: p.gems,
      hearts: p.hearts,
      hearts_last_regen: p.hearts_last_regen,
    });
  }, [setFromProfile, userId]);

  const getCurrentStreak = useCallback(
    () => useGamificationStore.getState().currentStreak,
    []
  );

  const useStreakFreeze = useCallback(async () => {
    if (!userId) return false;
    const { data: prof } = await supabase
      .from('user_profiles')
      .select('gems')
      .eq('id', userId)
      .maybeSingle();
    const g = (prof as { gems: number } | null)?.gems ?? 0;
    if (g < STREAK_FREEZE_COST_GEMS) return false;
    const t = new Date();
    t.setDate(t.getDate() + 1);
    await supabase
      .from('user_profiles')
      .update({
        gems: g - STREAK_FREEZE_COST_GEMS,
        streak_frozen_until: t.toISOString().slice(0, 10),
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);
    return true;
  }, [userId]);

  const getStreakInfo = useCallback(() => {
    const s = useGamificationStore.getState();
    return {
      currentStreak: s.currentStreak,
      longestStreak: s.longestStreak,
      isProtected: false,
      lastActivityDate: todayISO(),
    };
  }, []);

  return {
    recordActivity,
    checkStreak,
    getCurrentStreak,
    useStreakFreeze,
    getStreakInfo,
  };
}
