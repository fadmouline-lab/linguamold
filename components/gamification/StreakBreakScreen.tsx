import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { colors, spacing } from '@/components/ui/theme';
import { useUIString } from '@/hooks/useUIString';

// TODO(motion): flame extinguishing animation

export interface StreakBreakScreenProps {
  previousStreak: number;
  totalWordsLearned: number;
  onStartFresh: () => void;
  onVisitShop: () => void;
}

export function StreakBreakScreen({
  previousStreak,
  totalWordsLearned,
  onStartFresh,
  onVisitShop,
}: StreakBreakScreenProps) {
  const { t } = useUIString();

  const getMessaging = () => {
    if (previousStreak < 3) {
      return {
        emoji: '👋',
        title: t('gamify.streak_break_light_title') || 'Welcome back!',
        subtitle:
          t('gamify.streak_break_light_sub') ||
          'Start a fresh streak today.',
      };
    }

    if (previousStreak < 7) {
      return {
        emoji: '💪',
        title:
          t('gamify.streak_break_medium_title', { count: previousStreak }) ||
          `Your ${previousStreak}-day streak ended.`,
        subtitle:
          t('gamify.streak_break_medium_sub', { count: totalWordsLearned }) ||
          `That's okay — you've learned ${totalWordsLearned} words!`,
      };
    }

    return {
      emoji: '🔥',
      title:
        t('gamify.streak_break_long_title', { count: previousStreak }) ||
        `Your ${previousStreak}-day streak ended.`,
      subtitle:
        t('gamify.streak_break_long_sub', { count: totalWordsLearned }) ||
        `You learned ${totalWordsLearned} words along the way. That's incredible — let's get back on track!`,
    };
  };

  const messaging = getMessaging();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.emoji}>{messaging.emoji}</Text>
        <Text variant="h1" style={styles.title}>
          {messaging.title}
        </Text>
        <Text variant="body" color={colors.textSecondary} style={styles.subtitle}>
          {messaging.subtitle}
        </Text>
      </View>

      <View style={styles.footer}>
        <Button
          title={t('gamify.streak_start_fresh') || 'Start a new streak'}
          variant="primary"
          onPress={onStartFresh}
        />
        {previousStreak >= 7 && (
          <Button
            title={t('gamify.streak_get_freeze') || 'Get a Streak Freeze'}
            variant="secondary"
            onPress={onVisitShop}
            style={styles.secondaryButton}
          />
        )}
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
    paddingHorizontal: spacing.lg,
  },
  footer: {
    paddingVertical: spacing.lg,
  },
  secondaryButton: {
    marginTop: spacing.md,
  },
});
