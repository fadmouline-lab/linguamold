import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { colors, spacing } from '@/components/ui/theme';

export interface ExerciseHeaderProps {
  moldLabel: string;
  prompt?: string;
}

export function ExerciseHeader({ moldLabel, prompt }: ExerciseHeaderProps) {
  return (
    <View style={styles.wrap}>
      <Text variant="caption" style={styles.label}>
        {moldLabel}
      </Text>
      {prompt ? (
        <Text variant="h3" style={styles.prompt}>
          {prompt}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.lg, gap: spacing.xs },
  label: { color: colors.textSecondary, textTransform: 'uppercase' },
  prompt: { color: colors.textPrimary },
});
