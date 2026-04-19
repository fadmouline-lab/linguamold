import { type ReactNode } from 'react';
import { StyleSheet, View, type ViewProps } from 'react-native';

import { colors, radii, shadows, spacing } from '@/components/ui/theme';

export type CardVariant = 'elevated' | 'flat' | 'outlined';

export interface CardProps extends ViewProps {
  children: ReactNode;
  padded?: boolean;
  variant?: CardVariant;
}

export function Card({ children, style, padded = true, variant = 'elevated', ...rest }: CardProps) {
  return (
    <View
      {...rest}
      style={[
        styles.base,
        padded && styles.padded,
        variant === 'elevated' && shadows.elevated,
        variant === 'outlined' && styles.outlined,
        variant === 'flat' && styles.flat,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
  },
  padded: {
    padding: spacing.lg,
  },
  elevated: {
    borderWidth: 1,
    borderColor: colors.border,
  },
  outlined: {
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: 'transparent',
  },
  flat: {
    backgroundColor: colors.surfaceLight,
  },
});
