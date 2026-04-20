import { useEffect, useState } from 'react';
import {
  cancelAnimation,
  runOnJS,
  useAnimatedReaction,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { TIMING } from '@/lib/motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';

export function useCountUp(
  target: number,
  duration = TIMING.slow,
  delay = 0,
): number {
  const reduced = useReducedMotion();
  const sv = useSharedValue(0);
  const [display, setDisplay] = useState(0);

  useAnimatedReaction(
    () => sv.value,
    (current) => runOnJS(setDisplay)(Math.round(current)),
  );

  useEffect(() => {
    if (reduced) {
      setDisplay(target);
      return;
    }
    sv.value = 0;
    sv.value = withDelay(delay, withTiming(target, { duration }));
    return () => cancelAnimation(sv);
  }, [target, duration, delay, reduced, sv]);

  return display;
}
