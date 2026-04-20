import { useState } from 'react';
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
import { spacing } from '@/components/ui/theme';
import { useUIString } from '@/hooks/useUIString';
import { scoreListenAndChoose } from '@/lib/scoring';
import type { ListenAndChooseContent, MoldProps } from '@/types/molds';

export function ListenAndChoose({
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
  const base = exercise.content as unknown as ListenAndChooseContent;
  const [content, setContent] = useState(base);
  const [selected, setSelected] = useState<number | null>(null);
  const [phase, setPhase] = useState<'idle' | 'result'>('idle');
  const [correct, setCorrect] = useState(false);

  const patch = (next: Partial<ListenAndChooseContent>) => {
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
    const ok = scoreListenAndChoose(content, i);
    setCorrect(ok);
    setPhase('result');
    onAnswer(ok, i);
  };

  return (
    <View style={styles.wrap}>
      <ExerciseHeader moldLabel="Listen" />
      {phase === 'idle' && onHint ? (
        <HintButton onHint={onHint} hintsUsed={hintsUsed ?? 0} />
      ) : null}
      <AudioPlayer audioUrl={content.audio_url_ll ?? null} autoPlay />
      <EditableField
        isAdminMode={isAdminMode}
        value={content.prompt_al}
        multiline
        onCommit={(v) => patch({ prompt_al: v })}
      />
      {content.options.map((o, i) => (
        <OptionButton
          key={`${o.text_ll}-${i}`}
          label={o.text_al}
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
        detail={content.options.find((o) => o.is_correct)?.text_ll || null}
      />
      <ErrorMessage
        visible={phase === 'result' && !correct}
        message={t('lesson.wrong')}
        detail={content.options.find((o) => o.is_correct)?.text_al || null}
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
