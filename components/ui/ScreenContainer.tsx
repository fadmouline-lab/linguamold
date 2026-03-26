import { type ReactNode } from 'react';
import { StyleSheet, View, type ViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, spacing } from '@/components/ui/theme';

export interface ScreenContainerProps extends ViewProps {
  children: ReactNode;
  edges?: ('top' | 'right' | 'bottom' | 'left')[];
}

export function ScreenContainer({
  children,
  style,
  edges = ['top', 'right', 'bottom', 'left'],
  ...rest
}: ScreenContainerProps) {
  return (
    <SafeAreaView
      {...rest}
      edges={edges}
      style={[styles.safe, style]}
    >
      <View style={styles.flex}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
});
