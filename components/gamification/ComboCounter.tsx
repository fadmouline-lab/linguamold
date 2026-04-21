import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { Text } from '@/components/ui/Text';
import { colors, radii, spacing } from '@/components/ui/theme';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { celebration } from '@/lib/haptics';
import { SPRING, TIMING } from '@/lib/motion';

interface ComboCounterProps {
  streak: number;
}

export function ComboCounter({ streak }: ComboCounterProps) {
  const reduced = useReducedMotion();

  const entryScale = useSharedValue(0);
  const entryOpacity = useSharedValue(0);
  const pulseScale = useSharedValue(1);
  const glowOpacity = useSharedValue(0);

  // Entrance on every mount (fires when streak crosses 3 and component mounts)
  useEffect(() => {
    if (reduced) {
      entryScale.value = 1;
      entryOpacity.value = 1;
      return;
    }
    entryScale.value = withSpring(1, SPRING.celebration);
    entryOpacity.value = withTiming(1, { duration: TIMING.fast });
    return () => {
      cancelAnimation(entryScale);
      cancelAnimation(entryOpacity);
    };
  // mount-only — intentionally empty deps
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Continuous pulse at x5+
  const atX5 = streak >= 5;
  useEffect(() => {
    if (atX5 && !reduced) {
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.15, { duration: 300 }),
          withTiming(1.0,  { duration: 300 }),
        ),
        -1,
        false,
      );
    } else {
      cancelAnimation(pulseScale);
      pulseScale.value = withTiming(1, { duration: TIMING.fast });
    }
    return () => cancelAnimation(pulseScale);
  }, [atX5, reduced]); // eslint-disable-line react-hooks/exhaustive-deps

  // Screen edge glow at x10+
  const atX10 = streak >= 10;
  useEffect(() => {
    if (atX10 && !reduced) {
      glowOpacity.value = withTiming(1, { duration: TIMING.normal });
    } else {
      glowOpacity.value = withTiming(0, { duration: TIMING.fast });
    }
    return () => cancelAnimation(glowOpacity);
  }, [atX10, reduced]); // eslint-disable-line react-hooks/exhaustive-deps

  // Haptic celebration on threshold crossing (x5 and x10)
  useEffect(() => {
    if (streak === 5 || streak === 10) {
      celebration();
    }
  }, [streak]);

  const pillStyle = useAnimatedStyle(() => ({
    transform: [{ scale: entryScale.value * pulseScale.value }],
    opacity: entryOpacity.value,
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  if (streak < 3) return null;

  const comboLabel = getComboLabel(streak);

  return (
    <>
      {!reduced && (
        <Animated.View
          style={[StyleSheet.absoluteFill, styles.edgeGlow, glowStyle]}
          pointerEvents="none"
        />
      )}
      <Animated.View style={[styles.pill, pillStyle]}>
        <Text variant="label" color="#FFFFFF" style={styles.text}>
          🔥 x{streak}
        </Text>
        {comboLabel && (
          <Text variant="label" color="#FFFFFF" style={styles.label}>
            {comboLabel}
          </Text>
        )}
      </Animated.View>
    </>
  );
}

function getComboLabel(streak: number): string | null {
  if (streak < 3) return null;
  return `${streak} in a row!`;
}

const styles = StyleSheet.create({
  pill: {
    backgroundColor: colors.primary,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: spacing.sm,
  },
  text: {
    fontWeight: 'bold',
  },
  label: {
    fontWeight: 'bold',
  },
  edgeGlow: {
    borderWidth: 3,
    borderColor: colors.primary,
    borderRadius: 0,
    zIndex: 5,
  },
});
