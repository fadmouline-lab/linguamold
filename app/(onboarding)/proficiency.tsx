import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Text } from '@/components/ui/Text';
import { colors, spacing } from '@/components/ui/theme';
import { useAuth } from '@/hooks/useAuth';
import { useUIString } from '@/hooks/useUIString';
import { supabase } from '@/lib/supabase';

const PROF_KEY = 'linguamold.proficiency_onboarded';

type LevelCard = {
  key: string;
  emoji: string;
  titleKey: string;
  descKey: string;
  level: number;
};

const LEVELS: LevelCard[] = [
  {
    key: '0',
    emoji: '🌱',
    titleKey: 'onboarding.level_beginner_0',
    descKey: 'onboarding.level_beginner_0_desc',
    level: 0,
  },
  {
    key: '1',
    emoji: '📖',
    titleKey: 'onboarding.level_beginner_1',
    descKey: 'onboarding.level_beginner_1_desc',
    level: 1,
  },
  {
    key: '3',
    emoji: '🎯',
    titleKey: 'onboarding.level_intermediate',
    descKey: 'onboarding.level_intermediate_desc',
    level: 3,
  },
  {
    key: '4',
    emoji: '🚀',
    titleKey: 'onboarding.level_advanced',
    descKey: 'onboarding.level_advanced_desc',
    level: 4,
  },
];

export default function ProficiencyScreen() {
  const { t } = useUIString();
  const { user } = useAuth();
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const onSelect = useCallback(
    async (item: LevelCard) => {
      if (!user?.id) return;
      setSaving(true);
      try {
        await supabase
          .from('user_profiles')
          .update({
            proficiency_level: item.level,
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id);
        await AsyncStorage.setItem(PROF_KEY, '1');
        if (item.level > 0) {
          router.replace('/(onboarding)/placement-test');
          return;
        }
        router.replace('/(main)/home');
      } finally {
        setSaving(false);
      }
    },
    [user?.id]
  );

  const selectedItem = LEVELS.find((l) => l.key === selectedKey);

  return (
    <ScreenContainer>
      <Pressable
        onPress={() => router.replace('/(onboarding)/select-language')}
        accessibilityRole="button"
        accessibilityLabel="Retour"
        style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm }}
      >
        <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
      </Pressable>
      <Text variant="h1" style={styles.title}>
        {t('onboarding.proficiency_title')}
      </Text>
      <Text variant="caption" style={styles.sub}>
        {t('onboarding.proficiency_sub')}
      </Text>
      <View style={styles.list}>
        {LEVELS.map((item) => {
          const isSelected = selectedKey === item.key;
          return (
            <Pressable
              key={item.key}
              disabled={saving}
              onPress={() => setSelectedKey(item.key)}
            >
              <Card style={[styles.card, isSelected ? styles.cardSelected : null]}>
                <View style={styles.row}>
                  <Text style={styles.emoji}>{item.emoji}</Text>
                  <View style={styles.meta}>
                    <Text variant="h3">{t(item.titleKey)}</Text>
                    <Text variant="body" style={styles.desc}>
                      {t(item.descKey)}
                    </Text>
                  </View>
                  {isSelected ? (
                    <Text style={styles.check}>✓</Text>
                  ) : null}
                </View>
              </Card>
            </Pressable>
          );
        })}
      </View>
      <Button
        title={t('common.continue')}
        onPress={() => selectedItem ? void onSelect(selectedItem) : undefined}
        loading={saving}
        disabled={!selectedKey}
        style={selectedKey ? undefined : styles.btnDisabled}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { marginTop: spacing.lg, marginBottom: spacing.sm },
  sub: { marginBottom: spacing.lg, color: colors.textSecondary },
  list: { gap: spacing.md, marginBottom: spacing.xl },
  card: { marginBottom: spacing.sm },
  cardSelected: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  emoji: { fontSize: 28 },
  meta: { flex: 1 },
  desc: { marginTop: spacing.xs, color: colors.textSecondary },
  check: { color: colors.primary, fontSize: 20, fontWeight: '700' },
  btnDisabled: { opacity: 0.4 },
});
