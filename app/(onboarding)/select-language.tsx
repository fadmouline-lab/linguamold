import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';

import { SkeletonLoader } from '@/components/common/SkeletonLoader';

import { Button } from '@/components/ui/Button';
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
  const { currentAL, availableLLs, setLL, persistPairToProfile, reload } =
    useLanguagePair();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const confirmSelection = useCallback(async () => {
    if (!selectedId || !currentAL) return;
    const target = availableLLs.find((l) => l.id === selectedId);
    if (!target) return;
    setSaving(true);
    try {
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
    } finally {
      setSaving(false);
    }
  }, [selectedId, currentAL, availableLLs, setLL, persistPairToProfile, user?.id, reload]);

  return (
    <ScreenContainer>
      <Pressable
        onPress={() => router.back()}
        accessibilityRole="button"
        accessibilityLabel="Retour"
        style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm }}
      >
        <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
      </Pressable>
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
          <View style={{ gap: spacing.md }}>
            <SkeletonLoader height={72} />
            <SkeletonLoader height={72} />
            <SkeletonLoader height={72} />
          </View>
        }
        renderItem={({ item }) => {
          const isSelected = selectedId === item.id;
          return (
            <Pressable onPress={() => setSelectedId(item.id)}>
              <Card style={[styles.card, isSelected ? styles.cardSelected : null]}>
                <View style={styles.row}>
                  <Text variant="h2">{item.flag_emoji ?? '🌐'}</Text>
                  <View style={styles.meta}>
                    <Text variant="h3">{item.name_native}</Text>
                    <Text variant="caption">{item.name_english}</Text>
                  </View>
                  {isSelected ? (
                    <Text style={styles.check}>✓</Text>
                  ) : null}
                </View>
              </Card>
            </Pressable>
          );
        }}
      />
      <Button
        title={t('common.continue')}
        onPress={() => void confirmSelection()}
        loading={saving}
        disabled={!selectedId}
        style={selectedId ? undefined : styles.btnDisabled}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { marginTop: spacing.lg, marginBottom: spacing.sm },
  sub: { marginBottom: spacing.lg, color: colors.textSecondary },
  list: { gap: spacing.md, paddingBottom: spacing.huge },
  card: { marginBottom: spacing.sm },
  cardSelected: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  meta: { flex: 1 },
  check: { color: colors.primary, fontSize: 20, fontWeight: '700' },
  btnDisabled: { opacity: 0.4 },
});
