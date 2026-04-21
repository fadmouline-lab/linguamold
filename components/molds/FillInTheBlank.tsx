import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AudioPlayer } from '@/components/common/AudioPlayer';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { ExerciseHeader } from '@/components/common/ExerciseHeader';
import { HintButton } from '@/components/common/HintButton';
import { OptionButton, type OptionState } from '@/components/common/OptionButton';
import { SkipButton } from '@/components/common/SkipButton';
import { SuccessMessage } from '@/components/common/SuccessMessage';
import { EditableField } from '@/components/molds/EditableField';
import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { colors, radii, spacing } from '@/components/ui/theme';
import { useUIString } from '@/hooks/useUIString';
import { scoreFillInTheBlank } from '@/lib/scoring';
import type { FillInTheBlankContent, MoldProps } from '@/types/molds';

export function FillInTheBlank({
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
  const base = exercise.content as unknown as FillInTheBlankContent;
  const [content, setContent] = useState(base);
  const [selected, setSelected] = useState<number | null>(null);
  const [phase, setPhase] = useState<'idle' | 'result'>('idle');
  const [correct, setCorrect] = useState(false);

  const sentence = useMemo(() => {
    const s = content.sentence_al;
    if (s.includes('___')) {
      const [before, after] = s.split('___');
      return { before: before ?? '', after: after ?? '' };
    }
    return { before: s, after: '' };
  }, [content.sentence_al]);

  const optionState = (i: number): OptionState => {
    if (phase !== 'result') return selected === i ? 'selected' : 'idle';
    if (content.options[i]?.is_correct) return 'correct';
    if (selected === i) return 'wrong';
    return 'idle';
  };

  const submit = (idx: number) => {
    if (phase === 'result') return;
    setSelected(idx);
    const ok = scoreFillInTheBlank(content, idx);
    setCorrect(ok);
    setPhase('result');
    onAnswer(ok, idx);
  };

  const patch = (next: Partial<FillInTheBlankContent>) => {
    const merged = { ...content, ...next };
    setContent(merged);
    onContentChange?.(merged as Record<string, unknown>);
  };

  return (
    <View style={styles.wrap}>
      <ExerciseHeader moldLabel={t('mold.fill_blank_label')} />
      {phase === 'idle' && onHint ? (
        <HintButton onHint={onHint} hintsUsed={hintsUsed ?? 0} />
      ) : null}
      <View style={styles.sentenceRow}>
        {isAdminMode ? (
          <EditableField
            isAdminMode
            value={content.sentence_al}
            multiline
            onCommit={(v) => patch({ sentence_al: v })}
          />
        ) : (
          <>
            <Text variant="h3">{sentence.before}</Text>
            <View style={[styles.blank, selected !== null ? styles.blankFilled : null]}>
              <Text variant="h3" style={styles.blankText}>
                {selected !== null ? (content.options[selected]?.text ?? '___') : '___'}
              </Text>
            </View>
            <Text variant="h3">{sentence.after}</Text>
          </>
        )}
      </View>
      <AudioPlayer audioUrl={content.audio_url_ll ?? null} />
      {content.options.map((opt, i) => (
        <OptionButton
          key={`${opt.text}-${i}`}
          label={opt.text}
          state={optionState(i)}
          disabled={phase === 'result'}
          onPress={() => submit(i)}
        />
      ))}
      {phase === 'idle' && onSkip ? (
        <SkipButton onSkip={onSkip} skipCount={skipCount ?? 0} />
      ) : null}
      <SuccessMessage
        visible={phase === 'result' && correct}
        message={t('lesson.correct')}
        detail={(() => {
          const base = content.success_message_al ?? content.sentence_ll;
          if (!base) return null;
          const fill = selected !== null ? (content.options[selected]?.text ?? '') : '';
          return base.replace('___', fill) || null;
        })()}
      />
      <ErrorMessage
        visible={phase === 'result' && !correct}
        message={t('lesson.wrong')}
        detail={
          content.error_explanation_al ??
          content.options.find((o) => o.is_correct)?.text ??
          null
        }
      />
      {phase === 'result' ? (
        <Button
          title={t('common.continue')}
          variant={correct ? 'correct' : 'wrong'}
          onPress={() => {
            setPhase('idle');
            setSelected(null);
            onNext();
          }}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.lg },
  sentenceRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing.xs },
  blank: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.sm,
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: colors.surfaceLight,
    minWidth: 64,
    alignItems: 'center',
  },
  blankFilled: {
    backgroundColor: colors.correctGlow,
  },
  blankText: { color: colors.primary },
});
