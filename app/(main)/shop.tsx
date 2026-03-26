import { useCallback, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Text } from '@/components/ui/Text';
import { colors, spacing } from '@/components/ui/theme';
import {
  HEARTS_MAX,
  SHOP_HEART_REFILL_COST,
  SHOP_STREAK_FREEZE_COST,
} from '@/lib/constants';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { useGamificationStore } from '@/stores/gamificationStore';
import { useUIString } from '@/hooks/useUIString';

export default function ShopScreen() {
  const { t } = useUIString();
  const userId = useAuthStore((s) => s.user?.id);
  const gems = useGamificationStore((s) => s.gems);
  const setFromProfile = useGamificationStore((s) => s.setFromProfile);
  const [confirm, setConfirm] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!userId) return;
    const { data } = await supabase
      .from('user_profiles')
      .select('total_xp, current_streak, longest_streak, gems, hearts, hearts_last_regen')
      .eq('id', userId)
      .maybeSingle();
    const row = data as {
      total_xp: number;
      current_streak: number;
      longest_streak: number;
      gems: number;
      hearts: number;
      hearts_last_regen: string;
    } | null;
    if (row) setFromProfile(row);
  }, [setFromProfile, userId]);

  const buyHearts = async () => {
    if (!userId) return;
    const { data } = await supabase
      .from('user_profiles')
      .select('gems')
      .eq('id', userId)
      .maybeSingle();
    const g = (data as { gems: number } | null)?.gems ?? 0;
    if (g < SHOP_HEART_REFILL_COST) return;
    await supabase
      .from('user_profiles')
      .update({
        gems: g - SHOP_HEART_REFILL_COST,
        hearts: HEARTS_MAX,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);
    await refresh();
    setConfirm(null);
  };

  const buyFreeze = async () => {
    if (!userId) return;
    const { data } = await supabase
      .from('user_profiles')
      .select('gems')
      .eq('id', userId)
      .maybeSingle();
    const g = (data as { gems: number } | null)?.gems ?? 0;
    if (g < SHOP_STREAK_FREEZE_COST) return;
    const t = new Date();
    t.setDate(t.getDate() + 1);
    await supabase
      .from('user_profiles')
      .update({
        gems: g - SHOP_STREAK_FREEZE_COST,
        streak_frozen_until: t.toISOString().slice(0, 10),
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);
    await refresh();
    setConfirm(null);
  };

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text variant="h1">{t('shop.title')}</Text>
        <Text variant="h3">
          💎 {gems}
        </Text>
        <Card style={styles.card}>
          <Text variant="h3">{t('shop.refill_hearts')}</Text>
          <Text variant="caption">{SHOP_HEART_REFILL_COST} gems</Text>
          <Button title={t('common.continue')} onPress={() => setConfirm('hearts')} />
        </Card>
        <Card style={styles.card}>
          <Text variant="h3">{t('shop.streak_freeze')}</Text>
          <Text variant="caption">{SHOP_STREAK_FREEZE_COST} gems</Text>
          <Button title={t('common.continue')} onPress={() => setConfirm('freeze')} />
        </Card>
        <Card style={styles.card}>
          <Text variant="h3">{t('shop.coming_soon')}</Text>
          <Text variant="caption">Double XP</Text>
        </Card>
        <Text variant="caption" style={styles.iap}>
          {t('shop.coming_soon')} — IAP
        </Text>
      </ScrollView>
      <Modal visible={Boolean(confirm)} transparent animationType="fade">
        <View style={styles.modalBg}>
          <View style={styles.modalBox}>
            <Text variant="h3">{t('common.continue')}?</Text>
            <View style={styles.row}>
              <Button
                title={t('common.cancel')}
                variant="ghost"
                onPress={() => setConfirm(null)}
              />
              <Button
                title={t('common.save')}
                onPress={() => {
                  if (confirm === 'hearts') void buyHearts();
                  else if (confirm === 'freeze') void buyFreeze();
                }}
              />
            </View>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: { gap: spacing.md, paddingBottom: 120 },
  card: { gap: spacing.sm },
  iap: { marginTop: spacing.lg, textAlign: 'center' },
  modalBg: {
    flex: 1,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  modalBox: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: 16,
    width: '100%',
    gap: spacing.md,
  },
  row: { flexDirection: 'row', gap: spacing.sm, justifyContent: 'flex-end' },
});
