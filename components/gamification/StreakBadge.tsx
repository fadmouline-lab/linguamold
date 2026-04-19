import { Pressable, StyleSheet } from 'react-native';

import { Text } from '@/components/ui/Text';
import { colors, fonts, radii, spacing } from '@/components/ui/theme';
import { useUIString } from '@/hooks/useUIString';
import { useGamificationStore } from '@/stores/gamificationStore';

export function StreakBadge() {
  const streak = useGamificationStore((s) => s.currentStreak);
  const { t } = useUIString();

  return (
    <Pressable
      style={styles.wrap}
      accessibilityLabel={t('gamify.streak_a11y_label', { count: streak })}
    >
      <Text variant="label" style={styles.text}>
        🔥 {streak}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.pill,
    backgroundColor: '#FEF2F2',
    borderWidth: 1.5,
    borderColor: '#FECACA',
  },
  text: {
    color: colors.error,
    fontFamily: fonts.display,
    fontSize: 15,
  },
});
