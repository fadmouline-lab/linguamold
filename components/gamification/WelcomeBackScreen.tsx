import { Pressable, StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { colors, radii, spacing } from '@/components/ui/theme';
import { useUIString } from '@/hooks/useUIString';

// TODO(motion): welcome back card slide-in animation

export interface WelcomeBackScreenProps {
  dayCount: number;
  wordsLearned: number;
  onContinue: () => void;
  onDismiss: () => void;
}

export function WelcomeBackScreen({
  dayCount,
  wordsLearned,
  onContinue,
  onDismiss,
}: WelcomeBackScreenProps) {
  const { t } = useUIString();

  const getTitle = () => {
    switch (dayCount) {
      case 2:
        return t('onboarding.day2');
      case 3:
        return t('onboarding.day3');
      case 5:
        return t('onboarding.day5');
      default:
        return t('onboarding.day2');
    }
  };

  return (
    <View style={styles.container}>
      <Pressable
        onPress={onDismiss}
        style={styles.dismissButton}
        accessibilityLabel="Dismiss"
        accessibilityRole="button"
      >
        <Text variant="h3" color={colors.textSecondary}>
          ✕
        </Text>
      </Pressable>

      <View style={styles.content}>
        <Text style={styles.emoji}>🎉</Text>
        <Text variant="h1" style={styles.title}>
          {getTitle()}
        </Text>
        <Text variant="body" color={colors.textSecondary} style={styles.subtitle}>
          {t('onboarding.welcome_back_sub', { count: wordsLearned })}
        </Text>
      </View>

      <View style={styles.footer}>
        <Button
          title={t('onboarding.welcome_back_cta') || 'Continue Learning'}
          variant="primary"
          onPress={onContinue}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xxl,
  },
  dismissButton: {
    position: 'absolute',
    top: spacing.lg,
    right: spacing.lg,
    width: 40,
    height: 40,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 64,
    marginBottom: spacing.xxl,
  },
  title: {
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  subtitle: {
    textAlign: 'center',
  },
  footer: {
    paddingVertical: spacing.lg,
  },
});
