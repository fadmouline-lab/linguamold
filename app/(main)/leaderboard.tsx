import { useCallback, useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';

import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { SkeletonLoader } from '@/components/common/SkeletonLoader';
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
  const [error, setError] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const load = useCallback(async () => {
    if (!currentAL || !currentLL) return;
    setError(false);
    try {
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
      setInitialLoading(false);
    } catch {
      setError(true);
      setInitialLoading(false);
    }
  }, [currentAL, currentLL, getWeeklyLeaderboard]);

  useEffect(() => {
    void load();
  }, [load]);

  const top3 = rows.slice(0, 3);
  const rest = rows.slice(3);

  return (
    <ScreenContainer>
      {initialLoading ? (
        <View style={{ gap: spacing.md }}>
          <SkeletonLoader height={130} />
          <SkeletonLoader height={60} />
          <SkeletonLoader height={60} />
          <SkeletonLoader height={60} />
        </View>
      ) : error ? (
        <ErrorState message={t('error.network')} onRetry={() => void load()} retryLabel={t('common.try_again')} />
      ) : rows.length === 0 ? (
        <EmptyState
          emoji="🏆"
          message={t('leaderboard.empty')}
          subtitle={t('leaderboard.invite')}
        />
      ) : (
        <>
          <View style={styles.podium}>
            {top3[1] ? (
              <View style={[styles.pSlot, styles.pSecond]}>
                <Text style={styles.pMedal}>🥈</Text>
                <Text variant="bodyBold" numberOfLines={1} style={styles.pName}>
                  {top3[1].displayName}
                </Text>
                <Text variant="caption" style={styles.pXp}>{top3[1].xpEarned} XP</Text>
              </View>
            ) : null}
            {top3[0] ? (
              <View style={[styles.pSlot, styles.pFirst]}>
                <Text style={styles.pMedal}>🥇</Text>
                <Text variant="bodyBold" numberOfLines={1} style={styles.pName}>
                  {top3[0].displayName}
                </Text>
                <Text variant="caption" style={styles.pXp}>{top3[0].xpEarned} XP</Text>
              </View>
            ) : null}
            {top3[2] ? (
              <View style={[styles.pSlot, styles.pThird]}>
                <Text style={styles.pMedal}>🥉</Text>
                <Text variant="bodyBold" numberOfLines={1} style={styles.pName}>
                  {top3[2].displayName}
                </Text>
                <Text variant="caption" style={styles.pXp}>{top3[2].xpEarned} XP</Text>
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
        </>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  podium: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  pSlot: {
    width: 96,
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'flex-end',
    borderWidth: 1,
    borderColor: colors.border,
  },
  pFirst: {
    minHeight: 130,
    borderColor: colors.accent,
    borderWidth: 2,
    backgroundColor: colors.surfaceLight,
  },
  pSecond: { minHeight: 105 },
  pThird: { minHeight: 90 },
  pMedal: { fontSize: 28, marginBottom: spacing.xs },
  pName: { textAlign: 'center', fontSize: 12 },
  pXp: { color: colors.textSecondary, textAlign: 'center' },
});
