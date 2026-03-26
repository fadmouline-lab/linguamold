import { router } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { ProgressRing } from '@/components/gamification/ProgressRing';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Text } from '@/components/ui/Text';
import { colors, radii, spacing } from '@/components/ui/theme';
import { useModules } from '@/hooks/useModules';
import { useUIString } from '@/hooks/useUIString';
import type { ModuleWithProgress } from '@/hooks/useModules';
import { supabase } from '@/lib/supabase';

export default function BrowseScreen() {
  const { t } = useUIString();
  const { modules, loading } = useModules();
  const [q, setQ] = useState('');
  const [diff, setDiff] = useState<number | null>(null);

  const filtered = useMemo(() => {
    return modules.filter((m) => {
      const okQ =
        !q ||
        m.title_al.toLowerCase().includes(q.toLowerCase()) ||
        m.title_ll.toLowerCase().includes(q.toLowerCase());
      const okD = diff === null || m.difficulty_level === diff;
      return okQ && okD;
    });
  }, [modules, q, diff]);

  const grouped = useMemo(() => {
    const map = new Map<number, ModuleWithProgress[]>();
    for (const m of filtered) {
      const k = m.difficulty_level;
      map.set(k, [...(map.get(k) ?? []), m]);
    }
    return Array.from(map.entries()).sort((a, b) => a[0] - b[0]);
  }, [filtered]);

  const open = useCallback(async (m: ModuleWithProgress) => {
    const { data } = await supabase
      .from('lessons')
      .select('id')
      .eq('module_id', m.id)
      .eq('is_published', true)
      .order('display_order', { ascending: true })
      .limit(1)
      .maybeSingle();
    const lid = (data as { id: string } | null)?.id;
    if (lid) router.push(`/lesson/${lid}`);
    else router.push('/(main)/home');
  }, []);

  return (
    <ScreenContainer>
      <Text variant="h1">{t('nav.browse')}</Text>
      <TextInput
        value={q}
        onChangeText={setQ}
        placeholder={t('browse.search')}
        placeholderTextColor={colors.textSecondary}
        style={styles.search}
      />
      <View style={styles.filters}>
        {[null, 0, 1, 2, 3].map((d) => (
          <Pressable
            key={String(d)}
            onPress={() => setDiff(d)}
            style={[styles.filterChip, diff === d && styles.filterOn]}
          >
            <Text variant="caption">{d === null ? 'All' : `Lv ${d}`}</Text>
          </Pressable>
        ))}
      </View>
      {loading ? (
        <Text variant="body">{t('common.loading')}</Text>
      ) : (
        <ScrollView>
          {grouped.map(([level, list]) => (
            <View key={level} style={styles.section}>
              <Text variant="h3" style={styles.sectionTitle}>
                {t('onboarding.proficiency_title')} · {level}
              </Text>
              <View style={styles.grid}>
                {list.map((m) => {
                  const locked = m.progress?.status === 'locked';
                  return (
                    <Pressable
                      key={m.id}
                      disabled={locked}
                      onPress={() => open(m)}
                      style={[styles.card, locked && styles.cardLocked]}
                    >
                      <ProgressRing size={56} progress={0.2} />
                      <Text variant="bodyBold" numberOfLines={2}>
                        {m.title_al}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  search: {
    backgroundColor: colors.surfaceLight,
    borderRadius: radii.sm,
    padding: spacing.md,
    color: colors.textPrimary,
    marginVertical: spacing.md,
  },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterOn: { borderColor: colors.primary },
  section: { marginBottom: spacing.lg },
  sectionTitle: { marginBottom: spacing.sm },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  card: {
    width: '47%',
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    gap: spacing.sm,
  },
  cardLocked: { opacity: 0.45 },
});
