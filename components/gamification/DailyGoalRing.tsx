import { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { Text } from '@/components/ui/Text';
import { colors } from '@/components/ui/theme';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { success } from '@/lib/haptics';
import { SPRING, TIMING } from '@/lib/motion';

interface DailyGoalRingProps {
  currentMinutes: number;
  goalMinutes: number;
  compact?: boolean;
}

const FULL_SIZE = 64;
const COMPACT_SIZE = 32;
const BORDER_WIDTH = 5;
const COMPACT_BORDER_WIDTH = 3;

export function DailyGoalRing({ currentMinutes, goalMinutes, compact = false }: DailyGoalRingProps) {
  const reduced = useReducedMotion();
  const size = compact ? COMPACT_SIZE : FULL_SIZE;
  const borderWidth = compact ? COMPACT_BORDER_WIDTH : BORDER_WIDTH;
  const progress = Math.min(currentMinutes / Math.max(goalMinutes, 1), 1);
  const goalReached = currentMinutes >= goalMinutes;

  // Animated fill width (0 → size * progress over 600ms)
  const fillWidth = useSharedValue(0);

  // Ring scale pulse on goal reached
  const ringScale = useSharedValue(1);

  // Track if we've already fired the goal celebration
  const celebratedRef = useRef(false);

  useEffect(() => {
    const targetWidth = size * progress;

    if (reduced) {
      fillWidth.value = targetWidth;
      return;
    }

    fillWidth.value = withTiming(targetWidth, { duration: TIMING.slow });

    return () => cancelAnimation(fillWidth);
  }, [size, progress, reduced, fillWidth]);

  useEffect(() => {
    if (!goalReached || reduced || celebratedRef.current) return;
    celebratedRef.current = true;

    ringScale.value = withSequence(
      withSpring(1.1, SPRING.celebration),
      withSpring(1.0, SPRING.card),
    );
    success();

    return () => cancelAnimation(ringScale);
  }, [goalReached, reduced, ringScale]);

  const fillStyle = useAnimatedStyle(() => ({ width: fillWidth.value }));
  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ringScale.value }],
  }));

  return (
    <Animated.View style={[styles.container, { width: size, height: size }, ringStyle]}>
      <View
        style={[
          styles.ring,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth,
            borderColor: goalReached ? colors.primary : colors.border,
          },
        ]}
      />
      <Animated.View
        style={[
          styles.fill,
          {
            height: size,
            borderRadius: size / 2,
            backgroundColor: colors.primaryLight,
          },
          fillStyle,
        ]}
      />
      {!compact && (
        <View style={styles.centerText}>
          <Text variant="micro">
            {currentMinutes}/{goalMinutes} min
          </Text>
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
  },
  fill: {
    position: 'absolute',
    left: 0,
    opacity: 0.3,
    overflow: 'hidden',
  },
  centerText: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
