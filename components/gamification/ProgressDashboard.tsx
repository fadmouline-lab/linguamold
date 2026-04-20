import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { Text } from '@/components/ui/Text';
import { colors, radii, shadows, spacing } from '@/components/ui/theme';
import { useAnimatedMount } from '@/hooks/useAnimatedMount';
import { useCountUp } from '@/hooks/useCountUp';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useUIString } from '@/hooks/useUIString';
import { SPRING, TIMING } from '@/lib/motion';

export interface ProgressDashboardProps {
  totalWords: number;
  accuracyPct: number;
  level: number;
  xpToNext: number;
  totalXp: number;
  lessonsCompleted: number;
  minutesPracticed: number;
  weakWords: { word: string; mistakeCount: number }[];
  onPracticeWord?: (word: string) => void;
}

function formatTime(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return remainder > 0 ? `${hours}h ${remainder}m` : `${hours}h`;
}

function AnimatedWeakWord({
  word,
  mistakeCount,
  index,
  onPractice,
}: {
  word: string;
  mistakeCount: number;
  index: number;
  onPractice?: (word: string) => void;
}) {
  const { t } = useUIString();
  const mountStyle = useAnimatedMount({ translateY: 10, delay: index * 100 });

  return (
    <Animated.View style={[styles.weakRow, mountStyle]}>
      <View style={styles.weakWordInfo}>
        <Text variant="bodyBold">{word}</Text>
        <View style={styles.mistakeBadge}>
          <Text variant="micro" color={colors.error}>
            {mistakeCount}x
          </Text>
        </View>
      </View>
      {onPractice ? (
        <Pressable
          onPress={() => onPractice(word)}
          style={styles.practiceButton}
          accessibilityRole="button"
        >
          <Text variant="label" color={colors.primary}>
            {t('profile.practice')}
          </Text>
        </Pressable>
      ) : null}
    </Animated.View>
  );
}

export function ProgressDashboard({
  totalWords,
  accuracyPct,
  level,
  xpToNext,
  totalXp,
  lessonsCompleted,
  minutesPracticed,
  weakWords,
  onPracticeWord,
}: ProgressDashboardProps) {
  const { t } = useUIString();
  const reduced = useReducedMotion();

  // Animated count-up for all stats (800ms)
  const wordsDisplay      = useCountUp(totalWords,       TIMING.slow);
  const accuracyDisplay   = useCountUp(accuracyPct,      TIMING.slow);
  const levelDisplay      = useCountUp(level,            TIMING.slow);
  const lessonsDisplay    = useCountUp(lessonsCompleted, TIMING.slow);
  const totalXpDisplay    = useCountUp(totalXp,          TIMING.slow);

  // Animated XP progress bar (600ms)
  const xpProgress = totalXp > 0 ? Math.min(1, totalXp / (totalXp + xpToNext)) : 0;
  const barWidth = useSharedValue(0);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    if (containerWidth <= 0) return;
    if (reduced) {
      barWidth.value = containerWidth * xpProgress;
      return;
    }
    barWidth.value = withTiming(containerWidth * xpProgress, { duration: 600 });
    return () => cancelAnimation(barWidth);
  }, [containerWidth, xpProgress, reduced, barWidth]);

  const barStyle = useAnimatedStyle(() => ({ width: barWidth.value }));

  // Stats grid stagger entrance
  const statDelay = (i: number) => (reduced ? 0 : i * 80);
  const s0 = useAnimatedMount({ translateY: 12, delay: statDelay(0) });
  const s1 = useAnimatedMount({ translateY: 12, delay: statDelay(1) });
  const s2 = useAnimatedMount({ translateY: 12, delay: statDelay(2) });
  const s3 = useAnimatedMount({ translateY: 12, delay: statDelay(3) });
  const s4 = useAnimatedMount({ translateY: 12, delay: statDelay(4) });
  const s5 = useAnimatedMount({ translateY: 12, delay: statDelay(5) });
  const statStyles = [s0, s1, s2, s3, s4, s5];

  return (
    <View style={styles.container}>
      <Text variant="h2" style={styles.sectionTitle}>
        {t('profile.progress_title')}
      </Text>

      {/* Stats grid */}
      <View style={styles.grid}>
        <Animated.View style={[styles.statCard, statStyles[0]]}>
          <Text variant="score" style={styles.statValue}>{wordsDisplay}</Text>
          <Text variant="caption">Words learned</Text>
        </Animated.View>

        <Animated.View style={[styles.statCard, statStyles[1]]}>
          <Text variant="score" style={styles.statValue}>{accuracyDisplay}%</Text>
          <Text variant="caption">Accuracy</Text>
        </Animated.View>

        <Animated.View style={[styles.statCard, statStyles[2]]}>
          <Text variant="score" style={styles.statValue}>{levelDisplay}</Text>
          <Text variant="caption">Level</Text>
          <View
            style={styles.progressBarOuter}
            onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
          >
            <Animated.View style={[styles.progressBarInner, barStyle]} />
          </View>
          <Text variant="micro">{xpToNext} XP to next</Text>
        </Animated.View>

        <Animated.View style={[styles.statCard, statStyles[3]]}>
          <Text variant="score" style={styles.statValue}>{lessonsDisplay}</Text>
          <Text variant="caption">Lessons</Text>
        </Animated.View>

        <Animated.View style={[styles.statCard, statStyles[4]]}>
          <Text variant="score" style={styles.statValue}>{formatTime(minutesPracticed)}</Text>
          <Text variant="caption">Time spent</Text>
        </Animated.View>

        <Animated.View style={[styles.statCard, statStyles[5]]}>
          <Text variant="score" style={styles.statValue}>{totalXpDisplay}</Text>
          <Text variant="caption">Total XP</Text>
        </Animated.View>
      </View>

      {/* Weak words section */}
      <Text variant="h3" style={styles.weakTitle}>
        {t('profile.weak_spots')}
      </Text>

      {weakWords.length > 0 ? (
        <View style={styles.weakList}>
          {weakWords.slice(0, 5).map((item, i) => (
            <AnimatedWeakWord
              key={item.word}
              word={item.word}
              mistakeCount={item.mistakeCount}
              index={i}
              onPractice={onPracticeWord}
            />
          ))}
        </View>
      ) : (
        <Text variant="body" style={styles.emptyText}>
          {t('profile.no_weak_spots')}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xxl,
  },
  sectionTitle: {
    marginBottom: spacing.xl,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.xxxl,
  },
  statCard: {
    width: '47%',
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  statValue: {
    fontSize: 28,
    lineHeight: 34,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  progressBarOuter: {
    height: 6,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceLight,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
    overflow: 'hidden',
  },
  progressBarInner: {
    height: '100%',
    borderRadius: radii.pill,
    backgroundColor: colors.primary,
  },
  weakTitle: {
    marginBottom: spacing.lg,
  },
  weakList: {
    gap: spacing.sm,
  },
  weakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: radii.sm,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  weakWordInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  mistakeBadge: {
    backgroundColor: colors.errorLight,
    borderRadius: radii.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
  },
  practiceButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.sm,
    backgroundColor: colors.primaryLight,
  },
  emptyText: {
    color: colors.textSecondary,
    textAlign: 'center',
    paddingVertical: spacing.xl,
  },
});
