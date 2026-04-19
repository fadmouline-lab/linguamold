import { useLocalSearchParams, useNavigation } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { ReorderableList } from '@/components/admin/ReorderableList';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { colors, spacing } from '@/components/ui/theme';
import { useAdminMode } from '@/hooks/useAdminMode';
import { useUIString } from '@/hooks/useUIString';
import { getMoldComponent } from '@/lib/mold-registry';
import { toMoldExercise } from '@/lib/exercise-mapper';
import { supabase } from '@/lib/supabase';
import type { ExerciseRow } from '@/types/index';

export default function AdminExercisesScreen() {
  const { lessonId } = useLocalSearchParams<{ lessonId: string }>();
  const id = typeof lessonId === 'string' ? lessonId : lessonId?.[0] ?? '';
  const [rows, setRows] = useState<ExerciseRow[]>([]);
  const [dirty, setDirty] = useState(new Set<string>());
  const [showUnsaved, setShowUnsaved] = useState(false);
  const [pendingBack, setPendingBack] = useState<{ action: { type: string } } | null>(null);
  const { reorderItems, saveEdit } = useAdminMode();
  const { t } = useUIString();
  const navigation = useNavigation();

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

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e: { preventDefault: () => void; data: { action: { type: string } } }) => {
      if (dirty.size === 0) return;
      e.preventDefault();
      setPendingBack(e.data);
      setShowUnsaved(true);
    });
    return unsubscribe;
  }, [navigation, dirty]);

  return (
    <ScreenContainer>
      <Text variant="h1">{t('admin.exercises_title')}</Text>
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
                  onContentChange={(c) => {
                    setDirty((prev) => new Set(prev).add(ex.id));
                    void saveEdit(ex.id, c).then(() => {
                      setDirty((prev) => {
                        const next = new Set(prev);
                        next.delete(ex.id);
                        return next;
                      });
                    });
                  }}
                />
              ) : null}
            </ScrollView>
          );
        }}
      />
      <Button title={t('admin.refresh')} onPress={() => void load()} />
      <ConfirmDialog
        visible={showUnsaved}
        title={t('admin.unsaved_changes')}
        message={t('admin.unsaved_changes')}
        confirmLabel={t('common.save')}
        cancelLabel={t('confirm.exit_quit')}
        onConfirm={() => { setShowUnsaved(false); }}
        onCancel={() => {
          setShowUnsaved(false);
          setDirty(new Set());
          if (pendingBack) navigation.dispatch(pendingBack.action as never);
        }}
      />
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
