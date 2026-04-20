import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { Text } from '@/components/ui/Text';
import { colors, radii, spacing } from '@/components/ui/theme';

export interface ErrorMessageProps {
  message: string;
  detail?: string | null;
  visible: boolean;
}

export function ErrorMessage({ message, detail, visible }: ErrorMessageProps) {
  const tx = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      tx.value = withRepeat(
        withSequence(
          withTiming(-6, { duration: 40 }),
          withTiming(6, { duration: 40 }),
          withTiming(-6, { duration: 40 }),
          withTiming(0, { duration: 40 })
        ),
        1,
        false
      );
    }
  }, [visible, tx]);

  const anim = useAnimatedStyle(() => ({
    transform: [{ translateX: tx.value }],
  }));

  if (!visible) return null;

  return (
    <Animated.View style={[styles.box, anim]}>
      <Text variant="caption" style={styles.headline}>
        {message}
      </Text>
      {detail ? (
        <Text variant="body" style={styles.explanation}>
          {detail}
        </Text>
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  box: {
    backgroundColor: colors.errorGlow,
    borderRadius: radii.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.error,
    marginVertical: spacing.sm,
    gap: spacing.xs,
  },
  headline: { color: colors.error, opacity: 0.85 },
  explanation: { color: colors.textPrimary },
});
