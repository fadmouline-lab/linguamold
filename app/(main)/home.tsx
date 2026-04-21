import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { AdminToggleBar } from '@/components/admin/AdminToggleBar';
import { AdventurePath } from '@/components/adventure/AdventurePath';
import { ErrorState } from '@/components/common/ErrorState';
import { FirstTimeTooltip } from '@/components/common/FirstTimeTooltip';
import { SkeletonLoader } from '@/components/common/SkeletonLoader';
import { DailyGoalRing } from '@/components/gamification/DailyGoalRing';
import { StreakBadge } from '@/components/gamification/StreakBadge';
import { WelcomeBackScreen } from '@/components/gamification/WelcomeBackScreen';
import { StreakBreakScreen } from '@/components/gamification/StreakBreakScreen';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Text } from '@/components/ui/Text';
import { colors, radii, spacing } from '@/components/ui/theme';
import { useAdminMode } from '@/hooks/useAdminMode';
import { useLessons } from '@/hooks/useLessons';
import { useModules } from '@/hooks/useModules';
import { useStreak } from '@/hooks/useStreak';
import { useUIString } from '@/hooks/useUIString';
import { useGamificationStore } from '@/stores/gamificationStore';
import { useAdminStore } from '@/stores/adminStore';
import type { ModuleWithProgress } from '@/hooks/useModules';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/lib/supabase';
import type { UserLessonProgress } from '@/types/index';

/** Best lesson score as 0–100 for list rows (Supabase may return decimals as strings). */
function lessonBestScorePercent(
  progress: UserLessonProgress | null | undefined
): number | null {
  if (!progress) return null;
  const raw = progress.best_score ?? progress.score;
  if (raw == null) return null;
  const n = Number(raw);
  if (!Number.isFinite(n)) return null;
  return Math.round(Math.min(100, Math.max(0, n)));
}

export default function HomeScreen() {
  const { t } = useUIString();
  const { modules, loading, error, reload } = useModules();
  const [selected, setSelected] = useState<ModuleWithProgress | null>(null);
  const { lessons, loading: lessonsLoading, reload: reloadLessons } = useLessons(
    selected?.id ?? null
  );
  const gems = useGamificationStore((s) => s.gems);
  const hearts = useGamificationStore((s) => s.hearts);
  const setFromProfile = useGamificationStore((s) => s.setFromProfile);
  const isAdminMode = useAdminStore((s) => s.isAdminMode);
  const { checkIsAdmin } = useAdminMode();
  const userId = useAuthStore((s) => s.user?.id);
  const { checkStreak } = useStreak();
  const pushToast = useGamificationStore((s) => s.pushToast);
  const streakBeforeCheck = useRef<number | null>(null);
  const [showWelcomeBack, setShowWelcomeBack] = useState(false);
  const [showStreakBreak, setShowStreakBreak] = useState(false);
  const [welcomeBackDay, setWelcomeBackDay] = useState(2);
  const [previousStreak, setPreviousStreak] = useState(0);
  const [dailyGoalMinutes, setDailyGoalMinutes] = useState(10);
  const [dailyGoalCurrent, setDailyGoalCurrent] = useState(0);

  const refreshProfile = useCallback(async () => {
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
  }, [setFromProfile, userId]);

  useEffect(() => {
    void refreshProfile();
  }, [refreshProfile]);

  useEffect(() => {
    const run = async () => {
      if (!userId) return;
      const today = new Date().toISOString().slice(0, 10);
      const key = `linguamold.streak_checked_${today}`;
      const already = await AsyncStorage.getItem(key);
      if (already === '1') return;

      streakBeforeCheck.current = useGamificationStore.getState().currentStreak;
      await checkStreak();
      const after = useGamificationStore.getState().currentStreak;

      if (streakBeforeCheck.current != null && streakBeforeCheck.current > 0 && after === 0) {
        setPreviousStreak(streakBeforeCheck.current);
        setShowStreakBreak(true);
      } else if (after > 0 && after <= 5) {
        const wbKey = `linguamold.welcome_back_${today}`;
        const wbShown = await AsyncStorage.getItem(wbKey);
        if (!wbShown && [2, 3, 5].includes(after)) {
          setWelcomeBackDay(after);
          setShowWelcomeBack(true);
          await AsyncStorage.setItem(wbKey, '1');
        } else if (after > 0) {
          pushToast(t('gamify.streak_celebration'), '🔥');
        }
      } else if (after > 0) {
        pushToast(t('gamify.streak_celebration'), '🔥');
      }

      // Load daily goal progress
      const goalStr = await AsyncStorage.getItem('linguamold.daily_goal_minutes');
      if (goalStr) setDailyGoalMinutes(Number(goalStr) || 10);

      await AsyncStorage.setItem(key, '1');
    };
    void run();
  }, [userId, checkStreak, pushToast, t]);

  const openModule = useCallback((m: ModuleWithProgress) => {
    setSelected(m);
  }, []);

  useFocusEffect(
    useCallback(() => {
      void reload();
      void refreshProfile();
      void reloadLessons();
    }, [reload, refreshProfile, reloadLessons])
  );

  if (showWelcomeBack) {
    return (
      <WelcomeBackScreen
        dayCount={welcomeBackDay}
        wordsLearned={0}
        onContinue={() => setShowWelcomeBack(false)}
        onDismiss={() => setShowWelcomeBack(false)}
      />
    );
  }

  if (showStreakBreak) {
    return (
      <StreakBreakScreen
        previousStreak={previousStreak}
        totalWordsLearned={0}
        onStartFresh={() => setShowStreakBreak(false)}
        onVisitShop={() => {
          setShowStreakBreak(false);
          router.push('/(main)/shop');
        }}
      />
    );
  }

  return (
    <ScreenContainer edges={['top', 'left', 'right']}>
      {isAdminMode && checkIsAdmin() ? <AdminToggleBar /> : null}
      <View style={styles.header}>
        <StreakBadge />
        <DailyGoalRing currentMinutes={dailyGoalCurrent} goalMinutes={dailyGoalMinutes} compact />
        <Text variant="display" style={styles.brand}>
          LinguaMold
        </Text>
        <View style={styles.rightBadges}>
          <Text variant="label" style={styles.heartBadge} accessibilityLabel={`${hearts} vies`}>
            ❤️ {hearts}
          </Text>
          <Text variant="label" style={styles.gemBadge} accessibilityLabel={`${gems} gemmes`}>
            💎 {gems}
          </Text>
        </View>
      </View>
      {loading ? (
        <View style={{ gap: spacing.md }}>
          <SkeletonLoader height={120} />
          <SkeletonLoader height={80} />
          <SkeletonLoader height={120} />
          <SkeletonLoader height={80} />
        </View>
      ) : error ? (
        <ErrorState message={t('error.network')} onRetry={() => void reload()} retryLabel={t('common.try_again')} />
      ) : (
        <FirstTimeTooltip
          storageKey="linguamold.tooltip.adventure"
          message={t('adventure.first_time')}
        >
          <AdventurePath modules={modules} onSelectModule={openModule} />
        </FirstTimeTooltip>
      )}
      <Modal visible={Boolean(selected)} animationType="slide" transparent>
        <Pressable style={styles.modalBackdrop} onPress={() => setSelected(null)}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <Text variant="h2">{selected?.title_al}</Text>
            {lessonsLoading ? (
              <Text variant="caption">{t('common.loading')}</Text>
            ) : (
              <ScrollView style={styles.list}>
                {lessons.length === 0 ? (
                  <Text variant="caption" style={styles.emptyLessons}>
                    {t('common.no_content')}
                  </Text>
                ) : (
                  lessons.map((l) => {
                    const scorePct = lessonBestScorePercent(l.progress);
                    const rowLabel =
                      !l.locked && scorePct != null
                        ? `${scorePct}%`
                        : null;
                    return (
                    <Pressable
                      key={l.id}
                      disabled={l.locked}
                      onPress={() => {
                        setSelected(null);
                        router.push(`/lesson/${l.id}`);
                      }}
                      style={[styles.lessonRow, l.locked && styles.lessonLocked]}
                      accessibilityLabel={
                        l.locked
                          ? `${l.title_al}, ${t('lesson.locked')}`
                          : rowLabel
                            ? `${l.title_al}, ${rowLabel}`
                            : `${l.title_al}, ${t('lesson.start')}`
                      }
                    >
                      <View style={styles.lessonRowInner}>
                        <Text variant="bodyBold" style={styles.lessonTitle}>{l.title_al}</Text>
                        {l.locked ? (
                          <Text variant="caption">{t('lesson.locked')}</Text>
                        ) : rowLabel != null ? (
                          <Text variant="bodyBold" style={styles.scoreLabel}>
                            {rowLabel}
                          </Text>
                        ) : (
                          <Text variant="bodyBold" style={styles.startLabel}>
                            {t('lesson.start')} →
                          </Text>
                        )}
                      </View>
                    </Pressable>
                    );
                  })
                )}
              </ScrollView>
            )}
            <Pressable onPress={() => setSelected(null)} style={styles.close}>
              <Text variant="bodyBold">{t('common.close')}</Text>
            </Pressable>
          </Pressable>
        </Pressable>
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
  brand: { flex: 1, textAlign: 'center', letterSpacing: -0.5 },
  rightBadges: {
    flexDirection: 'row',
    gap: spacing.xs,
    alignItems: 'center',
  },
  heartBadge: {
    color: colors.error,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.pill,
    backgroundColor: '#FEF2F2',
    borderWidth: 1.5,
    borderColor: '#FECACA',
    overflow: 'hidden',
  },
  gemBadge: {
    color: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.pill,
    backgroundColor: colors.primaryLight,
    borderWidth: 1.5,
    borderColor: '#BAE6FD',
    overflow: 'hidden',
  },
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
  lessonRowInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lessonTitle: { flex: 1 },
  startLabel: { color: colors.primary },
  scoreLabel: { color: colors.primary, minWidth: 48, textAlign: 'right' },
  lessonLocked: { opacity: 0.4 },
  emptyLessons: { textAlign: 'center', paddingVertical: spacing.lg },
  close: { marginTop: spacing.lg, alignItems: 'center' },
});
