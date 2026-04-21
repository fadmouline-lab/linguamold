import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, BackHandler, Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  SlideInRight,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { ComboCounter } from '@/components/gamification/ComboCounter';
import { HeartDisplay } from '@/components/gamification/HeartDisplay';
import { LessonCompleteScreen } from '@/components/gamification/LessonCompleteScreen';
import { ProgressBar } from '@/components/gamification/ProgressBar';
import { XPGainFloat } from '@/components/gamification/XPGainFloat';
import { Button } from '@/components/ui/Button';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Text } from '@/components/ui/Text';
import { colors, spacing } from '@/components/ui/theme';
import { useExerciseEngine } from '@/hooks/useExerciseEngine';
import { useHearts } from '@/hooks/useHearts';
import { useUIString } from '@/hooks/useUIString';
import { getMoldComponent } from '@/lib/mold-registry';
import { toMoldExercise } from '@/lib/exercise-mapper';
import { playSound, preloadSounds, unloadSounds } from '@/lib/sounds';
import { useLessonStore } from '@/stores/lessonStore';
import { useGamificationStore } from '@/stores/gamificationStore';
import type { WordSummary } from '@/components/gamification/LessonCompleteScreen';
import type { ExerciseRow } from '@/types/index';
import {
  XP_CORRECT_ANSWER,
  XP_COMBO_BONUS,
  XP_LESSON_COMPLETE,
  XP_PERFECT_LESSON,
} from '@/lib/constants';

function extractWordSummary(ex: ExerciseRow): WordSummary | null {
  const c = ex.content as Record<string, unknown>;
  switch (ex.mold_type) {
    case 'flashcard':
      return {
        word: String(c.word_ll ?? c.prompt_ll ?? ''),
        translation: String(c.translation_al ?? ''),
      };
    case 'fill_in_the_blank': {
      const opts = c.options as Array<{ text: string; is_correct: boolean }> | undefined;
      const correct = opts?.find((o) => o.is_correct)?.text ?? '';
      const sentence = String(c.sentence_al ?? '').replace('___', correct);
      return correct ? { word: correct, translation: sentence } : null;
    }
    case 'translate_sentence':
      return {
        word: String(c.prompt_al ?? ''),
        translation: (c.accepted_answers_ll as string[] | undefined)?.[0] ?? '',
      };
    case 'select_correct_verb': {
      const opts = c.options as Array<{ text: string; is_correct: boolean }> | undefined;
      const correct = opts?.find((o) => o.is_correct)?.text ?? '';
      return correct ? { word: correct, translation: String(c.sentence_ll ?? '') } : null;
    }
    default:
      return null;
  }
}

export default function LessonScreen() {
  const { lessonId, placement } = useLocalSearchParams<{
    lessonId: string;
    placement?: string;
  }>();
  const id = typeof lessonId === 'string' ? lessonId : lessonId?.[0] ?? '';
  const { t } = useUIString();
  const placementMode = placement === '1' || placement === 'true';
  const {
    exercises,
    currentIndex,
    isComplete,
    isLoading,
    hearts,
    loadLesson,
    submitAnswer,
    advance,
    getScore,
    isPerfect,
    resetLesson,
    skipExercise,
    useHint,
    comboStreak,
    skipCount,
    practiceMode,
  } = useExerciseEngine(placementMode);
  const { canPlay, getTimeToNextHeart } = useHearts();
  const [blocked, setBlocked] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [minutesLeft, setMinutesLeft] = useState(0);
  const [xpBurst, setXpBurst] = useState(false);
  const lastAnswerRef = useRef<boolean | null>(null);
  const [hintsUsed, setHintsUsed] = useState(0);
  const soundEnabled = useLessonStore((s) => s.soundEnabled);

  // Flash overlay for correct/wrong feedback
  const flashOpacity = useSharedValue(0);
  const flashColor = useSharedValue<string>(colors.correctGlow);

  const flashStyle = useAnimatedStyle(() => ({
    opacity: flashOpacity.value,
    backgroundColor: flashColor.value,
  }));

  useEffect(() => {
    if (!id) return;
    void loadLesson(id);
    void preloadSounds();
    return () => {
      resetLesson();
      void unloadSounds();
    };
  }, [id, loadLesson, resetLesson]);

  useEffect(() => {
    const run = async () => {
      const ok = await canPlay();
      setBlocked(!ok && !placementMode);
      if (!ok) setMinutesLeft(await getTimeToNextHeart());
    };
    void run();
  }, [canPlay, getTimeToNextHeart, placementMode, hearts]);

  const triggerFlash = useCallback((isCorrect: boolean) => {
    flashColor.value = isCorrect ? colors.correctGlow : colors.errorGlow;
    flashOpacity.value = withSequence(
      withTiming(1, { duration: 80 }),
      withTiming(0, { duration: 400 })
    );
  }, [flashColor, flashOpacity]);

  const onAnswer = useCallback(
    async (isCorrect: boolean, answer: unknown) => {
      lastAnswerRef.current = isCorrect;
      await submitAnswer(isCorrect, answer);
      triggerFlash(isCorrect);
      if (isCorrect) {
        setXpBurst(true);
        setTimeout(() => setXpBurst(false), 900);
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        if (soundEnabled) {
          playSound('correct');
          const newStreak = useLessonStore.getState().comboStreak;
          if (newStreak === 10)     playSound('combo10');
          else if (newStreak === 5) playSound('combo5');
          else if (newStreak === 3) playSound('combo3');
        }
      } else {
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        if (soundEnabled) playSound('wrong');
      }
      setHintsUsed(0);
    },
    [submitAnswer, triggerFlash, hintsUsed, soundEnabled]
  );

  const onSkip = useCallback(async () => {
    await skipExercise();
    setHintsUsed(0);
  }, [skipExercise]);

  const onHintPress = useCallback(() => {
    const count = useHint();
    setHintsUsed(count);
  }, [useHint]);

  const onNext = useCallback(async () => {
    await advance();
  }, [advance]);

  const handleClose = useCallback(() => {
    setShowExitConfirm(true);
  }, []);

  /** Placement and some redirects use `replace`, so there is no history to pop. */
  const leaveLesson = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(main)/home');
    }
  }, []);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (isComplete || blocked) return false;
      handleClose();
      return true;
    });
    return () => sub.remove();
  }, [isComplete, blocked, handleClose]);

  const moldExercise = exercises[currentIndex];
  const Mold = moldExercise ? getMoldComponent(moldExercise.mold_type) : null;

  if (!id) {
    return (
      <ScreenContainer>
        <Text variant="body">{t('error.empty')}</Text>
      </ScreenContainer>
    );
  }

  if (isLoading) {
    return <LessonLoadingScreen />;
  }

  if (blocked) {
    return (
      <ScreenContainer>
        <View style={styles.blockedCenter}>
          <Text style={styles.blockedEmoji}>💔</Text>
          <Text variant="h2">{t('lesson.recharge_title')}</Text>
          <Text variant="body" style={styles.blockedSub}>
            {t('lesson.recharge_subtitle')}
          </Text>
          <Text variant="body" style={styles.blockedTimer}>
            ⏱️ {minutesLeft} min
          </Text>
          <View style={styles.blockedActions}>
            <Button
              title={t('lesson.no_hearts_shop')}
              variant="secondary"
              onPress={() => router.push('/(main)/shop')}
            />
            <Button
              title={t('lesson.practice_mode')}
              variant="outline"
              onPress={() => {
                useLessonStore.getState().setPracticeMode(true);
                setBlocked(false);
              }}
            />
            <Pressable onPress={leaveLesson} style={styles.blockedClose}>
              <Text variant="bodyBold" style={{ color: colors.textSecondary }}>
                {t('common.close')}
              </Text>
            </Pressable>
          </View>
        </View>
      </ScreenContainer>
    );
  }

  if (isComplete) {
    const xp = XP_LESSON_COMPLETE + (isPerfect() ? XP_PERFECT_LESSON : 0);
    const currentStreak = useGamificationStore.getState().currentStreak;
    const allAnswers = useLessonStore.getState().answers;
    const allExercises = useLessonStore.getState().exercises;

    const lastCorrectByExercise = new Map<string, boolean>();
    allAnswers.forEach((a) => {
      if (!a.isSkipped) lastCorrectByExercise.set(a.exerciseId, a.isCorrect);
    });

    const wordsLearned: WordSummary[] = [];
    const wordsToReview: WordSummary[] = [];
    lastCorrectByExercise.forEach((isCorrect, exerciseId) => {
      const ex = allExercises.find((e) => e.id === exerciseId);
      if (!ex) return;
      const summary = extractWordSummary(ex);
      if (!summary || (!summary.word && !summary.translation)) return;
      if (isCorrect) wordsLearned.push(summary);
      else wordsToReview.push(summary);
    });

    return (
      <LessonCompleteScreen
        scorePct={getScore()}
        xpEarned={xp}
        streakKept={currentStreak > 0}
        streakCount={currentStreak}
        onContinue={leaveLesson}
        wordsLearned={wordsLearned}
        wordsToReview={wordsToReview}
      />
    );
  }

  return (
    <ScreenContainer edges={['top', 'left', 'right']}>
      {/* Flash overlay for correct/wrong */}
      <Animated.View style={[StyleSheet.absoluteFill, styles.flash, flashStyle]} pointerEvents="none" />

      <View style={styles.top}>
        <Pressable
          onPress={handleClose}
          accessibilityRole="button"
          accessibilityLabel="Fermer"
          style={styles.closeBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="close" size={26} color={colors.textSecondary} />
        </Pressable>
        <View style={styles.barWrap}>
          <ProgressBar current={currentIndex} total={exercises.length} />
        </View>
        {!placementMode ? <HeartDisplay hearts={hearts} /> : null}
      </View>

      <XPGainFloat amount={XP_CORRECT_ANSWER + XP_COMBO_BONUS} visible={xpBurst} />

      <ComboCounter streak={comboStreak} />

      {practiceMode && (
        <View style={styles.practiceBanner}>
          <Text variant="caption" style={styles.practiceBannerText}>
            {t('lesson.practice_banner')}
          </Text>
        </View>
      )}

      {moldExercise && Mold ? (
        <Animated.View
          key={moldExercise.id}
          entering={SlideInRight}
          style={styles.body}
        >
          <Mold
            exercise={toMoldExercise(moldExercise)}
            onAnswer={(ok, ans) => void onAnswer(ok, ans)}
            onNext={() => void onNext()}
            onSkip={onSkip}
            skipCount={skipCount}
            onHint={onHintPress}
            hintsUsed={hintsUsed}
          />
        </Animated.View>
      ) : (
        <Text variant="body">{t('error.empty')}</Text>
      )}
      <ConfirmDialog
        visible={showExitConfirm}
        title={t('confirm.exit_lesson_title')}
        message={t('confirm.exit_lesson_message')}
        confirmLabel={t('confirm.exit_continue')}
        cancelLabel={t('confirm.exit_quit')}
        onConfirm={() => setShowExitConfirm(false)}
        onCancel={() => { setShowExitConfirm(false); leaveLesson(); }}
      />
    </ScreenContainer>
  );
}

function LessonLoadingScreen() {
  const { t } = useUIString();
  const [showPatience, setShowPatience] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowPatience(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <ScreenContainer>
      <View style={styles.loadingCenter}>
        <ActivityIndicator color={colors.primary} size="large" />
        {showPatience ? (
          <Text variant="caption" style={styles.patienceText}>
            {t('lesson.loading_patience')}
          </Text>
        ) : null}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  flash: {
    zIndex: 10,
    pointerEvents: 'none',
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
    paddingTop: spacing.xs,
  },
  closeBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  barWrap: { flex: 1 },
  body: { flex: 1 },
  close: { marginTop: spacing.lg },
  loadingCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  patienceText: {
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  blockedCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.lg,
    paddingHorizontal: spacing.xl,
  },
  blockedEmoji: {
    fontSize: 48,
  },
  blockedTimer: {
    color: colors.textSecondary,
    fontSize: 18,
  },
  blockedActions: {
    width: '100%',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  blockedClose: {
    alignItems: 'center',
    marginTop: spacing.sm,
    padding: spacing.md,
  },
  blockedSub: {
    color: colors.textSecondary,
    textAlign: 'center',
  },
  practiceBanner: {
    backgroundColor: colors.surfaceLight,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    alignSelf: 'center',
    marginBottom: spacing.sm,
  },
  practiceBannerText: {
    color: colors.textSecondary,
  },
});
