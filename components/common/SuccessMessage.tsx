import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { Text } from '@/components/ui/Text';
import { colors, radii, spacing } from '@/components/ui/theme';

export interface SuccessMessageProps {
  message: string;
  detail?: string | null;
  visible: boolean;
  context?: 'standard' | 'combo' | 'recovery';
}

export function SuccessMessage({ message, detail, visible }: SuccessMessageProps) {
  const scale = useSharedValue(1);

  useEffect(() => {
    if (visible) {
      scale.value = withSequence(
        withTiming(1.05, { duration: 150 }),
        withTiming(1, { duration: 150 })
      );
    }
  }, [visible, scale]);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  if (!visible) return null;

  return (
    <Animated.View style={[styles.box, style]}>
      <Text variant="bodyBold" style={styles.text}>
        {message}
      </Text>
      {detail ? (
        <Text variant="body" style={styles.detail}>
          {detail}
        </Text>
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  box: {
    backgroundColor: colors.correctGlow,
    borderRadius: radii.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.primary,
    marginVertical: spacing.sm,
    gap: spacing.xs,
  },
  text: { color: colors.primary },
  detail: { color: colors.primary, opacity: 0.85 },
});
