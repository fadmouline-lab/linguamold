import { useCallback, useRef } from 'react';

import {
  HEARTS_MAX,
  LEVEL_XP_STEP,
  XP_COMBO_BONUS,
  XP_CORRECT_ANSWER,
  XP_LESSON_COMPLETE,
  XP_PERFECT_LESSON,
} from '@/lib/constants';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { useGamificationStore } from '@/stores/gamificationStore';
import type { LessonAnswer } from '@/stores/lessonStore';
import { useLessonStore } from '@/stores/lessonStore';
import type { ExerciseRow } from '@/types/index';
import { useUiStringStore } from '@/stores/uiStringStore';
import { APP_STRINGS_FALLBACK } from '@/lib/app-strings-fallback';

/** Offline-safe UUID generation */
function generateId(): string {
  return crypto.randomUUID?.() ?? Math.random().toString(36).slice(2);
}

export function useExerciseEngine(placementMode = false) {
  const userId = useAuthStore((s) => s.user?.id);
  const strings = useUiStringStore((s) => s.strings);
  const lessonStartedAtRef = useRef<string | null>(null);
  const tStatic = useCallback(
    (key: string, vars?: Record<string, string | number>): string => {
      const raw = strings[key] ?? APP_STRINGS_FALLBACK[key] ?? key;
      if (!vars) return raw;
      return raw.replace(/\{\{(\w+)\}\}/g, (_, k: string) => String(vars[k] ?? `{{${k}}}`));
    },
    [strings]
  );

  const exercises = useLessonStore((s) => s.exercises);
  const currentIndex = useLessonStore((s) => s.currentIndex);
  const answers = useLessonStore((s) => s.answers);
  const score = useLessonStore((s) => s.score);
  const isComplete = useLessonStore((s) => s.isComplete);
  const isLoading = useLessonStore((s) => s.isLoading);
  const hearts = useLessonStore((s) => s.hearts);
  const comboStreak = useLessonStore((s) => s.comboStreak);
  const isReviewExercise = useLessonStore((s) => s.isReviewExercise);
  const practiceMode = useLessonStore((s) => s.practiceMode);
  const skipCount = useLessonStore((s) => s.skipCount);

  // Track hints used per exercise (keyed by exercise id, resets each lesson)
  const hintsUsedRef = useRef<Map<string, number>>(new Map());

  const loadLesson = useCallback(
    async (lessonId: string) => {
      const st = useLessonStore.getState();
      st.setLessonId(lessonId);
      st.setLoading(true);
      hintsUsedRef.current = new Map();
      lessonStartedAtRef.current = new Date().toISOString();
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
      const {
        exercises: exs,
        currentIndex: idx,
        answers: ans,
        hearts: h,
        isReviewExercise: isReview,
        practiceMode: isPractice,
      } = st;
      const ex = exs[idx];
      if (!ex || !userId) return;

      const prevAllCorrect = ans.length === 0 || ans.every((a) => a.isCorrect);
      const exerciseHints = hintsUsedRef.current.get(ex.id) ?? 0;

      const payload: LessonAnswer = {
        exerciseId: ex.id,
        isCorrect,
        answer,
        timeSpentMs,
        isReview,
        hintsUsed: exerciseHints,
      };
      st.pushAnswer(payload);

      let xp = 0;

      if (isCorrect) {
        // Review exercises award 5 XP; normal exercises award 10 (minus hint cost)
        const baseXp = isReview ? 5 : XP_CORRECT_ANSWER;
        const hintPenalty = exerciseHints * 2;
        xp = Math.max(0, baseXp - hintPenalty) + (prevAllCorrect ? XP_COMBO_BONUS : 0);
        st.bumpCombo();
        st.setLastWasWrong(false);

        if (!isPractice) {
          await supabase.from('user_xp_log').insert({
            id: generateId(),
            user_id: userId,
            xp_amount: xp,
            source: 'exercise',
            reference_id: ex.id,
          });
        }
      } else {
        st.resetCombo();
        st.setLastWasWrong(true);
        // Enqueue for review on wrong answer
        st.enqueueForReview(ex);

        if (!placementMode && !isPractice) {
          const nextHearts = Math.max(0, h - 1);
          st.setHearts(nextHearts);
          await supabase
            .from('user_profiles')
            .update({
              hearts: nextHearts,
              updated_at: new Date().toISOString(),
            })
            .eq('id', userId);
        }
      }

      if (!isPractice) {
        await supabase.from('user_exercise_attempts').insert({
          user_id: userId,
          exercise_id: ex.id,
          is_correct: isCorrect,
          user_answer: answer as object,
          time_spent_ms: timeSpentMs,
          xp_earned: xp,
          hints_used: exerciseHints,
        });
      }

      const nextAnswers = [...ans, payload];
      const correctCount = nextAnswers.filter((a) => a.isCorrect).length;
      st.setScore(
        Math.round((correctCount / Math.max(1, nextAnswers.length)) * 100)
      );
    },
    [placementMode, userId]
  );

  const skipExercise = useCallback(
    async () => {
      const st = useLessonStore.getState();
      const {
        exercises: exs,
        currentIndex: idx,
        skipCount: skips,
        hearts: h,
        practiceMode: isPractice,
      } = st;
      const ex = exs[idx];
      if (!ex || !userId) return;

      // 3rd+ skip costs 1 heart
      if (skips >= 2 && !isPractice) {
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

      // Always enqueue skipped exercise for review
      st.enqueueForReview(ex);
      st.incrementSkip();
      st.setLastWasWrong(true);
      st.resetCombo();

      // Record skip in answers
      const payload: LessonAnswer = {
        exerciseId: ex.id,
        isCorrect: false,
        answer: null,
        timeSpentMs: 0,
        isSkipped: true,
      };
      st.pushAnswer(payload);

      // Log to user_exercise_attempts
      if (!isPractice) {
        await supabase.from('user_exercise_attempts').insert({
          user_id: userId,
          exercise_id: ex.id,
          is_correct: false,
          is_skipped: true,
          user_answer: null,
          time_spent_ms: 0,
          xp_earned: 0,
        });
      }

      // Update score
      const nextAnswers = [...st.answers, payload];
      const correctCount = nextAnswers.filter((a) => a.isCorrect).length;
      st.setScore(
        Math.round((correctCount / Math.max(1, nextAnswers.length)) * 100)
      );
    },
    [userId]
  );

  const useHint = useCallback((): number => {
    const st = useLessonStore.getState();
    const ex = st.exercises[st.currentIndex];
    if (!ex) return 0;

    const current = hintsUsedRef.current.get(ex.id) ?? 0;
    const next = current + 1;
    hintsUsedRef.current.set(ex.id, next);
    return next;
  }, []);

  const advance = useCallback(async () => {
    const st = useLessonStore.getState();
    const {
      exercises: exs,
      currentIndex: idx,
      answers: ans,
      score: sc,
      reviewQueue,
      practiceMode: isPractice,
    } = st;

    // Call st.next() which handles review queue insertion logic
    st.next();

    // After next(), check if lesson is now complete
    const afterState = useLessonStore.getState();
    if (!afterState.isComplete) return;

    // Lesson complete — run completion logic
    if (!userId || !exs.length) return;
    if (isPractice) return; // Practice mode skips XP and progress logging

    const lessonId = exs[0]?.lesson_id;
    const allCorrect = ans.every((a) => a.isCorrect);
    const xpBase = XP_LESSON_COMPLETE + (allCorrect ? XP_PERFECT_LESSON : 0);

    const stars = sc < 60 ? 1 : sc < 90 ? 2 : 3;
    const nowIso = new Date().toISOString();
    const { data: existingLesson } = await supabase
      .from('user_lesson_progress')
      .select('started_at, attempts')
      .eq('user_id', userId)
      .eq('lesson_id', lessonId)
      .maybeSingle();
    const existingStartedAt = (existingLesson as { started_at: string | null; attempts: number } | null)?.started_at;
    const existingAttempts = (existingLesson as { started_at: string | null; attempts: number } | null)?.attempts ?? 0;

    await supabase.from('user_lesson_progress').upsert(
      {
        user_id: userId,
        lesson_id: lessonId,
        status: 'completed',
        score: sc,
        best_score: sc,
        stars,
        attempts: existingAttempts + 1,
        started_at: existingStartedAt ?? lessonStartedAtRef.current ?? nowIso,
        completed_at: nowIso,
      },
      { onConflict: 'user_id,lesson_id' }
    );

    if (lessonId) {
      const { data: lessonRow } = await supabase
        .from('lessons')
        .select('module_id')
        .eq('id', lessonId)
        .maybeSingle();
      const moduleId = (lessonRow as { module_id: string } | null)?.module_id;
      if (moduleId) {
        const { data: moduleLessons } = await supabase
          .from('lessons')
          .select('id')
          .eq('module_id', moduleId)
          .eq('is_published', true);
        const lessonIds = ((moduleLessons ?? []) as { id: string }[]).map(
          (l) => l.id
        );
        const { data: completedRows } = await supabase
          .from('user_lesson_progress')
          .select('lesson_id')
          .eq('user_id', userId)
          .eq('status', 'completed')
          .in('lesson_id', lessonIds.length ? lessonIds : [lessonId]);
        const completedIds = new Set(
          ((completedRows ?? []) as { lesson_id: string }[]).map(
            (r) => r.lesson_id
          )
        );
        const total = lessonIds.length || 1;
        const done = lessonIds.filter((id) => completedIds.has(id)).length;
        const allDone = total > 0 && done >= total;
        const pct = Math.round((done / total) * 100);
        const { data: existing } = await supabase
          .from('user_module_progress')
          .select('started_at')
          .eq('user_id', userId)
          .eq('module_id', moduleId)
          .maybeSingle();
        const nowIso = new Date().toISOString();
        const startedAt =
          (existing as { started_at: string | null } | null)?.started_at ??
          nowIso;
        await supabase.from('user_module_progress').upsert(
          {
            user_id: userId,
            module_id: moduleId,
            status: allDone ? 'completed' : 'in_progress',
            completion_pct: pct,
            started_at: startedAt,
            completed_at: allDone ? nowIso : null,
            best_score: sc,
          },
          { onConflict: 'user_id,module_id' }
        );
      }
    }

    await supabase.from('user_xp_log').insert({
      id: generateId(),
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
    const newTotal = cur + xpBase;
    const newLevel = Math.floor(newTotal / LEVEL_XP_STEP) + 1;
    const prevLevel = useGamificationStore.getState().previousLevel;
    if (newLevel > prevLevel) {
      useGamificationStore.getState().pushToast(
        tStatic('gamify.level_up', { level: newLevel }),
        '🎉'
      );
    }
    useGamificationStore.getState().setPreviousLevel(newLevel);
  }, [userId, tStatic]);

  const getCorrectCopyContext = useCallback((): 'standard' | 'combo' | 'recovery' => {
    const st = useLessonStore.getState();
    if (st.comboStreak >= 3) return 'combo';
    if (st.lastWasWrong) return 'recovery';
    return 'standard';
  }, []);

  const getScore = useCallback(() => useLessonStore.getState().score, []);

  const isPerfect = useCallback(() => {
    const { answers: a } = useLessonStore.getState();
    return a.length > 0 && a.every((x) => x.isCorrect);
  }, []);

  const resetLesson = useCallback(() => {
    hintsUsedRef.current = new Map();
    useLessonStore.getState().reset();
  }, []);

  return {
    exercises,
    currentIndex,
    answers,
    score,
    isComplete,
    isLoading,
    hearts,
    comboStreak,
    isReviewExercise,
    practiceMode,
    skipCount,
    loadLesson,
    submitAnswer,
    skipExercise,
    useHint,
    advance,
    getCorrectCopyContext,
    getScore,
    isPerfect,
    resetLesson,
  };
}
