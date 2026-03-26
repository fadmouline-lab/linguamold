import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { colors, spacing } from '@/components/ui/theme';
import { useGamificationStore } from '@/stores/gamificationStore';

export function StreakBadge() {
  const streak = useGamificationStore((s) => s.currentStreak);

  return (
    <Pressable style={styles.wrap}>
      <Text variant="bodyBold">
        🔥 {streak}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
    backgroundColor: colors.surfaceLight,
  },
});
