import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AudioPlayer } from '@/components/common/AudioPlayer';
import { DiffHighlight } from '@/components/common/DiffHighlight';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { ExerciseHeader } from '@/components/common/ExerciseHeader';
import { HintButton } from '@/components/common/HintButton';
import { SkipButton } from '@/components/common/SkipButton';
import { SuccessMessage } from '@/components/common/SuccessMessage';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Text } from '@/components/ui/Text';
import { colors, spacing } from '@/components/ui/theme';
import { useUIString } from '@/hooks/useUIString';
import { scoreTypeWhatYouHearFuzzy } from '@/lib/scoring';
import type { MoldProps, TypeWhatYouHearContent } from '@/types/molds';

export function TypeWhatYouHear({
  exercise,
  onAnswer,
  onNext,
  onSkip,
  skipCount,
  hintsUsed,
  onHint,
}: MoldProps & { onSkip?: () => void; skipCount?: number; hintsUsed?: number; onHint?: () => void }) {
  const { t } = useUIString();
  const content = exercise.content as unknown as TypeWhatYouHearContent;
  const [text, setText] = useState('');
  const [phase, setPhase] = useState<'idle' | 'result'>('idle');
  const [correct, setCorrect] = useState(false);
  const [close, setClose] = useState(false);
  const [bestMatch, setBestMatch] = useState<string | null>(null);

  const check = () => {
    const trimmed = text.trim();
    setText(trimmed);
    const result = scoreTypeWhatYouHearFuzzy(content, trimmed);
    setCorrect(result.correct);
    setClose(result.close);
    setBestMatch(result.bestMatch);
    setPhase('result');
    onAnswer(result.correct, trimmed);
  };

  return (
    <View style={styles.wrap}>
      <ExerciseHeader moldLabel={t('mold.type_hear_label')} />
      {phase === 'idle' && onHint ? (
        <HintButton onHint={onHint} hintsUsed={hintsUsed ?? 0} />
      ) : null}
      <AudioPlayer audioUrl={content.audio_url_ll ?? null} autoPlay />
      {content.hint_al ? <Text variant="caption">{content.hint_al}</Text> : null}
      <Input value={text} onChangeText={setText} editable={phase === 'idle'} />
      {phase === 'idle' ? (
        <Button title={t('exercise.check')} onPress={() => void check()} />
      ) : null}
      {phase === 'idle' && onSkip ? (
        <SkipButton onSkip={onSkip} skipCount={skipCount ?? 0} />
      ) : null}
      <SuccessMessage
        visible={phase === 'result' && correct}
        message={t('lesson.correct')}
        detail={content.accepted_answers?.[0] ?? null}
      />
      {phase === 'result' && !correct && close ? (
        <View style={styles.almost}>
          <Text variant="bodyBold" style={{ color: colors.accent }}>
            {t('lesson.almost')}
          </Text>
          {bestMatch ? (
            <DiffHighlight userText={text} correctText={bestMatch} />
          ) : null}
        </View>
      ) : null}
      <ErrorMessage
        visible={phase === 'result' && !correct && !close}
        message={t('lesson.wrong')}
        detail={content.accepted_answers?.[0] ?? null}
      />
      {phase === 'result' ? (
        <Button
          title={t('common.continue')}
          variant={correct ? 'correct' : 'wrong'}
          onPress={() => {
            setPhase('idle');
            setText('');
            setClose(false);
            setBestMatch(null);
            onNext();
          }}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.lg },
  almost: { alignItems: 'center', gap: spacing.xs },
});
