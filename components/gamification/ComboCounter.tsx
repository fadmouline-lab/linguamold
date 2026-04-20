import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { colors, spacing, radii } from '@/components/ui/theme';
import { useUIString } from '@/hooks/useUIString';

// TODO(motion): combo counter pulse at x5, screen edge glow at x10

interface ComboCounterProps {
  streak: number;
}

export function ComboCounter({ streak }: ComboCounterProps) {
  const { t } = useUIString();

  if (streak < 3) return null;

  const comboLabel = getComboLabel(streak, t);

  return (
    <View style={styles.pill}>
      <Text variant="label" color="#FFFFFF" style={styles.text}>
        🔥 x{streak}
      </Text>
      {comboLabel && (
        <Text variant="label" color="#FFFFFF" style={styles.label}>
          {comboLabel}
        </Text>
      )}
    </View>
  );
}

function getComboLabel(
  streak: number,
  t: (key: string, vars?: Record<string, string | number>) => string
): string | null {
  if (streak >= 10) return t('gamify.combo_10');
  if (streak >= 5) return t('gamify.combo_5');
  if (streak >= 3) return t('gamify.combo_3');
  return null;
}

const styles = StyleSheet.create({
  pill: {
    backgroundColor: colors.primary,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: spacing.sm,
  },
  text: {
    fontWeight: 'bold',
  },
  label: {
    fontWeight: 'bold',
  },
});
