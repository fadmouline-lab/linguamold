import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { colors, spacing } from '@/components/ui/theme';

export interface HeartDisplayProps {
  hearts: number;
  max?: number;
}

export function HeartDisplay({ hearts, max = 5 }: HeartDisplayProps) {
  return (
    <View style={styles.row} accessibilityLabel={`${hearts} vies sur ${max}`} accessibilityRole="text">
      {Array.from({ length: max }).map((_, i) => (
        <Ionicons
          key={i}
          name={i < hearts ? 'heart' : 'heart-outline'}
          size={22}
          color={i < hearts ? colors.error : colors.textSecondary}
          style={styles.icon}
        />
      ))}
      <Text variant="caption" style={styles.caption}>
        {hearts}/{max}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  icon: { marginRight: 2 },
  caption: { marginLeft: spacing.sm, color: colors.textSecondary },
});
