import { useEffect } from 'react';
import { Dimensions, Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { colors, radii, spacing } from '@/components/ui/theme';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useUIString } from '@/hooks/useUIString';
import { tap } from '@/lib/haptics';
import { SPRING, TIMING } from '@/lib/motion';

const { height: SCREEN_H } = Dimensions.get('window');

export interface WelcomeBackScreenProps {
  dayCount: number;
  wordsLearned: number;
  onContinue: () => void;
  onDismiss: () => void;
}

export function WelcomeBackScreen({
  dayCount,
  wordsLearned,
  onContinue,
  onDismiss,
}: WelcomeBackScreenProps) {
  const { t } = useUIString();
  const reduced = useReducedMotion();

  // Card slides up from below screen
  const cardY = useSharedValue(reduced ? 0 : SCREEN_H);
  const cardOpacity = useSharedValue(reduced ? 1 : 0);

  // Emoji bounces in after card settles
  const emojiScale = useSharedValue(reduced ? 1 : 0);

  // Text stagger
  const textOpacity = useSharedValue(reduced ? 1 : 0);
  const textTranslate = useSharedValue(reduced ? 0 : 10);

  // Dismiss button fades in last
  const dismissOpacity = useSharedValue(reduced ? 1 : 0);

  useEffect(() => {
    if (reduced) return;

    cardY.value = withSpring(0, SPRING.card);
    cardOpacity.value = withTiming(1, { duration: TIMING.fast });

    // Haptic when card settles
    const hapticTimer = setTimeout(() => tap(), 400);

    // Emoji bounce after card settles
    emojiScale.value = withDelay(300, withSpring(1, SPRING.celebration));

    // Text stagger
    textOpacity.value   = withDelay(500, withTiming(1,  { duration: TIMING.normal }));
    textTranslate.value = withDelay(500, withSpring(0,  SPRING.card));

    // Dismiss button last
    dismissOpacity.value = withDelay(700, withTiming(1, { duration: TIMING.fast }));

    return () => {
      clearTimeout(hapticTimer);
      cancelAnimation(cardY);
      cancelAnimation(cardOpacity);
      cancelAnimation(emojiScale);
      cancelAnimation(textOpacity);
      cancelAnimation(textTranslate);
      cancelAnimation(dismissOpacity);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: cardY.value }],
    opacity: cardOpacity.value,
  }));

  const emojiStyle = useAnimatedStyle(() => ({
    transform: [{ scale: emojiScale.value }],
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: textTranslate.value }],
  }));

  const dismissStyle = useAnimatedStyle(() => ({ opacity: dismissOpacity.value }));

  const getTitle = () => {
    switch (dayCount) {
      case 2: return t('onboarding.day2');
      case 3: return t('onboarding.day3');
      case 5: return t('onboarding.day5');
      default: return t('onboarding.day2');
    }
  };

  return (
    <Animated.View style={[styles.container, cardStyle]}>
      <Animated.View style={[styles.dismissWrap, dismissStyle]}>
        <Pressable
          onPress={onDismiss}
          style={styles.dismissButton}
          accessibilityLabel="Dismiss"
          accessibilityRole="button"
        >
          <Text variant="h3" color={colors.textSecondary}>✕</Text>
        </Pressable>
      </Animated.View>

      <View style={styles.content}>
        <Animated.Text style={[styles.emoji, emojiStyle]}>🎉</Animated.Text>
        <Animated.View style={textStyle}>
          <Text variant="h1" style={styles.title}>
            {getTitle()}
          </Text>
          <Text variant="body" color={colors.textSecondary} style={styles.subtitle}>
            {t('onboarding.welcome_back_sub', { count: wordsLearned })}
          </Text>
        </Animated.View>
      </View>

      <View style={styles.footer}>
        <Button
          title={t('onboarding.welcome_back_cta') || 'Continue Learning'}
          variant="primary"
          onPress={onContinue}
        />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xxl,
  },
  dismissWrap: {
    position: 'absolute',
    top: spacing.lg,
    right: spacing.lg,
    zIndex: 10,
  },
  dismissButton: {
    width: 40,
    height: 40,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
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
  },
  footer: {
    paddingVertical: spacing.lg,
  },
});
