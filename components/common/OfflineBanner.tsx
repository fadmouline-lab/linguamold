import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { colors, spacing } from '@/components/ui/theme';

export interface OfflineBannerProps {
  visible: boolean;
  message: string;
}

export function OfflineBanner({ visible, message }: OfflineBannerProps) {
  if (!visible) return null;
  return (
    <View style={styles.bar}>
      <Text variant="caption" style={styles.txt}>
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: colors.error,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  txt: { color: colors.textPrimary, textAlign: 'center' },
});
