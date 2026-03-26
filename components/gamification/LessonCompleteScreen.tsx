import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { colors, spacing } from '@/components/ui/theme';
import { CelebrationOverlay } from '@/components/gamification/CelebrationOverlay';
import { useUIString } from '@/hooks/useUIString';

export interface LessonCompleteScreenProps {
  scorePct: number;
  xpEarned: number;
  streakKept: boolean;
  onContinue: () => void;
}

export function LessonCompleteScreen({
  scorePct,
  xpEarned,
  streakKept,
  onContinue,
}: LessonCompleteScreenProps) {
  const { t } = useUIString();
  const stars = scorePct < 60 ? 1 : scorePct < 90 ? 2 : 3;
  const [showConfetti, setShowConfetti] = useState(scorePct >= 90);

  useEffect(() => {
    if (!showConfetti) return;
    const tmr = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(tmr);
  }, [showConfetti]);

  return (
    <View style={styles.wrap}>
      <CelebrationOverlay
        visible={showConfetti}
        title={t('lesson.complete_title')}
        onDone={() => setShowConfetti(false)}
      />
      <Text variant="h1" style={styles.title}>
        {t('lesson.complete_title')}
      </Text>
      <Text variant="h2" style={styles.stars}>
        {'⭐'.repeat(stars)}
      </Text>
      <Text variant="body" style={styles.row}>
        {scorePct}% · +{xpEarned} {t('gamify.xp')}
      </Text>
      <Text variant="caption">
        {streakKept ? `${t('gamify.streak')} 🔥` : t('gamify.streak')}
      </Text>
      <View style={styles.spacer} />
      <Button title={t('common.continue')} onPress={onContinue} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    padding: spacing.lg,
    backgroundColor: colors.background,
    justifyContent: 'center',
  },
  title: { marginBottom: spacing.md },
  stars: { marginBottom: spacing.sm },
  row: { marginBottom: spacing.sm },
  spacer: { height: spacing.xxl },
});
