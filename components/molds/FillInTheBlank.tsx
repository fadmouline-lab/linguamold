import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AudioPlayer } from '@/components/common/AudioPlayer';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { ExerciseHeader } from '@/components/common/ExerciseHeader';
import { OptionButton, type OptionState } from '@/components/common/OptionButton';
import { SuccessMessage } from '@/components/common/SuccessMessage';
import { EditableField } from '@/components/molds/EditableField';
import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { colors, spacing } from '@/components/ui/theme';
import { useUIString } from '@/hooks/useUIString';
import { scoreFillInTheBlank } from '@/lib/scoring';
import type { FillInTheBlankContent, MoldProps } from '@/types/molds';

export function FillInTheBlank({
  exercise,
  onAnswer,
  onNext,
  isAdminMode,
  onContentChange,
}: MoldProps) {
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
      <ExerciseHeader moldLabel="Fill in the blank" />
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
            <View style={styles.blank}>
              <Text variant="h3">___</Text>
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
      <SuccessMessage
        visible={phase === 'result' && correct}
        message={content.success_message_al ?? t('lesson.correct')}
      />
      <ErrorMessage
        visible={phase === 'result' && !correct}
        message={content.error_explanation_al ?? t('lesson.wrong')}
      />
      {phase === 'result' ? (
        <Button
          title={t('common.continue')}
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
  wrap: { gap: spacing.sm },
  sentenceRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing.xs },
  blank: {
    paddingHorizontal: spacing.sm,
    borderBottomWidth: 2,
    borderColor: colors.accent,
  },
});
