import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated, { SlideInUp, SlideOutUp } from 'react-native-reanimated';

import { Text } from '@/components/ui/Text';
import { colors, radii, spacing } from '@/components/ui/theme';
import { useGamificationStore } from '@/stores/gamificationStore';

export function ToastQueue() {
  const queue = useGamificationStore((s) => s.toastQueue);
  const shiftToast = useGamificationStore((s) => s.shiftToast);
  const [current, setCurrent] = useState<{
    id: string;
    title: string;
    emoji?: string;
  } | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!current && queue.length > 0) {
      setCurrent(queue[0]!);
    }
  }, [current, queue]);

  useEffect(() => {
    if (!current) return;
    timerRef.current = setTimeout(() => {
      dismiss();
    }, 4000);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current?.id]);

  const dismiss = () => {
    setCurrent(null);
    shiftToast();
  };

  if (!current) return null;

  return (
    <Animated.View
      entering={SlideInUp.duration(300)}
      exiting={SlideOutUp.duration(200)}
      style={styles.container}
    >
      <Pressable style={styles.toast} onPress={dismiss}>
        <Text variant="bodyBold" style={styles.text}>
          {current.emoji ? `${current.emoji} ` : ''}
          {current.title}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: spacing.lg,
    right: spacing.lg,
    zIndex: 9999,
  },
  toast: {
    backgroundColor: colors.accent,
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  text: {
    color: '#1a1a1a',
    textAlign: 'center',
  },
});
