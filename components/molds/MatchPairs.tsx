import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { ExerciseHeader } from '@/components/common/ExerciseHeader';
import { EditableField } from '@/components/molds/EditableField';
import { Text } from '@/components/ui/Text';
import { colors, radii, spacing } from '@/components/ui/theme';
import { useUIString } from '@/hooks/useUIString';
import { scoreMatchPairs } from '@/lib/scoring';
import type { MatchPairsContent, MoldProps } from '@/types/molds';

export function MatchPairs({
  exercise,
  onAnswer,
  onNext,
  isAdminMode,
  onContentChange,
}: MoldProps) {
  const { t } = useUIString();
  const base = exercise.content as unknown as MatchPairsContent;
  const [content, setContent] = useState(base);
  const rightShuffled = useMemo(() => {
    const copy = content.pairs.map((p) => p.ll);
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j]!, copy[i]!];
    }
    return copy;
  }, [content.pairs]);

  const [leftSel, setLeftSel] = useState<string | null>(null);
  const [rightSel, setRightSel] = useState<string | null>(null);
  const [matched, setMatched] = useState<{ al: string; ll: string }[]>([]);
  const [flash, setFlash] = useState<'ok' | 'bad' | null>(null);

  const shakeX = useSharedValue(0);

  useEffect(() => {
    if (flash === 'bad') {
      shakeX.value = withSequence(
        withTiming(-8, { duration: 40 }),
        withTiming(8, { duration: 40 }),
        withTiming(-8, { duration: 40 }),
        withTiming(8, { duration: 40 }),
        withTiming(0, { duration: 40 })
      );
    }
  }, [flash, shakeX]);

  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }],
  }));

  const patch = (next: Partial<MatchPairsContent>) => {
    const merged = { ...content, ...next };
    setContent(merged);
    onContentChange?.(merged as Record<string, unknown>);
  };

  const tryMatch = (al: string, ll: string) => {
    const pair = content.pairs.find((p) => p.al === al && p.ll === ll);
    if (pair) {
      setMatched((m) => [...m, pair]);
      setFlash('ok');
      setTimeout(() => setFlash(null), 400);
      if (matched.length + 1 >= content.pairs.length) {
        const ok = scoreMatchPairs(content, [...matched, pair]);
        onAnswer(ok, [...matched, pair]);
        onNext();
      }
    } else {
      setFlash('bad');
      setTimeout(() => setFlash(null), 400);
    }
    setLeftSel(null);
    setRightSel(null);
  };

  return (
    <View style={styles.wrap}>
      <ExerciseHeader moldLabel="Match pairs" />
      <EditableField
        isAdminMode={isAdminMode}
        value={content.prompt_al}
        multiline
        onCommit={(v) => patch({ prompt_al: v })}
      />
      <Animated.View style={[styles.cols, shakeStyle]}>
        <View style={styles.col}>
          {content.pairs.map((p) => {
            const done = matched.some((m) => m.al === p.al);
            return (
              <Pressable
                key={p.al}
                disabled={done}
                onPress={() => {
                  if (rightSel) {
                    tryMatch(p.al, rightSel);
                    return;
                  }
                  setLeftSel(p.al);
                }}
                style={[
                  styles.cell,
                  leftSel === p.al && styles.cellSel,
                  done && styles.cellDone,
                  flash === 'bad' && styles.cellBad,
                ]}
              >
                <Text variant="bodyBold">{p.al}</Text>
              </Pressable>
            );
          })}
        </View>
        <View style={styles.col}>
          {rightShuffled.map((ll) => {
            const done = matched.some((m) => m.ll === ll);
            return (
              <Pressable
                key={ll}
                disabled={done}
                onPress={() => {
                  if (leftSel) {
                    tryMatch(leftSel, ll);
                    return;
                  }
                  setRightSel(ll);
                }}
                style={[
                  styles.cell,
                  rightSel === ll && styles.cellSel,
                  done && styles.cellDone,
                  flash === 'bad' && styles.cellBad,
                ]}
              >
                <Text variant="body">{ll}</Text>
              </Pressable>
            );
          })}
        </View>
      </Animated.View>
      <Text variant="caption">{t('lesson.progress')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.lg },
  cols: { flexDirection: 'row', gap: spacing.md },
  col: { flex: 1, gap: spacing.sm },
  cell: {
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  cellSel: { borderColor: colors.accent, borderWidth: 2 },
  cellDone: { opacity: 0.35 },
  cellBad: { borderColor: colors.error, borderWidth: 2 },
});
