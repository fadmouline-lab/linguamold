import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { colors, spacing } from '@/components/ui/theme';
import { useCountUp } from '@/hooks/useCountUp';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useUIString } from '@/hooks/useUIString';
import { celebration } from '@/lib/haptics';
import { SPRING, TIMING } from '@/lib/motion';

export interface LevelUpScreenProps {
  level: number;
  onDismiss: () => void;
}

function getLevelDescriptorKey(level: number): string {
  if (level <= 3)  return 'gamify.level_descriptor_beginner';
  if (level <= 7)  return 'gamify.level_descriptor_intermediate';
  if (level <= 12) return 'gamify.level_descriptor_advanced';
  return 'gamify.level_descriptor_expert';
}

export function LevelUpScreen({ level, onDismiss }: LevelUpScreenProps) {
  const { t } = useUIString();
  const reduced = useReducedMotion();

  // Count up from previous level to new level
  const levelDisplay = useCountUp(level, 800, 300);

  // Background overlay: fades in primaryLight tint
  const bgOpacity = useSharedValue(reduced ? 1 : 0);

  // Number scale: 0.5 → 1.2 → 1.0
  const numScale = useSharedValue(reduced ? 1 : 0.5);
  const numOpacity = useSharedValue(reduced ? 1 : 0);

  // Heading + descriptor + button: staggered fade-in
  const headingOpacity = useSharedValue(reduced ? 1 : 0);
  const descriptorOpacity = useSharedValue(reduced ? 1 : 0);
  const btnOpacity = useSharedValue(reduced ? 1 : 0);

  useEffect(() => {
    if (reduced) return;

    bgOpacity.value = withTiming(1, { duration: TIMING.dramatic });

    numScale.value = withDelay(
      300,
      withSequence(
        withSpring(1.2, SPRING.celebration),
        withSpring(1.0, SPRING.card),
      ),
    );
    numOpacity.value = withDelay(300, withTiming(1, { duration: TIMING.fast }));

    headingOpacity.value    = withDelay(700,  withTiming(1, { duration: TIMING.fast }));
    descriptorOpacity.value = withDelay(900,  withTiming(1, { duration: TIMING.fast }));
    btnOpacity.value        = withDelay(1200, withTiming(1, { duration: TIMING.fast }));

    // Haptic fires when number settles (~300ms + spring duration ~600ms)
    const hapticTimer = setTimeout(() => celebration(), 900);

    return () => {
      clearTimeout(hapticTimer);
      cancelAnimation(bgOpacity);
      cancelAnimation(numScale);
      cancelAnimation(numOpacity);
      cancelAnimation(headingOpacity);
      cancelAnimation(descriptorOpacity);
      cancelAnimation(btnOpacity);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const bgOverlayStyle = useAnimatedStyle(() => ({
    opacity: bgOpacity.value,
  }));

  const numStyle = useAnimatedStyle(() => ({
    transform: [{ scale: numScale.value }],
    opacity: numOpacity.value,
  }));

  const headingStyle = useAnimatedStyle(() => ({ opacity: headingOpacity.value }));
  const descriptorStyle = useAnimatedStyle(() => ({ opacity: descriptorOpacity.value }));
  const btnStyle = useAnimatedStyle(() => ({ opacity: btnOpacity.value }));

  return (
    <View style={styles.wrap}>
      {/* Background color shift: overlay with primaryLight tint */}
      <Animated.View
        style={[styles.bgOverlay, bgOverlayStyle]}
        pointerEvents="none"
      />

      <View style={styles.content}>
        <Animated.Text style={[styles.levelNumber, numStyle]}>
          {reduced ? level : levelDisplay}
        </Animated.Text>

        <Animated.View style={headingStyle}>
          <Text variant="h1" style={styles.heading}>
            Level {level}!
          </Text>
        </Animated.View>

        <Animated.View style={descriptorStyle}>
          <Text variant="body" style={styles.descriptor}>
            {t(getLevelDescriptorKey(level))}
          </Text>
        </Animated.View>

        <View style={styles.spacer} />

        <Animated.View style={[styles.buttonWrap, btnStyle]}>
          <Button
            title={t('common.continue')}
            variant="primary"
            onPress={onDismiss}
            style={styles.button}
          />
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: colors.background,
  },
  bgOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.primaryLight,
    zIndex: 0,
  },
  content: {
    flex: 1,
    padding: spacing.xxxl,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  levelNumber: {
    fontSize: 72,
    lineHeight: 80,
    color: colors.primary,
    marginBottom: spacing.md,
    fontWeight: '800',
  },
  heading: {
    textAlign: 'center',
    marginBottom: spacing.lg,
    color: colors.accent,
  },
  descriptor: {
    textAlign: 'center',
    color: colors.textSecondary,
  },
  spacer: {
    height: spacing.huge,
  },
  buttonWrap: {
    width: '100%',
    zIndex: 1,
  },
  button: {
    width: '100%',
  },
});
