import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import Animated, { SlideInRight } from 'react-native-reanimated';

import { HeartDisplay } from '@/components/gamification/HeartDisplay';
import { LessonCompleteScreen } from '@/components/gamification/LessonCompleteScreen';
import { ProgressBar } from '@/components/gamification/ProgressBar';
import { XPGainFloat } from '@/components/gamification/XPGainFloat';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Text } from '@/components/ui/Text';
import { colors, spacing } from '@/components/ui/theme';
import { useExerciseEngine } from '@/hooks/useExerciseEngine';
import { useHearts } from '@/hooks/useHearts';
import { useUIString } from '@/hooks/useUIString';
import { getMoldComponent } from '@/lib/mold-registry';
import { toMoldExercise } from '@/lib/exercise-mapper';
import {
  XP_CORRECT_ANSWER,
  XP_COMBO_BONUS,
  XP_LESSON_COMPLETE,
  XP_PERFECT_LESSON,
} from '@/lib/constants';

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
  } = useExerciseEngine(placementMode);
  const { canPlay, getTimeToNextHeart } = useHearts();
  const [blocked, setBlocked] = useState(false);
  const [minutesLeft, setMinutesLeft] = useState(0);
  const [xpBurst, setXpBurst] = useState(false);

  useEffect(() => {
    if (!id) return;
    void loadLesson(id);
    return () => resetLesson();
  }, [id, loadLesson, resetLesson]);

  useEffect(() => {
    const run = async () => {
      const ok = await canPlay();
      setBlocked(!ok && !placementMode);
      if (!ok) setMinutesLeft(await getTimeToNextHeart());
    };
    void run();
  }, [canPlay, getTimeToNextHeart, placementMode, hearts]);

  const onAnswer = useCallback(
    async (isCorrect: boolean, answer: unknown) => {
      await submitAnswer(isCorrect, answer);
      if (isCorrect) {
        setXpBurst(true);
        setTimeout(() => setXpBurst(false), 900);
      }
    },
    [submitAnswer]
  );

  const onNext = useCallback(async () => {
    await advance();
  }, [advance]);

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
    return (
      <ScreenContainer>
        <ActivityIndicator color={colors.primary} />
      </ScreenContainer>
    );
  }

  if (blocked) {
    return (
      <ScreenContainer>
        <Text variant="h2">{t('lesson.no_hearts')}</Text>
        <Text variant="caption">
          {minutesLeft} min
        </Text>
        <Pressable onPress={() => router.back()} style={styles.close}>
          <Text variant="body">{t('common.close')}</Text>
        </Pressable>
      </ScreenContainer>
    );
  }

  if (isComplete) {
    const xp =
      XP_LESSON_COMPLETE + (isPerfect() ? XP_PERFECT_LESSON : 0);
    return (
      <LessonCompleteScreen
        scorePct={getScore()}
        xpEarned={xp}
        streakKept
        onContinue={() => router.back()}
      />
    );
  }

  return (
    <ScreenContainer edges={['top', 'left', 'right']}>
      <View style={styles.top}>
        <Pressable onPress={() => router.back()} accessibilityRole="button">
          <Ionicons name="close" size={28} color={colors.textPrimary} />
        </Pressable>
        <View style={styles.barWrap}>
          <ProgressBar current={currentIndex} total={exercises.length} />
        </View>
        {!placementMode ? <HeartDisplay hearts={hearts} /> : null}
      </View>
      <XPGainFloat amount={XP_CORRECT_ANSWER + XP_COMBO_BONUS} visible={xpBurst} />
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
          />
        </Animated.View>
      ) : (
        <Text variant="body">{t('error.empty')}</Text>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  barWrap: { flex: 1 },
  body: { flex: 1 },
  close: { marginTop: spacing.lg },
});
