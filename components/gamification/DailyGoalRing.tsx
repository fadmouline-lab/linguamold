import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { colors } from '@/components/ui/theme';

// TODO(motion): ring fill animation, goal completion celebration

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
  const size = compact ? COMPACT_SIZE : FULL_SIZE;
  const borderWidth = compact ? COMPACT_BORDER_WIDTH : BORDER_WIDTH;
  const progress = Math.min(currentMinutes / Math.max(goalMinutes, 1), 1);
  const goalReached = currentMinutes >= goalMinutes;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
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
      <View
        style={[
          styles.fill,
          {
            width: size * progress,
            height: size,
            borderRadius: size / 2,
            backgroundColor: colors.primaryLight,
          },
        ]}
      />
      {!compact && (
        <View style={styles.centerText}>
          <Text variant="micro">
            {currentMinutes}/{goalMinutes} min
          </Text>
        </View>
      )}
    </View>
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
