import { router } from 'expo-router';
import { useCallback } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Text } from '@/components/ui/Text';
import { colors, spacing } from '@/components/ui/theme';
import { useAuth } from '@/hooks/useAuth';
import { useLanguagePair } from '@/hooks/useLanguagePair';
import { useUIString } from '@/hooks/useUIString';
import { supabase } from '@/lib/supabase';

export default function SelectLanguageScreen() {
  const { t } = useUIString();
  const { user } = useAuth();
  const { currentAL, availableLLs, setAL, setLL, persistPairToProfile, reload } =
    useLanguagePair();

  const pickLanguage = useCallback(
    async (llId: string) => {
      const target = availableLLs.find((l) => l.id === llId);
      if (!target || !currentAL) return;
      await setLL(target);
      await persistPairToProfile(currentAL.id, target.id);
      if (user?.id) {
        await supabase
          .from('user_profiles')
          .update({
            preferred_al: currentAL.id,
            preferred_ll: target.id,
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id);
      }
      await reload();
      router.replace('/(onboarding)/proficiency');
    },
    [availableLLs, currentAL, persistPairToProfile, reload, setLL, user?.id]
  );

  return (
    <ScreenContainer>
      <Text variant="h1" style={styles.title}>
        {t('onboarding.select_ll_title')}
      </Text>
      <Text variant="caption" style={styles.sub}>
        {t('onboarding.select_ll_sub')}
      </Text>
      <FlatList
        data={availableLLs}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text variant="body">{t('common.loading')}</Text>
        }
        renderItem={({ item }) => (
          <Pressable onPress={() => void pickLanguage(item.id)}>
            <Card style={styles.card}>
              <View style={styles.row}>
                <Text variant="h2">{item.flag_emoji ?? '🌐'}</Text>
                <View style={styles.meta}>
                  <Text variant="h3">{item.name_native}</Text>
                  <Text variant="caption">{item.name_english}</Text>
                </View>
              </View>
            </Card>
          </Pressable>
        )}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { marginTop: spacing.lg, marginBottom: spacing.sm },
  sub: { marginBottom: spacing.lg, color: colors.textSecondary },
  list: { gap: spacing.md, paddingBottom: spacing.huge },
  card: { marginBottom: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  meta: { flex: 1 },
});
