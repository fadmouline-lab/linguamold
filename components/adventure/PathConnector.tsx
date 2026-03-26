import { StyleSheet, View } from 'react-native';

import { colors, spacing } from '@/components/ui/theme';

export interface PathConnectorProps {
  completed?: boolean;
}

export function PathConnector({ completed }: PathConnectorProps) {
  return (
    <View
      style={[
        styles.line,
        { backgroundColor: completed ? colors.primary : colors.border },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  line: {
    width: 4,
    height: spacing.xxxl,
    alignSelf: 'center',
    borderRadius: 2,
    marginVertical: spacing.xs,
  },
});
