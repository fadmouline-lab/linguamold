import { router } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Text } from '@/components/ui/Text';
import { colors } from '@/components/ui/theme';
import { usePlacementTest } from '@/hooks/usePlacementTest';
import { useUIString } from '@/hooks/useUIString';

export default function PlacementTestScreen() {
  const { t } = useUIString();
  const { lessonId, loading } = usePlacementTest();

  useEffect(() => {
    if (loading) return;
    if (lessonId) {
      router.replace(`/lesson/${lessonId}?placement=1`);
    } else {
      router.replace('/(main)/home');
    }
  }, [lessonId, loading]);

  return (
    <ScreenContainer>
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} size="large" />
        <Text variant="body" style={styles.txt}>
          {t('common.loading')}
        </Text>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  txt: { color: colors.textSecondary },
});
