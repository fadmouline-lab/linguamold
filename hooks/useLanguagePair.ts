import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

import { supabase } from '@/lib/supabase';
import type { Language, LanguagePair } from '@/types/index';
import { useAuthStore } from '@/stores/authStore';

const KEY_AL = 'linguamold.preferred_al_id';
const KEY_LL = 'linguamold.preferred_ll_id';

export interface LanguagePairOption extends LanguagePair {
  learning_language?: Language | null;
}

export function useLanguagePair() {
  const userId = useAuthStore((s) => s.user?.id);
  const [currentAL, setCurrentAL] = useState<Language | null>(null);
  const [currentLL, setCurrentLL] = useState<Language | null>(null);
  const [availableLLs, setAvailableLLs] = useState<Language[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshFromProfile = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    try {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('preferred_al, preferred_ll')
        .eq('id', userId)
        .maybeSingle();
      const p = profile as
        | { preferred_al: string | null; preferred_ll: string | null }
        | null;
      if (p?.preferred_al)
        await AsyncStorage.setItem(KEY_AL, p.preferred_al);
      if (p?.preferred_ll)
        await AsyncStorage.setItem(KEY_LL, p.preferred_ll);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const loadLanguages = useCallback(async () => {
    setLoading(true);
    try {
      const alId = await AsyncStorage.getItem(KEY_AL);
      const llId = await AsyncStorage.getItem(KEY_LL);

      const { data: langs } = await supabase
        .from('languages')
        .select('*')
        .eq('is_active', true);
      const list = (langs ?? []) as Language[];

      const al =
        list.find((l) => l.id === alId) ??
        list.find((l) => l.code === 'fr') ??
        null;
      const ll = list.find((l) => l.id === llId) ?? null;

      setCurrentAL(al);
      setCurrentLL(ll);

      if (al) {
        const { data: pairs } = await supabase
          .from('language_pairs')
          .select('*')
          .eq('app_language_id', al.id)
          .eq('is_active', true);
        const pairRows = (pairs ?? []) as LanguagePair[];
        const llIds = pairRows.map((p) => p.learning_language_id);
        const targets = list.filter((l) => llIds.includes(l.id));
        setAvailableLLs(targets);
      } else {
        setAvailableLLs([]);
      }
    } catch {
      setAvailableLLs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshFromProfile();
  }, [refreshFromProfile]);

  useEffect(() => {
    void loadLanguages();
  }, [loadLanguages, userId]);

  const setAL = useCallback(
    async (lang: Language) => {
      await AsyncStorage.setItem(KEY_AL, lang.id);
      setCurrentAL(lang);
      const { data: pairs } = await supabase
        .from('language_pairs')
        .select('*')
        .eq('app_language_id', lang.id)
        .eq('is_active', true);
      const pairRows = (pairs ?? []) as LanguagePair[];
      const { data: langs } = await supabase.from('languages').select('*');
      const list = (langs ?? []) as Language[];
      const llIds = pairRows.map((p) => p.learning_language_id);
      setAvailableLLs(list.filter((l) => llIds.includes(l.id)));
    },
    []
  );

  const setLL = useCallback(async (lang: Language) => {
    await AsyncStorage.setItem(KEY_LL, lang.id);
    setCurrentLL(lang);
  }, []);

  const persistPairToProfile = useCallback(
    async (alId: string, llId: string) => {
      if (!userId) return;
      await supabase
        .from('user_profiles')
        .update({
          preferred_al: alId,
          preferred_ll: llId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);
    },
    [userId]
  );

  return {
    currentAL,
    currentLL,
    setAL,
    setLL,
    availableLLs,
    loading,
    reload: loadLanguages,
    persistPairToProfile,
  };
}
