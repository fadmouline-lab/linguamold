import { useCallback } from 'react';

import {
  HEARTS_MAX,
  XP_COMBO_BONUS,
  XP_CORRECT_ANSWER,
  XP_LESSON_COMPLETE,
  XP_PERFECT_LESSON,
} from '@/lib/constants';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import type { LessonAnswer } from '@/stores/lessonStore';
import { useLessonStore } from '@/stores/lessonStore';
import type { ExerciseRow } from '@/types/index';

export function useExerciseEngine(placementMode = false) {
  const userId = useAuthStore((s) => s.user?.id);

  const exercises = useLessonStore((s) => s.exercises);
  const currentIndex = useLessonStore((s) => s.currentIndex);
  const answers = useLessonStore((s) => s.answers);
  const score = useLessonStore((s) => s.score);
  const isComplete = useLessonStore((s) => s.isComplete);
  const isLoading = useLessonStore((s) => s.isLoading);
  const hearts = useLessonStore((s) => s.hearts);

  const loadLesson = useCallback(
    async (lessonId: string) => {
      const st = useLessonStore.getState();
      st.setLessonId(lessonId);
      st.setLoading(true);
      try {
        if (userId) {
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('hearts')
            .eq('id', userId)
            .maybeSingle();
          const h = (profile as { hearts: number } | null)?.hearts ?? HEARTS_MAX;
          st.setHearts(h);
        }
        const { data, error } = await supabase
          .from('exercises')
          .select('*')
          .eq('lesson_id', lessonId)
          .eq('is_published', true)
          .order('display_order', { ascending: true });
        if (error) throw error;
        st.setExercises((data ?? []) as ExerciseRow[]);
      } catch {
        useLessonStore.getState().setExercises([]);
      } finally {
        useLessonStore.getState().setLoading(false);
      }
    },
    [userId]
  );

  const submitAnswer = useCallback(
    async (isCorrect: boolean, answer: unknown, timeSpentMs = 0) => {
      const st = useLessonStore.getState();
      const { exercises: exs, currentIndex: idx, answers: ans, hearts: h } = st;
      const ex = exs[idx];
      if (!ex || !userId) return;

      const prevAllCorrect = ans.length === 0 || ans.every((a) => a.isCorrect);
      const payload: LessonAnswer = {
        exerciseId: ex.id,
        isCorrect,
        answer,
        timeSpentMs,
      };
      st.pushAnswer(payload);

      let xp = 0;
      if (isCorrect) {
        xp = XP_CORRECT_ANSWER + (prevAllCorrect ? XP_COMBO_BONUS : 0);
        st.bumpCombo();
        await supabase.from('user_xp_log').insert({
          user_id: userId,
          xp_amount: xp,
          source: 'exercise',
          reference_id: ex.id,
        });
      } else {
        st.resetCombo();
        if (!placementMode) {
          const nextHearts = Math.max(0, h - 1);
          await supabase
            .from('user_profiles')
            .update({
              hearts: nextHearts,
              updated_at: new Date().toISOString(),
            })
            .eq('id', userId);
          st.setHearts(nextHearts);
        }
      }

      await supabase.from('user_exercise_attempts').insert({
        user_id: userId,
        exercise_id: ex.id,
        is_correct: isCorrect,
        user_answer: answer as object,
        time_spent_ms: timeSpentMs,
        xp_earned: xp,
      });

      const nextAnswers = [...ans, payload];
      const correctCount = nextAnswers.filter((a) => a.isCorrect).length;
      st.setScore(
        Math.round((correctCount / Math.max(1, nextAnswers.length)) * 100)
      );
    },
    [placementMode, userId]
  );

  const advance = useCallback(async () => {
    const st = useLessonStore.getState();
    const { exercises: exs, currentIndex: idx, answers: ans, score: sc } = st;
    if (idx + 1 >= exs.length) {
      st.setComplete(true);
      if (!userId || !exs.length) return;
      const lessonId = exs[0]?.lesson_id;
      const allCorrect = ans.every((a) => a.isCorrect);
      const xpBase = XP_LESSON_COMPLETE + (allCorrect ? XP_PERFECT_LESSON : 0);
      await supabase.from('user_lesson_progress').upsert(
        {
          user_id: userId,
          lesson_id: lessonId,
          status: 'completed',
          score: sc,
          best_score: sc,
          completed_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,lesson_id' }
      );
      await supabase.from('user_xp_log').insert({
        user_id: userId,
        xp_amount: xpBase,
        source: allCorrect ? 'perfect_lesson' : 'lesson_complete',
        reference_id: lessonId,
      });
      const { data: prof } = await supabase
        .from('user_profiles')
        .select('total_xp')
        .eq('id', userId)
        .maybeSingle();
      const cur = (prof as { total_xp: number } | null)?.total_xp ?? 0;
      await supabase
        .from('user_profiles')
        .update({
          total_xp: cur + xpBase,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);
    } else {
      st.next();
    }
  }, [userId]);

  const getScore = useCallback(() => useLessonStore.getState().score, []);

  const isPerfect = useCallback(() => {
    const { answers: a } = useLessonStore.getState();
    return a.length > 0 && a.every((x) => x.isCorrect);
  }, []);

  const resetLesson = useCallback(
    () => useLessonStore.getState().reset(),
    []
  );

  return {
    exercises,
    currentIndex,
    answers,
    score,
    isComplete,
    isLoading,
    hearts,
    loadLesson,
    submitAnswer,
    advance,
    getScore,
    isPerfect,
    resetLesson,
  };
}
