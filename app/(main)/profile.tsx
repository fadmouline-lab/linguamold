import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native';

import { ConfirmDialog } from '@/components/common/ConfirmDialog';
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
  const [showLogout, setShowLogout] = useState(false);

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

  const initial = name ? name[0]?.toUpperCase() : user?.email?.[0]?.toUpperCase() ?? '?';

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
          <Text variant="h2" style={styles.displayName}>{name || t('nav.profile')}</Text>
          <Text variant="caption" style={styles.levelBadge}>Level {getLevel()}</Text>
        </View>

        <View style={styles.statGrid}>
          <View style={styles.stat}>
            <Text style={styles.statIcon}>⚡</Text>
            <Text variant="h2" style={styles.statValue}>{totalXP}</Text>
            <Text variant="caption" style={styles.statLabel}>{t('gamify.xp')}</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statIcon}>🔥</Text>
            <Text variant="h2" style={styles.statValue}>{streak}</Text>
            <Text variant="caption" style={styles.statLabel}>{t('gamify.streak')}</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statIcon}>📚</Text>
            <Text variant="h2" style={styles.statValue}>{getLevel()}</Text>
            <Text variant="caption" style={styles.statLabel}>{t('nav.profile')}</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statIcon}>🎯</Text>
            <Text variant="h2" style={styles.statValue}>{goal}</Text>
            <Text variant="caption" style={styles.statLabel}>{t('profile.daily_goal')}</Text>
          </View>
        </View>

        <Text variant="h3" style={styles.sectionTitle}>{t('profile.settings')}</Text>
        <Input label={t('auth.display_name')} value={name} onChangeText={setName} onEndEditing={() => void saveProfile()} />
        <View style={styles.settingRow}>
          <Text variant="body">{t('profile.notifications')}</Text>
          <Switch value={notif} onValueChange={(v) => { setNotif(v); void saveProfile(); }} />
        </View>
        <Input
          label={t('profile.daily_goal')}
          value={String(goal)}
          onChangeText={(v) => setGoal(Number(v) || 0)}
          keyboardType="number-pad"
          onEndEditing={() => void saveProfile()}
        />
        <Pressable onPress={() => router.push('/(main)/shop')} style={styles.settingRow}>
          <Text variant="bodyBold" style={styles.linkTxt}>{t('shop.title')}</Text>
          <Text style={styles.chevron}>›</Text>
        </Pressable>
        <Pressable
          onPress={() => setShowLogout(true)}
          style={styles.logout}
        >
          <Text variant="bodyBold" style={styles.logoutTxt}>
            {t('profile.logout')}
          </Text>
        </Pressable>
        <ConfirmDialog
          visible={showLogout}
          title={t('confirm.logout_title')}
          message={t('confirm.logout_message')}
          confirmLabel={t('confirm.logout_confirm')}
          cancelLabel={t('common.cancel')}
          destructive
          onConfirm={() => { void signOut(); }}
          onCancel={() => setShowLogout(false)}
        />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: { gap: spacing.md, paddingBottom: 120 },
  avatarSection: { alignItems: 'center', paddingVertical: spacing.xl },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  avatarText: { fontSize: 36, fontWeight: '700', color: '#fff' },
  displayName: { textAlign: 'center' },
  levelBadge: {
    color: colors.accent,
    fontWeight: '700',
    marginTop: spacing.xs,
  },
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  stat: {
    width: '47%',
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 16,
    alignItems: 'center',
    gap: spacing.xs,
  },
  statIcon: { fontSize: 24 },
  statValue: { textAlign: 'center' },
  statLabel: { color: colors.textSecondary, textAlign: 'center' },
  sectionTitle: { marginTop: spacing.md },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  linkTxt: { color: colors.primary },
  chevron: { color: colors.textSecondary, fontSize: 20 },
  logout: {
    marginTop: spacing.xxl,
    padding: spacing.md,
    backgroundColor: colors.error,
    borderRadius: 16,
    alignItems: 'center',
  },
  logoutTxt: { color: colors.textPrimary },
});
