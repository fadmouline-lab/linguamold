import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

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
  titleKey: string;
  descKey: string;
  level: number;
};

const LEVELS: LevelCard[] = [
  {
    key: '0',
    titleKey: 'onboarding.level_beginner_0',
    descKey: 'onboarding.level_beginner_0_desc',
    level: 0,
  },
  {
    key: '1',
    titleKey: 'onboarding.level_beginner_1',
    descKey: 'onboarding.level_beginner_1_desc',
    level: 1,
  },
  {
    key: '3',
    titleKey: 'onboarding.level_intermediate',
    descKey: 'onboarding.level_intermediate_desc',
    level: 3,
  },
  {
    key: '4',
    titleKey: 'onboarding.level_advanced',
    descKey: 'onboarding.level_advanced_desc',
    level: 4,
  },
];

export default function ProficiencyScreen() {
  const { t } = useUIString();
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);

  const onSelect = useCallback(
    async (level: number) => {
      if (!user?.id) return;
      setSaving(true);
      try {
        await supabase
          .from('user_profiles')
          .update({
            proficiency_level: level,
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id);
        await AsyncStorage.setItem(PROF_KEY, '1');
        if (level > 0) {
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

  return (
    <ScreenContainer>
      <Text variant="h1" style={styles.title}>
        {t('onboarding.proficiency_title')}
      </Text>
      <Text variant="caption" style={styles.sub}>
        {t('onboarding.proficiency_sub')}
      </Text>
      <View style={styles.list}>
        {LEVELS.map((item) => (
          <Pressable
            key={item.key}
            disabled={saving}
            onPress={() => void onSelect(item.level)}
          >
            <Card style={styles.card}>
              <Text variant="h3">{t(item.titleKey)}</Text>
              <Text variant="body" style={styles.desc}>
                {t(item.descKey)}
              </Text>
            </Card>
          </Pressable>
        ))}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { marginTop: spacing.lg, marginBottom: spacing.sm },
  sub: { marginBottom: spacing.lg, color: colors.textSecondary },
  list: { gap: spacing.md },
  card: { marginBottom: spacing.sm },
  desc: { marginTop: spacing.sm, color: colors.textSecondary },
});
