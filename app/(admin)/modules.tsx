import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Switch } from 'react-native';

import { ReorderableList } from '@/components/admin/ReorderableList';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Text } from '@/components/ui/Text';
import { colors, spacing } from '@/components/ui/theme';
import { useAdminMode } from '@/hooks/useAdminMode';
import { useLanguagePair } from '@/hooks/useLanguagePair';
import { supabase } from '@/lib/supabase';
import { useAdminStore } from '@/stores/adminStore';
import type { Module } from '@/types/index';

export default function AdminModulesScreen() {
  const { currentAL, currentLL } = useLanguagePair();
  const { reorderItems } = useAdminMode();
  const selectedAL = useAdminStore((s) => s.selectedAL);
  const [modules, setModules] = useState<Module[]>([]);

  const load = useCallback(async () => {
    const al = selectedAL ?? currentAL;
    const ll = useAdminStore.getState().selectedLL ?? currentLL;
    if (!al || !ll) return;
    const { data: pair } = await supabase
      .from('language_pairs')
      .select('id')
      .eq('app_language_id', al.id)
      .eq('learning_language_id', ll.id)
      .maybeSingle();
    const pid = (pair as { id: string } | null)?.id;
    if (!pid) return;
    const { data } = await supabase
      .from('modules')
      .select('*')
      .eq('language_pair_id', pid)
      .order('display_order', { ascending: true });
    setModules((data as Module[]) ?? []);
  }, [currentAL, currentLL, selectedAL]);

  useEffect(() => {
    void load();
  }, [load]);

  const onReorder = useCallback(
    async (ordered: Module[]) => {
      await reorderItems(
        'modules',
        ordered.map((m, i) => ({ id: m.id, display_order: i + 1 }))
      );
      await load();
    },
    [load, reorderItems]
  );

  const togglePublished = async (m: Module, v: boolean) => {
    await supabase
      .from('modules')
      .update({ is_published: v, updated_at: new Date().toISOString() })
      .eq('id', m.id);
    await load();
  };

  return (
    <ScreenContainer>
      <Text variant="h1">Modules</Text>
      <ReorderableList
        adminMode
        items={modules}
        onReorder={(o) => void onReorder(o as Module[])}
        renderItem={(m) => (
          <View style={styles.row}>
            <Pressable
              style={{ flex: 1 }}
              onPress={() => router.push(`/(admin)/lessons/${m.id}`)}
            >
              <Text variant="h3">{m.title_al}</Text>
              <Text variant="caption">{m.slug}</Text>
            </Pressable>
            <Switch
              value={m.is_published}
              onValueChange={(v) => void togglePublished(m, v)}
            />
          </View>
        )}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
});
