import { Pressable, StyleSheet, View } from 'react-native';

import { ProgressRing } from '@/components/gamification/ProgressRing';
import { Text } from '@/components/ui/Text';
import { colors, radii, spacing } from '@/components/ui/theme';
import type { ModuleWithProgress } from '@/hooks/useModules';

export type NodeState = 'locked' | 'available' | 'in_progress' | 'completed';

export interface ModuleNodeProps {
  module: ModuleWithProgress;
  state: NodeState;
  onPress: () => void;
}

export function ModuleNode({ module, state, onPress }: ModuleNodeProps) {
  const pct =
    module.progress?.completion_pct != null
      ? Number(module.progress.completion_pct) / 100
      : 0;
  const label =
    module.icon_name?.[0]?.toUpperCase() ??
    module.title_al?.[0]?.toUpperCase() ??
    'M';

  return (
    <Pressable
      onPress={onPress}
      disabled={state === 'locked'}
      style={[
        styles.wrap,
        state === 'locked' && styles.locked,
        state === 'available' && styles.glow,
        state === 'in_progress' && styles.pulse,
        state === 'completed' && styles.done,
      ]}
    >
      <ProgressRing size={80} progress={pct} label={label} />
      <Text variant="h3" style={styles.title} numberOfLines={2}>
        {module.title_al}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginVertical: spacing.sm,
  },
  locked: { opacity: 0.45 },
  glow: {
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  pulse: { borderColor: colors.accent },
  done: { borderColor: colors.accent, backgroundColor: colors.surfaceLight },
  title: { marginTop: spacing.sm, textAlign: 'center' },
});
