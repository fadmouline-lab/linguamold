import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { colors, radii, spacing } from '@/components/ui/theme';

export interface SkeletonLoaderProps {
  height?: number;
  width?: number | string;
}

export function SkeletonLoader({ height = 16, width = '100%' }: SkeletonLoaderProps) {
  const o = useSharedValue(0.4);
  useEffect(() => {
    o.value = withRepeat(
      withSequence(withTiming(1, { duration: 700 }), withTiming(0.4, { duration: 700 })),
      -1,
      false
    );
  }, [o]);
  const style = useAnimatedStyle(() => ({ opacity: o.value }));
  return (
    <Animated.View
      style={[
        styles.box,
        { height, width: width as number | `${number}%` },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  box: {
    borderRadius: radii.sm,
    backgroundColor: colors.surfaceLight,
    marginBottom: spacing.sm,
  },
});
