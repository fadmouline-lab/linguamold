import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { colors, spacing } from '@/components/ui/theme';
import { useUIString } from '@/hooks/useUIString';

// TODO(motion): number reveal animation, background gradient shift

export interface LevelUpScreenProps {
  level: number;
  onDismiss: () => void;
}

function getLevelDescriptorKey(level: number): string {
  if (level <= 3) return 'gamify.level_descriptor_beginner';
  if (level <= 7) return 'gamify.level_descriptor_intermediate';
  if (level <= 12) return 'gamify.level_descriptor_advanced';
  return 'gamify.level_descriptor_expert';
}

export function LevelUpScreen({ level, onDismiss }: LevelUpScreenProps) {
  const { t } = useUIString();

  return (
    <View style={styles.wrap}>
      <View style={styles.content}>
        <Text variant="display" style={styles.levelNumber}>
          {level}
        </Text>

        <Text variant="h1" style={styles.heading}>
          Level {level}!
        </Text>

        <Text variant="body" style={styles.descriptor}>
          {t(getLevelDescriptorKey(level))}
        </Text>

        <View style={styles.spacer} />

        <Button
          title={t('common.continue')}
          variant="primary"
          onPress={onDismiss}
          style={styles.button}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: spacing.xxxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelNumber: {
    fontSize: 72,
    lineHeight: 80,
    color: colors.primary,
    marginBottom: spacing.md,
  },
  heading: {
    textAlign: 'center',
    marginBottom: spacing.lg,
    color: colors.accent,
  },
  descriptor: {
    textAlign: 'center',
    color: colors.textSecondary,
  },
  spacer: {
    height: spacing.huge,
  },
  button: {
    width: '100%',
  },
});
