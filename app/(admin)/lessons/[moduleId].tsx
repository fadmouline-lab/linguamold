import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Switch } from 'react-native';

import { ReorderableList } from '@/components/admin/ReorderableList';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Text } from '@/components/ui/Text';
import { colors, spacing } from '@/components/ui/theme';
import { useAdminMode } from '@/hooks/useAdminMode';
import { supabase } from '@/lib/supabase';
import type { Lesson } from '@/types/index';

export default function AdminLessonsScreen() {
  const { moduleId } = useLocalSearchParams<{ moduleId: string }>();
  const id = typeof moduleId === 'string' ? moduleId : moduleId?.[0] ?? '';
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const { reorderItems } = useAdminMode();

  const load = useCallback(async () => {
    const { data } = await supabase
      .from('lessons')
      .select('*')
      .eq('module_id', id)
      .order('display_order', { ascending: true });
    setLessons((data as Lesson[]) ?? []);
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  const onReorder = useCallback(
    async (ordered: Lesson[]) => {
      await reorderItems(
        'lessons',
        ordered.map((l, i) => ({ id: l.id, display_order: i + 1 }))
      );
      await load();
    },
    [load, reorderItems]
  );

  const togglePublished = async (lessonId: string, v: boolean) => {
    await supabase
      .from('lessons')
      .update({ is_published: v, updated_at: new Date().toISOString() })
      .eq('id', lessonId);
    await load();
  };

  return (
    <ScreenContainer>
      <Text variant="h1">Lessons</Text>
      <ReorderableList
        adminMode
        items={lessons}
        onReorder={(o) => void onReorder(o as Lesson[])}
        renderItem={(l) => (
          <View style={styles.row}>
            <Pressable
              style={{ flex: 1 }}
              onPress={() => router.push(`/(admin)/exercises/${l.id}`)}
            >
              <Text variant="h3">{l.title_al}</Text>
            </Pressable>
            <Switch
              value={l.is_published}
              onValueChange={(v) => void togglePublished(l.id, v)}
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
