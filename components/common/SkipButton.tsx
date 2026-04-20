import { View, StyleSheet } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { colors, spacing } from '@/components/ui/theme';
import { useUIString } from '@/hooks/useUIString';

interface SkipButtonProps {
  onSkip: () => void;
  disabled?: boolean;
  skipCount: number;
}

export function SkipButton({ onSkip, disabled, skipCount }: SkipButtonProps) {
  const { t } = useUIString();

  return (
    <View style={styles.container}>
      <Button
        title={t('exercise.i_dont_know')}
        variant="ghost"
        onPress={onSkip}
        disabled={disabled}
        haptic={false}
        style={styles.button}
      />
      {skipCount >= 2 && (
        <Text variant="caption" color={colors.textSecondary} style={styles.costLabel}>
          {t('exercise.skip_cost')}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  button: {
    borderBottomWidth: 0,
  },
  costLabel: {
    marginTop: spacing.xs,
  },
});
