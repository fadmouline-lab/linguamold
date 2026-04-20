import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { colors, radii, spacing } from '@/components/ui/theme';
import { useUIString } from '@/hooks/useUIString';

// TODO(motion): badge unlock animation, enhanced confetti

export interface ModuleCompleteScreenProps {
  moduleName: string;
  moduleEmoji: string;
  lessonsCompleted: number;
  accuracyPct: number;
  minutesSpent: number;
  xpEarned: number;
  nextModuleName?: string;
  nextModuleEmoji?: string;
  onContinue: () => void;
}

export function ModuleCompleteScreen({
  moduleName,
  moduleEmoji,
  lessonsCompleted,
  accuracyPct,
  minutesSpent,
  xpEarned,
  nextModuleName,
  nextModuleEmoji,
  onContinue,
}: ModuleCompleteScreenProps) {
  const { t } = useUIString();

  return (
    <View style={styles.wrap}>
      <View style={styles.content}>
        <Text style={styles.emoji}>{moduleEmoji}</Text>

        <Text variant="h1" style={styles.title}>
          {t('gamify.module_complete')}
        </Text>

        <Text variant="bodyBold" style={styles.moduleName}>
          {moduleName}
        </Text>

        <Text variant="caption" style={styles.stats}>
          {lessonsCompleted} lessons · {accuracyPct}% accuracy · {minutesSpent} min
        </Text>

        <Text variant="score" style={styles.xp}>
          +{xpEarned} XP
        </Text>

        {nextModuleName ? (
          <View style={styles.nextCard}>
            <Text variant="caption" style={styles.nextLabel}>
              {t('gamify.module_next')}
            </Text>
            <View style={styles.nextRow}>
              <Text style={styles.nextEmoji}>{nextModuleEmoji}</Text>
              <Text variant="bodyBold">{nextModuleName}</Text>
            </View>
          </View>
        ) : null}

        <View style={styles.spacer} />

        <Button
          title={t('gamify.module_continue')}
          variant="primary"
          onPress={onContinue}
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
  emoji: {
    fontSize: 48,
    marginBottom: spacing.lg,
  },
  title: {
    textAlign: 'center',
    marginBottom: spacing.sm,
    color: colors.accent,
  },
  moduleName: {
    textAlign: 'center',
    marginBottom: spacing.xl,
    color: colors.textSecondary,
  },
  stats: {
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  xp: {
    color: colors.accent,
    marginBottom: spacing.xxl,
  },
  nextCard: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  nextLabel: {
    marginBottom: spacing.sm,
  },
  nextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  nextEmoji: {
    fontSize: 24,
  },
  spacer: {
    height: spacing.xxxl,
  },
  button: {
    width: '100%',
  },
});
