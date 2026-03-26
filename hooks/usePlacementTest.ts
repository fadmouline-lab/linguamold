import { useCallback, useEffect, useState } from 'react';

import { supabase } from '@/lib/supabase';

/** Resolves the first published placement lesson for the FR→EN pair (seeded in 999). */
export function usePlacementTest() {
  const [lessonId, setLessonId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const resolve = useCallback(async () => {
    setLoading(true);
    try {
      const { data: pair } = await supabase
        .from('language_pairs')
        .select('id')
        .eq('is_active', true)
        .limit(1)
        .maybeSingle();
      const pairId = (pair as { id: string } | null)?.id;
      if (!pairId) {
        setLessonId(null);
        return;
      }
      const { data: mod } = await supabase
        .from('modules')
        .select('id')
        .eq('language_pair_id', pairId)
        .eq('slug', 'placement')
        .maybeSingle();
      const mid = (mod as { id: string } | null)?.id;
      if (!mid) {
        setLessonId(null);
        return;
      }
      const { data: lesson } = await supabase
        .from('lessons')
        .select('id')
        .eq('module_id', mid)
        .eq('lesson_type', 'placement')
        .maybeSingle();
      setLessonId((lesson as { id: string } | null)?.id ?? null);
    } catch {
      setLessonId(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void resolve();
  }, [resolve]);

  return { lessonId, loading, reload: resolve };
}
