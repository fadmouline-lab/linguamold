import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { colors, spacing } from '@/components/ui/theme';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useUIString } from '@/hooks/useUIString';
import { TIMING } from '@/lib/motion';

export interface StreakBreakScreenProps {
  previousStreak: number;
  totalWordsLearned: number;
  onStartFresh: () => void;
  onVisitShop: () => void;
}

export function StreakBreakScreen({
  previousStreak,
  totalWordsLearned,
  onStartFresh,
  onVisitShop,
}: StreakBreakScreenProps) {
  const { t } = useUIString();
  const reduced = useReducedMotion();
  const showFlame = previousStreak >= 7; // flame emoji only on long streak break

  // Flame extinguish: scale 1→0.5, opacity 1→0.3 over 1500ms
  const flameScale = useSharedValue(reduced ? 0.5 : 1);
  const flameOpacity = useSharedValue(reduced ? 0.3 : 1);

  // Text and buttons appear after flame diminishes (no haptic on loss per plan)
  const textOpacity = useSharedValue(reduced ? 1 : 0);
  const btnOpacity = useSharedValue(reduced ? 1 : 0);

  useEffect(() => {
    const textDelay = showFlame && !reduced ? 800  : 0;
    const btnDelay  = showFlame && !reduced ? 1200 : 100;

    if (showFlame && !reduced) {
      flameScale.value   = withTiming(0.5, { duration: 1500 });
      flameOpacity.value = withTiming(0.3, { duration: 1500 });
    }

    textOpacity.value = withDelay(textDelay, withTiming(1, { duration: TIMING.normal }));
    btnOpacity.value  = withDelay(btnDelay,  withTiming(1, { duration: TIMING.fast  }));

    return () => {
      cancelAnimation(flameScale);
      cancelAnimation(flameOpacity);
      cancelAnimation(textOpacity);
      cancelAnimation(btnOpacity);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const flameStyle = useAnimatedStyle(() => ({
    transform: [{ scale: flameScale.value }],
    opacity:   flameOpacity.value,
  }));

  const textStyle = useAnimatedStyle(() => ({ opacity: textOpacity.value }));
  const btnStyle  = useAnimatedStyle(() => ({ opacity: btnOpacity.value  }));

  const getMessaging = () => {
    if (previousStreak < 3) {
      return {
        emoji: '👋',
        title: t('gamify.streak_break_light_title') || 'Welcome back!',
        subtitle: t('gamify.streak_break_light_sub') || 'Start a fresh streak today.',
      };
    }
    if (previousStreak < 7) {
      return {
        emoji: '💪',
        title: t('gamify.streak_break_medium_title', { count: previousStreak }) || `Your ${previousStreak}-day streak ended.`,
        subtitle: t('gamify.streak_break_medium_sub', { count: totalWordsLearned }) || `That's okay — you've learned ${totalWordsLearned} words!`,
      };
    }
    return {
      emoji: '🔥',
      title: t('gamify.streak_break_long_title', { count: previousStreak }) || `Your ${previousStreak}-day streak ended.`,
      subtitle: t('gamify.streak_break_long_sub', { count: totalWordsLearned }) || `You learned ${totalWordsLearned} words along the way.`,
    };
  };

  const messaging = getMessaging();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Animated.Text style={[styles.emoji, showFlame && flameStyle]}>
          {messaging.emoji}
        </Animated.Text>
        <Animated.View style={textStyle}>
          <Text variant="h1" style={styles.title}>
            {messaging.title}
          </Text>
          <Text variant="body" color={colors.textSecondary} style={styles.subtitle}>
            {messaging.subtitle}
          </Text>
        </Animated.View>
      </View>

      <Animated.View style={[styles.footer, btnStyle]}>
        <Button
          title={t('gamify.streak_start_fresh') || 'Start a new streak'}
          variant="primary"
          onPress={onStartFresh}
        />
        {previousStreak >= 7 && (
          <Button
            title={t('gamify.streak_get_freeze') || 'Get a Streak Freeze'}
            variant="secondary"
            onPress={onVisitShop}
            style={styles.secondaryButton}
          />
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xxl,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 64,
    marginBottom: spacing.xxl,
  },
  title: {
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  subtitle: {
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
  },
  footer: {
    paddingVertical: spacing.lg,
  },
  secondaryButton: {
    marginTop: spacing.md,
  },
});
