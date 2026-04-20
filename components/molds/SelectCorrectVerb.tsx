import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ErrorMessage } from '@/components/common/ErrorMessage';
import { ExerciseHeader } from '@/components/common/ExerciseHeader';
import { HintButton } from '@/components/common/HintButton';
import { OptionButton, type OptionState } from '@/components/common/OptionButton';
import { SkipButton } from '@/components/common/SkipButton';
import { SuccessMessage } from '@/components/common/SuccessMessage';
import { EditableField } from '@/components/molds/EditableField';
import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { spacing } from '@/components/ui/theme';
import { useUIString } from '@/hooks/useUIString';
import { scoreSelectCorrectVerb } from '@/lib/scoring';
import type { MoldProps, SelectCorrectVerbContent } from '@/types/molds';

export function SelectCorrectVerb({
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
  const base = exercise.content as unknown as SelectCorrectVerbContent;
  const [content, setContent] = useState(base);
  const [selected, setSelected] = useState<number | null>(null);
  const [phase, setPhase] = useState<'idle' | 'result'>('idle');
  const [correct, setCorrect] = useState(false);

  const patch = (next: Partial<SelectCorrectVerbContent>) => {
    const merged = { ...content, ...next };
    setContent(merged);
    onContentChange?.(merged as Record<string, unknown>);
  };

  const optionState = (i: number): OptionState => {
    if (phase !== 'result') return selected === i ? 'selected' : 'idle';
    if (content.options[i]?.is_correct) return 'correct';
    if (selected === i) return 'wrong';
    return 'idle';
  };

  const submit = (i: number) => {
    if (phase === 'result') return;
    setSelected(i);
    const ok = scoreSelectCorrectVerb(content, i);
    setCorrect(ok);
    setPhase('result');
    onAnswer(ok, i);
  };

  return (
    <View style={styles.wrap}>
      <ExerciseHeader moldLabel="Verb" />
      {/* TODO(motion) */}
      {phase === 'idle' && onHint ? (
        <HintButton onHint={onHint} hintsUsed={hintsUsed ?? 0} />
      ) : null}
      <EditableField
        isAdminMode={isAdminMode}
        value={content.sentence_ll}
        multiline
        onCommit={(v) => patch({ sentence_ll: v })}
      />
      <EditableField
        isAdminMode={isAdminMode}
        value={content.translation_al}
        multiline
        onCommit={(v) => patch({ translation_al: v })}
      />
      {content.options.map((o, i) => (
        <OptionButton
          key={`${o.text}-${i}`}
          label={o.text}
          state={optionState(i)}
          disabled={phase === 'result'}
          onPress={() => submit(i)}
        />
      ))}
      {/* TODO(motion) */}
      {phase === 'idle' && onSkip ? (
        <SkipButton onSkip={onSkip} skipCount={skipCount ?? 0} />
      ) : null}
      <SuccessMessage
        visible={phase === 'result' && correct}
        message={t('lesson.correct')}
        detail={content.grammar_hint_al || null}
      />
      <ErrorMessage
        visible={phase === 'result' && !correct}
        message={t('lesson.wrong')}
        detail={content.options.find((o) => o.is_correct)?.text || null}
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

const styles = StyleSheet.create({ wrap: { gap: spacing.lg } });
