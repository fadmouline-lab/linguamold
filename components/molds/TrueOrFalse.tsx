import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ErrorMessage } from '@/components/common/ErrorMessage';
import { ExerciseHeader } from '@/components/common/ExerciseHeader';
import { HintButton } from '@/components/common/HintButton';
import { SkipButton } from '@/components/common/SkipButton';
import { SuccessMessage } from '@/components/common/SuccessMessage';
import { EditableField } from '@/components/molds/EditableField';
import { Button } from '@/components/ui/Button';
import { spacing } from '@/components/ui/theme';
import { useUIString } from '@/hooks/useUIString';
import { scoreTrueOrFalse } from '@/lib/scoring';
import type { MoldProps, TrueOrFalseContent } from '@/types/molds';

export function TrueOrFalse({
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
  const base = exercise.content as unknown as TrueOrFalseContent;
  const [content, setContent] = useState(base);
  const [phase, setPhase] = useState<'idle' | 'result'>('idle');
  const [correct, setCorrect] = useState(false);

  const patch = (next: Partial<TrueOrFalseContent>) => {
    const merged = { ...content, ...next };
    setContent(merged);
    onContentChange?.(merged as Record<string, unknown>);
  };

  const answer = (v: boolean) => {
    if (phase === 'result') return;
    const ok = scoreTrueOrFalse(content, v);
    setCorrect(ok);
    setPhase('result');
    onAnswer(ok, v);
  };

  return (
    <View style={styles.wrap}>
      <ExerciseHeader moldLabel="True / False" />
      {/* TODO(motion) */}
      {phase === 'idle' && onHint ? (
        <HintButton onHint={onHint} hintsUsed={hintsUsed ?? 0} />
      ) : null}
      <EditableField
        isAdminMode={isAdminMode}
        value={content.statement_ll}
        multiline
        onCommit={(v) => patch({ statement_ll: v })}
      />
      <EditableField
        isAdminMode={isAdminMode}
        value={content.proposed_translation_al}
        multiline
        onCommit={(v) => patch({ proposed_translation_al: v })}
      />
      {phase === 'idle' ? (
        <View style={styles.row}>
          <Button title={t('exercise.true')} onPress={() => answer(true)} />
          <Button
            title={t('exercise.false')}
            variant="secondary"
            onPress={() => answer(false)}
          />
        </View>
      ) : null}
      {/* TODO(motion) */}
      {phase === 'idle' && onSkip ? (
        <SkipButton onSkip={onSkip} skipCount={skipCount ?? 0} />
      ) : null}
      <SuccessMessage
        visible={phase === 'result' && correct}
        message={t('lesson.correct')}
        detail={content.explanation_al ?? null}
      />
      <ErrorMessage
        visible={phase === 'result' && !correct}
        message={t('lesson.wrong')}
        detail={content.explanation_al ?? null}
      />
      {phase === 'result' ? (
        <Button
          title={t('common.continue')}
          variant={correct ? 'correct' : 'wrong'}
          onPress={() => {
            setPhase('idle');
            onNext();
          }}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.lg },
  row: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' },
});
