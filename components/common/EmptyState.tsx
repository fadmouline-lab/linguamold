import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { colors, spacing } from '@/components/ui/theme';

export interface EmptyStateProps {
  message: string;
}

export function EmptyState({ message }: EmptyStateProps) {
  return (
    <View style={styles.wrap}>
      <Text variant="body" style={styles.txt}>
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: spacing.xl, alignItems: 'center' },
  txt: { color: colors.textSecondary, textAlign: 'center' },
});
