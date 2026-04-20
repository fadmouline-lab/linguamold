import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { colors, radii, shadows, spacing } from '@/components/ui/theme';
import { useUIString } from '@/hooks/useUIString';

// TODO(motion): animated progress bar fill on mount, count-up numbers

export interface ProgressDashboardProps {
  totalWords: number;
  accuracyPct: number;
  level: number;
  xpToNext: number;
  totalXp: number;
  lessonsCompleted: number;
  minutesPracticed: number;
  weakWords: { word: string; mistakeCount: number }[];
  onPracticeWord?: (word: string) => void;
}

function formatTime(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return remainder > 0 ? `${hours}h ${remainder}m` : `${hours}h`;
}

export function ProgressDashboard({
  totalWords,
  accuracyPct,
  level,
  xpToNext,
  totalXp,
  lessonsCompleted,
  minutesPracticed,
  weakWords,
  onPracticeWord,
}: ProgressDashboardProps) {
  const { t } = useUIString();

  const xpProgress = totalXp > 0 ? Math.min(1, totalXp / (totalXp + xpToNext)) : 0;

  return (
    <View style={styles.container}>
      <Text variant="h2" style={styles.sectionTitle}>
        {t('profile.progress_title')}
      </Text>

      {/* Stats grid */}
      <View style={styles.grid}>
        <View style={styles.statCard}>
          <Text variant="score" style={styles.statValue}>{totalWords}</Text>
          <Text variant="caption">Words learned</Text>
        </View>

        <View style={styles.statCard}>
          <Text variant="score" style={styles.statValue}>{accuracyPct}%</Text>
          <Text variant="caption">Accuracy</Text>
        </View>

        <View style={styles.statCard}>
          <Text variant="score" style={styles.statValue}>{level}</Text>
          <Text variant="caption">Level</Text>
          <View style={styles.progressBarOuter}>
            <View style={[styles.progressBarInner, { width: `${xpProgress * 100}%` }]} />
          </View>
          <Text variant="micro">{xpToNext} XP to next</Text>
        </View>

        <View style={styles.statCard}>
          <Text variant="score" style={styles.statValue}>{lessonsCompleted}</Text>
          <Text variant="caption">Lessons</Text>
        </View>

        <View style={styles.statCard}>
          <Text variant="score" style={styles.statValue}>{formatTime(minutesPracticed)}</Text>
          <Text variant="caption">Time spent</Text>
        </View>

        <View style={styles.statCard}>
          <Text variant="score" style={styles.statValue}>{totalXp}</Text>
          <Text variant="caption">Total XP</Text>
        </View>
      </View>

      {/* Weak words section */}
      <Text variant="h3" style={styles.weakTitle}>
        {t('profile.weak_spots')}
      </Text>

      {weakWords.length > 0 ? (
        <View style={styles.weakList}>
          {weakWords.slice(0, 5).map((item) => (
            <View key={item.word} style={styles.weakRow}>
              <View style={styles.weakWordInfo}>
                <Text variant="bodyBold">{item.word}</Text>
                <View style={styles.mistakeBadge}>
                  <Text variant="micro" color={colors.error}>
                    {item.mistakeCount}x
                  </Text>
                </View>
              </View>
              {onPracticeWord ? (
                <Pressable
                  onPress={() => onPracticeWord(item.word)}
                  style={styles.practiceButton}
                  accessibilityRole="button"
                >
                  <Text variant="label" color={colors.primary}>
                    {t('profile.practice')}
                  </Text>
                </Pressable>
              ) : null}
            </View>
          ))}
        </View>
      ) : (
        <Text variant="body" style={styles.emptyText}>
          {t('profile.no_weak_spots')}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xxl,
  },
  sectionTitle: {
    marginBottom: spacing.xl,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.xxxl,
  },
  statCard: {
    width: '47%',
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  statValue: {
    fontSize: 28,
    lineHeight: 34,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  progressBarOuter: {
    height: 6,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceLight,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
    overflow: 'hidden',
  },
  progressBarInner: {
    height: '100%',
    borderRadius: radii.pill,
    backgroundColor: colors.primary,
  },
  weakTitle: {
    marginBottom: spacing.lg,
  },
  weakList: {
    gap: spacing.sm,
  },
  weakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: radii.sm,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  weakWordInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  mistakeBadge: {
    backgroundColor: colors.errorLight,
    borderRadius: radii.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
  },
  practiceButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.sm,
    backgroundColor: colors.primaryLight,
  },
  emptyText: {
    color: colors.textSecondary,
    textAlign: 'center',
    paddingVertical: spacing.xl,
  },
});
