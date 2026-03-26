import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { colors, radii, spacing } from '@/components/ui/theme';

export interface LeaderboardRowProps {
  rank: number;
  name: string;
  xp: number;
  highlight?: boolean;
}

export function LeaderboardRow({ rank, name, xp, highlight }: LeaderboardRowProps) {
  const accent =
    rank === 1 ? colors.accent : rank === 2 ? '#C0C0C0' : rank === 3 ? '#CD7F32' : colors.border;
  return (
    <View style={[styles.row, highlight && styles.hl]}>
      <Text variant="bodyBold" style={{ color: accent, width: 32 }}>
        #{rank}
      </Text>
      <Text variant="body" style={styles.name}>
        {name}
      </Text>
      <Text variant="bodyBold">{xp} XP</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
    backgroundColor: colors.surface,
  },
  hl: { borderColor: colors.primary, backgroundColor: colors.surfaceLight },
  name: { flex: 1, marginHorizontal: spacing.sm },
});
