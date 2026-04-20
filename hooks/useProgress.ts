import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { LEVEL_XP_STEP } from '@/lib/constants';

interface ProgressData {
  totalWords: number;
  accuracyPct: number;
  level: number;
  xpToNext: number;
  totalXp: number;
  lessonsCompleted: number;
  minutesPracticed: number;
}

export function useProgress() {
  const userId = useAuthStore((s) => s.user?.id);
  const [data, setData] = useState<ProgressData>({
    totalWords: 0,
    accuracyPct: 0,
    level: 1,
    xpToNext: 500,
    totalXp: 0,
    lessonsCompleted: 0,
    minutesPracticed: 0,
  });
  const [loading, setLoading] = useState(false);

  const fetchProgress = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      // Fetch profile for XP
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('total_xp')
        .eq('id', userId)
        .maybeSingle();
      const totalXp = (profile as any)?.total_xp ?? 0;
      const level = Math.floor(totalXp / LEVEL_XP_STEP) + 1;
      const xpToNext = LEVEL_XP_STEP - (totalXp % LEVEL_XP_STEP);

      // Fetch unique correct exercises (approximation of words learned)
      const { count: totalWords } = await supabase
        .from('user_exercise_attempts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_correct', true);

      // Fetch accuracy
      const { count: totalAttempts } = await supabase
        .from('user_exercise_attempts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);
      const { count: correctAttempts } = await supabase
        .from('user_exercise_attempts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_correct', true);
      const accuracyPct = totalAttempts && totalAttempts > 0
        ? Math.round(((correctAttempts ?? 0) / totalAttempts) * 100)
        : 0;

      // Fetch lessons completed
      const { count: lessonsCompleted } = await supabase
        .from('user_lesson_progress')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('status', 'completed');

      // Fetch total minutes practiced
      const { data: streakData } = await supabase
        .from('user_streaks')
        .select('exercises_completed')
        .eq('user_id', userId);
      // Approximate: each exercise ~30 seconds average
      const totalExercises = (streakData ?? []).reduce(
        (sum: number, r: any) => sum + (r.exercises_completed ?? 0), 0
      );
      const minutesPracticed = Math.round(totalExercises * 0.5);

      setData({
        totalWords: totalWords ?? 0,
        accuracyPct,
        level,
        xpToNext,
        totalXp,
        lessonsCompleted: lessonsCompleted ?? 0,
        minutesPracticed,
      });
    } catch {
      // Keep defaults on error
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  return { ...data, loading, refresh: fetchProgress };
}
