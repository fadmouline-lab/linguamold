import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeOut, LinearTransition, ZoomIn } from 'react-native-reanimated';

import { AudioPlayer } from '@/components/common/AudioPlayer';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { ExerciseHeader } from '@/components/common/ExerciseHeader';
import { HintButton } from '@/components/common/HintButton';
import { SkipButton } from '@/components/common/SkipButton';
import { SuccessMessage } from '@/components/common/SuccessMessage';
import { EditableField } from '@/components/molds/EditableField';
import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { colors, radii, spacing } from '@/components/ui/theme';
import { useUIString } from '@/hooks/useUIString';
import { scoreWordReorder } from '@/lib/scoring';
import type { MoldProps, WordReorderContent } from '@/types/molds';

export function WordReorder({
  exercise,
  onAnswer,
  onNext,
  isAdminMode,
  onContentChange,
  onSkip,
  skipCount,
  hintsUsed,
  onHint,
}: MoldProps & { onSkip?: () => void; skipCount?: number; hintsUsed?: number; onHint?: () => void }) {
  const { t } = useUIString();
  const base = exercise.content as unknown as WordReorderContent;
  const [content, setContent] = useState(base);
  const [pool, setPool] = useState<number[]>(() =>
    content.scrambled_words_ll.map((_, i) => i)
  );
  const [slots, setSlots] = useState<number[]>([]);
  const [phase, setPhase] = useState<'idle' | 'result'>('idle');
  const [correct, setCorrect] = useState(false);

  const words = content.scrambled_words_ll;

  const orderIdx = useMemo(() => slots, [slots]);

  const patch = (next: Partial<WordReorderContent>) => {
    const merged = { ...content, ...next };
    setContent(merged);
    onContentChange?.(merged as Record<string, unknown>);
  };

  const check = () => {
    const ok = scoreWordReorder(content, orderIdx);
    setCorrect(ok);
    setPhase('result');
    onAnswer(ok, orderIdx);
  };

  const tapPool = (pos: number) => {
    if (phase !== 'idle') return;
    setPool((p) => {
      const next = [...p];
      const [taken] = next.splice(pos, 1);
      setSlots((s) => [...s, taken]);
      return next;
    });
  };

  const tapSlot = (pos: number) => {
    if (phase !== 'idle') return;
    setSlots((s) => {
      const next = [...s];
      const [taken] = next.splice(pos, 1);
      setPool((p) => [...p, taken]);
      return next;
    });
  };

  return (
    <View style={styles.wrap}>
      <ExerciseHeader moldLabel={t('mold.reorder_label')} />
      {/* TODO(motion) */}
      {phase === 'idle' && onHint ? (
        <HintButton onHint={onHint} hintsUsed={hintsUsed ?? 0} />
      ) : null}
      <EditableField
        isAdminMode={isAdminMode}
        value={content.prompt_al}
        multiline
        onCommit={(v) => patch({ prompt_al: v })}
      />
      <AudioPlayer audioUrl={content.audio_url_ll ?? null} />
      <View style={styles.slots}>
        {slots.map((idx, pos) => (
          <Animated.View
            key={`s-${idx}`}
            entering={ZoomIn.duration(200)}
            exiting={FadeOut.duration(150)}
            layout={LinearTransition.springify()}
          >
            <Pressable onPress={() => tapSlot(pos)} style={styles.chip}>
              <Text variant="bodyBold">{words[idx]}</Text>
            </Pressable>
          </Animated.View>
        ))}
      </View>
      <View style={styles.pool}>
        {pool.map((idx, pos) => (
          <Animated.View
            key={`p-${idx}`}
            exiting={FadeOut.duration(150)}
            layout={LinearTransition.springify()}
          >
            <Pressable onPress={() => tapPool(pos)} style={styles.chip}>
              <Text variant="body">{words[idx]}</Text>
            </Pressable>
          </Animated.View>
        ))}
      </View>
      {phase === 'idle' ? (
        <Button title={t('exercise.check')} onPress={() => void check()} />
      ) : null}
      {/* TODO(motion) */}
      {phase === 'idle' && onSkip ? (
        <SkipButton onSkip={onSkip} skipCount={skipCount ?? 0} />
      ) : null}
      <SuccessMessage
        visible={phase === 'result' && correct}
        message={t('lesson.correct')}
        detail={content.correct_sentence_ll || null}
      />
      <ErrorMessage
        visible={phase === 'result' && !correct}
        message={t('lesson.wrong')}
        detail={content.correct_sentence_ll || null}
      />
      {phase === 'result' ? (
        <Button
          title={t('common.continue')}
          variant={correct ? 'correct' : 'wrong'}
          onPress={() => {
            setPhase('idle');
            setSlots([]);
            setPool(content.scrambled_words_ll.map((_, i) => i));
            onNext();
          }}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.lg },
  slots: {
    minHeight: 56,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.primary,
    borderRadius: radii.md,
    padding: spacing.sm,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  pool: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surfaceLight,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
