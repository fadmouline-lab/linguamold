import { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { SlideInUp, SlideOutUp } from 'react-native-reanimated';

import { Text } from '@/components/ui/Text';
import { colors, radii, spacing } from '@/components/ui/theme';

export interface AchievementToastProps {
  visible: boolean;
  title: string;
  onDismiss: () => void;
}

export function AchievementToast({
  visible,
  title,
  onDismiss,
}: AchievementToastProps) {
  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(() => onDismiss(), 4000);
    return () => clearTimeout(t);
  }, [visible, onDismiss]);

  if (!visible) return null;

  return (
    <Animated.View entering={SlideInUp} exiting={SlideOutUp} style={styles.wrap}>
      <Pressable onPress={onDismiss} style={styles.inner}>
        <Text variant="h3" style={styles.title}>
          {title}
        </Text>
        <Text variant="caption">{trophy}</Text>
      </Pressable>
    </Animated.View>
  );
}

const trophy = '🏆';

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    top: 48,
    left: spacing.lg,
    right: spacing.lg,
    zIndex: 100,
  },
  inner: {
    backgroundColor: colors.accent,
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  title: { color: colors.background },
});
