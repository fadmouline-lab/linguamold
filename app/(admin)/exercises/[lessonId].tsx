import { useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { ReorderableList } from '@/components/admin/ReorderableList';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { colors, spacing } from '@/components/ui/theme';
import { useAdminMode } from '@/hooks/useAdminMode';
import { getMoldComponent } from '@/lib/mold-registry';
import { toMoldExercise } from '@/lib/exercise-mapper';
import { supabase } from '@/lib/supabase';
import type { ExerciseRow } from '@/types/index';

export default function AdminExercisesScreen() {
  const { lessonId } = useLocalSearchParams<{ lessonId: string }>();
  const id = typeof lessonId === 'string' ? lessonId : lessonId?.[0] ?? '';
  const [rows, setRows] = useState<ExerciseRow[]>([]);
  const { reorderItems, saveEdit } = useAdminMode();

  const load = useCallback(async () => {
    const { data } = await supabase
      .from('exercises')
      .select('*')
      .eq('lesson_id', id)
      .order('display_order', { ascending: true });
    setRows((data as ExerciseRow[]) ?? []);
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  const onReorder = async (ordered: ExerciseRow[]) => {
    await reorderItems(
      'exercises',
      ordered.map((e, i) => ({ id: e.id, display_order: i + 1 }))
    );
    await load();
  };

  return (
    <ScreenContainer>
      <Text variant="h1">Exercises</Text>
      <ReorderableList
        adminMode
        items={rows}
        onReorder={(o) => void onReorder(o as ExerciseRow[])}
        renderItem={(ex) => {
          const Mold = getMoldComponent(ex.mold_type);
          return (
            <ScrollView style={styles.card}>
              <Text variant="caption">
                {ex.mold_type} · #{ex.display_order}
              </Text>
              {Mold ? (
                <Mold
                  exercise={toMoldExercise(ex)}
                  onAnswer={() => {}}
                  onNext={() => {}}
                  isAdminMode
                  onContentChange={(c) => void saveEdit(ex.id, c)}
                />
              ) : null}
            </ScrollView>
          );
        }}
      />
      <Button title="Refresh" onPress={() => void load()} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  card: {
    maxHeight: 420,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
});
