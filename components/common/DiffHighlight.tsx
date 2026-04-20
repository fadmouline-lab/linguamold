import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { colors } from '@/components/ui/theme';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { charDiff, type DiffSegment } from '@/lib/char-diff';
import { TIMING } from '@/lib/motion';

interface AnimatedSegmentProps {
  text: string;
  type: DiffSegment['type'];
  staggerIndex: number;
}

function AnimatedSegment({ text, type, staggerIndex }: AnimatedSegmentProps) {
  const reduced = useReducedMotion();
  const opacity = useSharedValue(type === 'wrong' ? 0 : 1);

  useEffect(() => {
    if (type !== 'wrong') return;
    if (reduced) {
      opacity.value = 1;
      return;
    }
    const delay = staggerIndex * 50;
    opacity.value = withDelay(
      delay,
      withSequence(
        withTiming(1,   { duration: 150 }),
        withDelay(150, withTiming(0.7, { duration: 150 })),
      ),
    );
    return () => cancelAnimation(opacity);
  }, [type, staggerIndex, reduced, opacity]);

  const animStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  const textColor =
    type === 'match'   ? colors.success :
    type === 'wrong'   ? colors.error   :
    /* missing */        colors.error;

  return (
    <Animated.Text style={[styles.segment, animStyle, { color: textColor }]}>
      {text}
    </Animated.Text>
  );
}

interface DiffHighlightProps {
  userText: string;
  correctText: string;
}

export function DiffHighlight({ userText, correctText }: DiffHighlightProps) {
  const segments = charDiff(userText, correctText);
  let wrongIndex = 0;

  return (
    <View style={styles.row}>
      {segments.map((seg, i) => {
        const staggerIndex = seg.type === 'wrong' ? wrongIndex++ : 0;
        return (
          <AnimatedSegment
            key={i}
            text={seg.text}
            type={seg.type}
            staggerIndex={staggerIndex}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 0,
  },
  segment: {
    fontSize: 16,
    fontWeight: '600',
  },
});
