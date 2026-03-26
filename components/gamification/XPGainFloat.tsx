import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { Text } from '@/components/ui/Text';
import { colors } from '@/components/ui/theme';

export interface XPGainFloatProps {
  amount: number;
  visible: boolean;
}

export function XPGainFloat({ amount, visible }: XPGainFloatProps) {
  const y = useSharedValue(0);
  const o = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      y.value = 0;
      o.value = 1;
      y.value = withTiming(-48, { duration: 900 });
      o.value = withTiming(0, { duration: 900 });
    }
  }, [visible, o, y]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: y.value }],
    opacity: o.value,
  }));

  if (!visible) return null;

  return (
    <Animated.View style={[styles.wrap, style]} pointerEvents="none">
      <Text variant="h3" style={styles.txt}>
        +{amount} XP
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    right: 24,
    bottom: 120,
  },
  txt: { color: colors.accent },
});
