import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native';

import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Text } from '@/components/ui/Text';
import { Input } from '@/components/ui/Input';
import { colors, spacing } from '@/components/ui/theme';
import { useAuth } from '@/hooks/useAuth';
import { useGamificationStore } from '@/stores/gamificationStore';
import { useUIString } from '@/hooks/useUIString';
import { useXP } from '@/hooks/useXP';
import { supabase } from '@/lib/supabase';

export default function ProfileScreen() {
  const { t } = useUIString();
  const { user, signOut } = useAuth();
  const { getLevel } = useXP();
  const totalXP = useGamificationStore((s) => s.totalXP);
  const streak = useGamificationStore((s) => s.currentStreak);
  const [name, setName] = useState('');
  const [goal, setGoal] = useState(10);
  const [notif, setNotif] = useState(true);

  const load = useCallback(async () => {
    if (!user?.id) return;
    const { data } = await supabase
      .from('user_profiles')
      .select('display_name, daily_goal_minutes, notification_enabled')
      .eq('id', user.id)
      .maybeSingle();
    const row = data as {
      display_name: string | null;
      daily_goal_minutes: number;
      notification_enabled: boolean;
    } | null;
    if (row) {
      setName(row.display_name ?? '');
      setGoal(row.daily_goal_minutes);
      setNotif(row.notification_enabled);
    }
  }, [user?.id]);

  useEffect(() => {
    void load();
  }, [load]);

  const saveProfile = async () => {
    if (!user?.id) return;
    await supabase
      .from('user_profiles')
      .update({
        display_name: name,
        daily_goal_minutes: goal,
        notification_enabled: notif,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);
  };

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text variant="h1">{t('nav.profile')}</Text>
        <Input label={t('auth.display_name')} value={name} onChangeText={setName} onEndEditing={() => void saveProfile()} />
        <View style={styles.statGrid}>
          <View style={styles.stat}>
            <Text variant="caption">{t('gamify.xp')}</Text>
            <Text variant="h2">
              {totalXP} (Lv {getLevel()})
            </Text>
          </View>
          <View style={styles.stat}>
            <Text variant="caption">{t('gamify.streak')}</Text>
            <Text variant="h2">🔥 {streak}</Text>
          </View>
        </View>
        <Text variant="h3">{t('profile.settings')}</Text>
        <View style={styles.row}>
          <Text variant="body">{t('profile.notifications')}</Text>
          <Switch value={notif} onValueChange={(v) => { setNotif(v); void saveProfile(); }} />
        </View>
        <Text variant="caption">{t('profile.daily_goal')}</Text>
        <Input
          value={String(goal)}
          onChangeText={(v) => setGoal(Number(v) || 0)}
          keyboardType="number-pad"
          onEndEditing={() => void saveProfile()}
        />
        <Pressable onPress={() => router.push('/(main)/shop')} style={styles.link}>
          <Text variant="bodyBold" style={styles.linkTxt}>
            {t('shop.title')}
          </Text>
        </Pressable>
        <Pressable
          onPress={() => void signOut()}
          style={styles.logout}
        >
          <Text variant="bodyBold" style={styles.logoutTxt}>
            {t('profile.logout')}
          </Text>
        </Pressable>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: { gap: spacing.md, paddingBottom: 120 },
  statGrid: { flexDirection: 'row', gap: spacing.md },
  stat: {
    flex: 1,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  link: { marginTop: spacing.md },
  linkTxt: { color: colors.primary },
  logout: {
    marginTop: spacing.xxl,
    padding: spacing.md,
    backgroundColor: colors.error,
    borderRadius: 12,
    alignItems: 'center',
  },
  logoutTxt: { color: colors.textPrimary },
});
