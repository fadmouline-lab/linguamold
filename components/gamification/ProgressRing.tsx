import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { colors } from '@/components/ui/theme';

export interface ProgressRingProps {
  size?: number;
  progress: number;
  label?: string;
}

export function ProgressRing({
  size = 72,
  progress,
  label,
}: ProgressRingProps) {
  const pct = Math.max(0, Math.min(1, progress));
  return (
    <View
      style={[
        styles.ring,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderColor: colors.primary,
          borderWidth: 4,
          opacity: 0.5 + pct * 0.5,
        },
      ]}
    >
      <View style={styles.inner}>
        <Text variant="caption">{label ?? `${Math.round(pct * 100)}%`}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  ring: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  inner: { alignItems: 'center', justifyContent: 'center' },
});
