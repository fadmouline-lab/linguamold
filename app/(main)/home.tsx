import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { AdminToggleBar } from '@/components/admin/AdminToggleBar';
import { AdventurePath } from '@/components/adventure/AdventurePath';
import { StreakBadge } from '@/components/gamification/StreakBadge';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Text } from '@/components/ui/Text';
import { colors, spacing } from '@/components/ui/theme';
import { useAdminMode } from '@/hooks/useAdminMode';
import { useLessons } from '@/hooks/useLessons';
import { useModules } from '@/hooks/useModules';
import { useUIString } from '@/hooks/useUIString';
import { useGamificationStore } from '@/stores/gamificationStore';
import { useAdminStore } from '@/stores/adminStore';
import type { ModuleWithProgress } from '@/hooks/useModules';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/lib/supabase';

export default function HomeScreen() {
  const { t } = useUIString();
  const { modules, loading } = useModules();
  const [selected, setSelected] = useState<ModuleWithProgress | null>(null);
  const { lessons, loading: lessonsLoading } = useLessons(selected?.id ?? null);
  const gems = useGamificationStore((s) => s.gems);
  const setFromProfile = useGamificationStore((s) => s.setFromProfile);
  const isAdminMode = useAdminStore((s) => s.isAdminMode);
  const { checkIsAdmin } = useAdminMode();
  const userId = useAuthStore((s) => s.user?.id);

  useEffect(() => {
    const run = async () => {
      if (!userId) return;
      const { data } = await supabase
        .from('user_profiles')
        .select(
          'total_xp, current_streak, longest_streak, gems, hearts, hearts_last_regen'
        )
        .eq('id', userId)
        .maybeSingle();
      const row = data as {
        total_xp: number;
        current_streak: number;
        longest_streak: number;
        gems: number;
        hearts: number;
        hearts_last_regen: string;
      } | null;
      if (row) setFromProfile(row);
    };
    void run();
  }, [setFromProfile, userId]);

  const openModule = useCallback((m: ModuleWithProgress) => {
    setSelected(m);
  }, []);

  return (
    <ScreenContainer edges={['top', 'left', 'right']}>
      {isAdminMode && checkIsAdmin() ? <AdminToggleBar /> : null}
      <View style={styles.header}>
        <StreakBadge />
        <Text variant="h2" style={styles.brand}>
          LinguaMold
        </Text>
        <Text variant="caption">
          💎 {gems}
        </Text>
      </View>
      {loading ? (
        <Text variant="body">{t('common.loading')}</Text>
      ) : (
        <AdventurePath modules={modules} onSelectModule={openModule} />
      )}
      <Modal visible={Boolean(selected)} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.sheet}>
            <Text variant="h2">{selected?.title_al}</Text>
            {lessonsLoading ? (
              <Text variant="caption">{t('common.loading')}</Text>
            ) : (
              <ScrollView style={styles.list}>
                {lessons.map((l) => (
                  <Pressable
                    key={l.id}
                    disabled={l.locked}
                    onPress={() => {
                      setSelected(null);
                      router.push(`/lesson/${l.id}`);
                    }}
                    style={[styles.lessonRow, l.locked && styles.lessonLocked]}
                  >
                    <Text variant="bodyBold">{l.title_al}</Text>
                    {l.locked ? (
                      <Text variant="caption">{t('lesson.locked')}</Text>
                    ) : null}
                  </Pressable>
                ))}
              </ScrollView>
            )}
            <Pressable onPress={() => setSelected(null)} style={styles.close}>
              <Text variant="bodyBold">{t('common.close')}</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.xs,
  },
  brand: { flex: 1, textAlign: 'center' },
  modalBackdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '70%',
  },
  list: { marginTop: spacing.md },
  lessonRow: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  lessonLocked: { opacity: 0.4 },
  close: { marginTop: spacing.lg, alignItems: 'center' },
});
