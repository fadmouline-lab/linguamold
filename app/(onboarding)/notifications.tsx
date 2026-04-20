import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Text } from '@/components/ui/Text';
import { colors, spacing } from '@/components/ui/theme';
import { useUIString } from '@/hooks/useUIString';

export default function NotificationsScreen() {
  const router = useRouter();
  const { t } = useUIString();

  const handleEnable = async () => {
    await Notifications.requestPermissionsAsync();
    router.replace('/(main)/home');
  };

  const handleSkip = () => {
    router.replace('/(main)/home');
  };

  return (
    <ScreenContainer>
      <View style={styles.content}>
        <Text style={styles.bellEmoji}>🔔</Text>
        <Text variant="h1" style={styles.title}>
          {t('onboarding.notifications_title')}
        </Text>
        <Text variant="body" color={colors.textSecondary} style={styles.subtitle}>
          {t('onboarding.notifications_sub')}
        </Text>
      </View>

      <View style={styles.footer}>
        <Button
          title={t('onboarding.notifications_enable') || 'Enable Notifications'}
          variant="primary"
          onPress={handleEnable}
        />
        <Button
          title={t('onboarding.notifications_skip') || 'Skip for now'}
          variant="ghost"
          onPress={handleSkip}
          style={styles.skipButton}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  bellEmoji: {
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
  skipButton: {
    marginTop: spacing.sm,
  },
});
