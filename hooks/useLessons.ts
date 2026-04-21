import { useCallback, useEffect, useState } from 'react';

import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import type { Lesson, UserLessonProgress } from '@/types/index';

function isLessonCompleted(p: UserLessonProgress | undefined | null) {
  return String(p?.status ?? '').toLowerCase() === 'completed';
}

export interface LessonWithProgress extends Lesson {
  progress?: UserLessonProgress | null;
  locked: boolean;
}

export function useLessons(moduleId: string | null) {
  const userId = useAuthStore((s) => s.user?.id);
  const [lessons, setLessons] = useState<LessonWithProgress[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!moduleId) {
      setLessons([]);
      return;
    }
    setLoading(true);
    try {
      const { data: rows } = await supabase
        .from('lessons')
        .select('*')
        .eq('module_id', moduleId)
        .eq('is_published', true)
        .order('display_order', { ascending: true });
      const base = (rows ?? []) as Lesson[];
      let progMap = new Map<string, UserLessonProgress>();
      if (userId) {
        const { data: prog } = await supabase
          .from('user_lesson_progress')
          .select('*')
          .eq('user_id', userId);
        progMap = new Map(
          (prog as UserLessonProgress[] | null)?.map((p) => [p.lesson_id, p]) ??
            []
        );
      }
      const merged: LessonWithProgress[] = base.map((l, idx) => {
        const prev = base[idx - 1];
        const prevDone = prev ? isLessonCompleted(progMap.get(prev.id)) : true;
        const locked = idx > 0 && !prevDone;
        return {
          ...l,
          progress: progMap.get(l.id) ?? null,
          locked,
        };
      });
      setLessons(merged);
    } catch {
      setLessons([]);
    } finally {
      setLoading(false);
    }
  }, [moduleId, userId]);

  useEffect(() => {
    void load();
  }, [load]);

  return { lessons, loading, reload: load };
}
