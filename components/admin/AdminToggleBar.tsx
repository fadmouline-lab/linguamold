import { StyleSheet, Switch, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { colors, spacing } from '@/components/ui/theme';
import { useAdminStore } from '@/stores/adminStore';

export function AdminToggleBar() {
  const { selectedAL, selectedLL, isAdminMode, setAdminMode } = useAdminStore();

  return (
    <View style={styles.bar}>
      <Text variant="caption" style={styles.txt}>
        [ADMIN] {selectedAL?.flag_emoji ?? ''} → {selectedLL?.flag_emoji ?? ''}
      </Text>
      <Switch
        value={isAdminMode}
        onValueChange={(v) => setAdminMode(v)}
        thumbColor={colors.textPrimary}
        trackColor={{ false: colors.border, true: colors.primary }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: colors.adminBar,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  txt: { color: colors.background, flex: 1 },
});
