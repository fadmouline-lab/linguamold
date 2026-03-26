import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { colors, radii, spacing } from '@/components/ui/theme';

export interface ProgressBarProps {
  current: number;
  total: number;
}

export function ProgressBar({ current, total }: ProgressBarProps) {
  const pct = useSharedValue(0);
  useEffect(() => {
    const t = total > 0 ? (current + 1) / total : 0;
    pct.value = withTiming(Math.min(1, t), { duration: 300 });
  }, [current, pct, total]);

  const fill = useAnimatedStyle(() => ({
    width: `${pct.value * 100}%`,
  }));

  return (
    <View style={styles.track}>
      <Animated.View style={[styles.fill, fill]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: spacing.sm,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceLight,
    overflow: 'hidden',
    marginVertical: spacing.sm,
  },
  fill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: radii.pill,
  },
});
