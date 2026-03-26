import { useCallback, useMemo } from 'react';

import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { useGamificationStore } from '@/stores/gamificationStore';

function mondayStart(d = new Date()): string {
  const day = d.getDay();
  const diff = (day === 0 ? -6 : 1) - day;
  const mon = new Date(d);
  mon.setDate(d.getDate() + diff);
  return mon.toISOString().slice(0, 10);
}

export function useLeaderboard() {
  const userId = useAuthStore((s) => s.user?.id);
  const setRank = useGamificationStore((s) => s.setRank);

  const getWeeklyLeaderboard = useCallback(
    async (languagePairId: string, limit = 20) => {
      const start = mondayStart();
      const { data } = await supabase
        .from('leaderboard')
        .select('user_id, xp_earned, rank')
        .eq('language_pair_id', languagePairId)
        .eq('period_type', 'weekly')
        .eq('period_start', start)
        .order('xp_earned', { ascending: false })
        .limit(limit);
      const rows = (data ?? []) as {
        user_id: string;
        xp_earned: number;
        rank: number | null;
      }[];
      const ids = rows.map((r) => r.user_id);
      let pmap = new Map<
        string,
        { id: string; display_name: string | null; avatar_url: string | null }
      >();
      if (ids.length) {
        const profiles = await supabase
          .from('user_profiles')
          .select('id, display_name, avatar_url')
          .in('id', ids);
        pmap = new Map(
          ((profiles.data ?? []) as {
            id: string;
            display_name: string | null;
            avatar_url: string | null;
          }[]).map((p) => [p.id, p])
        );
      }
      return rows.map((r, i) => ({
        rank: r.rank ?? i + 1,
        displayName: pmap.get(r.user_id)?.display_name ?? 'User',
        avatarUrl: pmap.get(r.user_id)?.avatar_url ?? null,
        xpEarned: r.xp_earned,
        isCurrentUser: r.user_id === userId,
      }));
    },
    [userId]
  );

  const updateMyLeaderboardEntry = useCallback(
    async (languagePairId: string, xpEarned: number) => {
      if (!userId) return;
      const start = mondayStart();
      await supabase.from('leaderboard').upsert(
        {
          user_id: userId,
          language_pair_id: languagePairId,
          period_type: 'weekly',
          period_start: start,
          xp_earned: xpEarned,
        },
        { onConflict: 'user_id,language_pair_id,period_type,period_start' }
      );
    },
    [userId]
  );

  const getMyRank = useCallback(async () => {
    const start = mondayStart();
    if (!userId) return null;
    const { data } = await supabase
      .from('leaderboard')
      .select('rank')
      .eq('user_id', userId)
      .eq('period_type', 'weekly')
      .eq('period_start', start)
      .maybeSingle();
    const r = (data as { rank: number | null } | null)?.rank ?? null;
    setRank(r);
    return r;
  }, [setRank, userId]);

  return useMemo(
    () => ({
      getWeeklyLeaderboard,
      updateMyLeaderboardEntry,
      getMyRank,
    }),
    [getMyRank, getWeeklyLeaderboard, updateMyLeaderboardEntry]
  );
}
