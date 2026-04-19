import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { colors, spacing } from '@/components/ui/theme';

export interface EmptyStateProps {
  message: string;
  emoji?: string;
  subtitle?: string;
}

export function EmptyState({ message, emoji, subtitle }: EmptyStateProps) {
  return (
    <View style={styles.wrap}>
      {emoji ? <Text style={styles.emoji}>{emoji}</Text> : null}
      <Text variant="body" style={styles.txt}>
        {message}
      </Text>
      {subtitle ? (
        <Text variant="caption" style={styles.sub}>
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: spacing.xl, alignItems: 'center' },
  txt: { color: colors.textSecondary, textAlign: 'center' },
  emoji: { fontSize: 40, marginBottom: spacing.sm },
  sub: { color: colors.textSecondary, textAlign: 'center' as const, marginTop: spacing.xs },
});
