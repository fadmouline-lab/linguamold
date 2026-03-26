import { type ReactNode } from 'react';
import { StyleSheet, View, type ViewProps } from 'react-native';

import { colors, radii, shadows, spacing } from '@/components/ui/theme';

export interface CardProps extends ViewProps {
  children: ReactNode;
  padded?: boolean;
}

export function Card({ children, style, padded = true, ...rest }: CardProps) {
  return (
    <View
      {...rest}
      style={[styles.card, padded && styles.padded, shadows.card, style]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  padded: {
    padding: spacing.lg,
  },
});
