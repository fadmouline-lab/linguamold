import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';

interface WordDifficulty {
  word: string;
  mistakeCount: number;
  lastMistakeAt: string | null;
  difficultyLevel: number;
}

export function useWordDifficulty() {
  const userId = useAuthStore((s) => s.user?.id);
  const [weakWords, setWeakWords] = useState<WordDifficulty[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchWeakWords = useCallback(async (limit = 5) => {
    if (!userId) return;
    setLoading(true);
    try {
      const { data } = await supabase
        .from('user_word_difficulty')
        .select('word, mistake_count, last_mistake_at, difficulty_level')
        .eq('user_id', userId)
        .gte('mistake_count', 3)
        .order('mistake_count', { ascending: false })
        .limit(limit);
      setWeakWords(
        (data ?? []).map((d: any) => ({
          word: d.word,
          mistakeCount: d.mistake_count,
          lastMistakeAt: d.last_mistake_at,
          difficultyLevel: d.difficulty_level,
        }))
      );
    } catch {
      setWeakWords([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Track a mistake for a word
  const trackMistake = useCallback(async (word: string, languagePairId: string) => {
    if (!userId) return;
    await supabase.from('user_word_difficulty').upsert(
      {
        user_id: userId,
        word,
        language_pair_id: languagePairId,
        mistake_count: 1, // Will be incremented by the ON CONFLICT
        last_mistake_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,word,language_pair_id' }
    );
    // Increment the mistake count
    const { data: existing } = await supabase
      .from('user_word_difficulty')
      .select('mistake_count')
      .eq('user_id', userId)
      .eq('word', word)
      .eq('language_pair_id', languagePairId)
      .maybeSingle();
    const currentCount = (existing as { mistake_count: number } | null)?.mistake_count ?? 0;
    await supabase
      .from('user_word_difficulty')
      .update({ mistake_count: currentCount + 1, last_mistake_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('word', word)
      .eq('language_pair_id', languagePairId);
  }, [userId]);

  const trackCorrect = useCallback(async (word: string, languagePairId: string) => {
    if (!userId) return;
    await supabase.from('user_word_difficulty').upsert(
      {
        user_id: userId,
        word,
        language_pair_id: languagePairId,
        last_correct_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,word,language_pair_id' }
    );
  }, [userId]);

  // Check if a specific word is "tricky" (3+ mistakes)
  const isWordTricky = useCallback(async (word: string): Promise<boolean> => {
    if (!userId) return false;
    const { data } = await supabase
      .from('user_word_difficulty')
      .select('mistake_count')
      .eq('user_id', userId)
      .eq('word', word)
      .maybeSingle();
    return ((data as any)?.mistake_count ?? 0) >= 3;
  }, [userId]);

  useEffect(() => {
    fetchWeakWords();
  }, [fetchWeakWords]);

  return { weakWords, loading, fetchWeakWords, trackMistake, trackCorrect, isWordTricky };
}
