import { useCallback } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
} from 'react-native-reanimated';

import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { colors, spacing } from '@/components/ui/theme';
import { useAnimatedMount } from '@/hooks/useAnimatedMount';
import { useUIString } from '@/hooks/useUIString';
import { SPRING } from '@/lib/motion';

interface HintButtonProps {
  onHint: () => void;
  disabled?: boolean;
  hintsUsed: number;
  maxHints?: number;
}

export function HintButton({ onHint, disabled, hintsUsed, maxHints = 3 }: HintButtonProps) {
  const { t } = useUIString();
  const mountStyle = useAnimatedMount({ translateY: 10 });
  const isExhausted = hintsUsed >= maxHints;

  // "-2 XP" indicator: spring scale pop (0→1→0)
  const penaltyScale = useSharedValue(0);

  const handlePress = useCallback(() => {
    onHint();
    cancelAnimation(penaltyScale);
    penaltyScale.value = 0;
    penaltyScale.value = withSequence(
      withSpring(1, SPRING.celebration),
      withDelay(800, withSpring(0, { damping: 15, stiffness: 300 })),
    );
  }, [onHint, penaltyScale]);

  const penaltyStyle = useAnimatedStyle(() => ({
    transform: [{ scale: penaltyScale.value }],
  }));

  return (
    <Animated.View style={[styles.container, mountStyle]}>
      <Button
        title={t('exercise.hint')}
        variant="outline"
        onPress={handlePress}
        disabled={disabled || isExhausted}
        style={styles.button}
      />
      <Animated.View style={[styles.penaltyContainer, penaltyStyle]}>
        <Text variant="label" color={colors.error}>
          -2 XP
        </Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    position: 'relative',
  },
  button: {
    borderBottomWidth: 0,
    minWidth: 72,
  },
  penaltyContainer: {
    position: 'absolute',
    top: -spacing.xl,
    alignSelf: 'center',
  },
});
