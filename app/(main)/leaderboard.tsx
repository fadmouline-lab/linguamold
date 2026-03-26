import { useCallback, useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';

import { LeaderboardRow } from '@/components/gamification/LeaderboardRow';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Text } from '@/components/ui/Text';
import { colors, spacing } from '@/components/ui/theme';
import { useLanguagePair } from '@/hooks/useLanguagePair';
import { useLeaderboard } from '@/hooks/useLeaderboard';
import { useUIString } from '@/hooks/useUIString';
import { supabase } from '@/lib/supabase';

export default function LeaderboardScreen() {
  const { t } = useUIString();
  const { currentAL, currentLL } = useLanguagePair();
  const { getWeeklyLeaderboard } = useLeaderboard();
  const [rows, setRows] = useState<
    {
      rank: number;
      displayName: string;
      avatarUrl: string | null;
      xpEarned: number;
      isCurrentUser: boolean;
    }[]
  >([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!currentAL || !currentLL) return;
    const { data: pair } = await supabase
      .from('language_pairs')
      .select('id')
      .eq('app_language_id', currentAL.id)
      .eq('learning_language_id', currentLL.id)
      .maybeSingle();
    const pid = (pair as { id: string } | null)?.id;
    if (!pid) return;
    const list = await getWeeklyLeaderboard(pid, 20);
    setRows(list);
  }, [currentAL, currentLL, getWeeklyLeaderboard]);

  useEffect(() => {
    void load();
  }, [load]);

  const top3 = rows.slice(0, 3);
  const rest = rows.slice(3);

  return (
    <ScreenContainer>
      <Text variant="h1" style={styles.title}>
        {t('gamify.leaderboard_weekly')}
      </Text>
      <View style={styles.podium}>
        {top3[1] ? (
          <View style={styles.pSlot}>
            <Text variant="caption">2</Text>
            <Text variant="bodyBold" numberOfLines={1}>
              {top3[1].displayName}
            </Text>
          </View>
        ) : null}
        {top3[0] ? (
          <View style={[styles.pSlot, styles.pFirst]}>
            <Text variant="h2">1</Text>
            <Text variant="bodyBold" numberOfLines={1}>
              {top3[0].displayName}
            </Text>
          </View>
        ) : null}
        {top3[2] ? (
          <View style={styles.pSlot}>
            <Text variant="caption">3</Text>
            <Text variant="bodyBold" numberOfLines={1}>
              {top3[2].displayName}
            </Text>
          </View>
        ) : null}
      </View>
      <FlatList
        data={rest}
        keyExtractor={(item) => `${item.rank}-${item.displayName}`}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={async () => {
              setRefreshing(true);
              await load();
              setRefreshing(false);
            }}
            tintColor={colors.primary}
          />
        }
        renderItem={({ item }) => (
          <LeaderboardRow
            rank={item.rank}
            name={item.displayName}
            xp={item.xpEarned}
            highlight={item.isCurrentUser}
          />
        )}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { marginBottom: spacing.lg },
  podium: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  pSlot: {
    width: 90,
    padding: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: 12,
    alignItems: 'center',
    minHeight: 80,
    justifyContent: 'flex-end',
  },
  pFirst: { minHeight: 110, borderColor: colors.accent, borderWidth: 2 },
});
