import { useEffect } from 'react';
import {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { SPRING, TIMING } from '@/lib/motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface AnimatedMountOptions {
  translateY?: number;
  delay?: number;
}

export function useAnimatedMount({ translateY = 20, delay = 0 }: AnimatedMountOptions = {}) {
  const reduced = useReducedMotion();
  const opacity = useSharedValue(0);
  const translate = useSharedValue(reduced ? 0 : translateY);

  useEffect(() => {
    if (reduced) {
      opacity.value = withTiming(1, { duration: TIMING.instant });
      translate.value = 0;
      return;
    }
    opacity.value = withDelay(delay, withTiming(1, { duration: TIMING.fast }));
    translate.value = withDelay(delay, withSpring(0, SPRING.card));

    return () => {
      cancelAnimation(opacity);
      cancelAnimation(translate);
    };
  }, [delay, opacity, reduced, translate]);

  return useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translate.value }],
  }));
}
