import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { colors, spacing } from '@/components/ui/theme';
import { APP_STRINGS_FALLBACK } from '@/lib/app-strings-fallback';

export interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
}

export function ErrorState({
  message,
  onRetry,
  retryLabel = APP_STRINGS_FALLBACK['common.try_again'],
}: ErrorStateProps) {
  return (
    <View style={styles.wrap}>
      <Text variant="h3" style={styles.title}>
        {message}
      </Text>
      {onRetry ? (
        <Button title={retryLabel} onPress={onRetry} variant="secondary" />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 12,
  },
  title: { color: colors.error, textAlign: 'center' },
});
