import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AudioPlayer } from '@/components/common/AudioPlayer';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { ExerciseHeader } from '@/components/common/ExerciseHeader';
import { SuccessMessage } from '@/components/common/SuccessMessage';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Text } from '@/components/ui/Text';
import { spacing } from '@/components/ui/theme';
import { useUIString } from '@/hooks/useUIString';
import { scoreTypeWhatYouHear } from '@/lib/scoring';
import type { MoldProps, TypeWhatYouHearContent } from '@/types/molds';

export function TypeWhatYouHear({
  exercise,
  onAnswer,
  onNext,
}: MoldProps) {
  const { t } = useUIString();
  const content = exercise.content as unknown as TypeWhatYouHearContent;
  const [text, setText] = useState('');
  const [phase, setPhase] = useState<'idle' | 'result'>('idle');
  const [correct, setCorrect] = useState(false);

  const check = () => {
    const ok = scoreTypeWhatYouHear(content, text);
    setCorrect(ok);
    setPhase('result');
    onAnswer(ok, text);
  };

  return (
    <View style={styles.wrap}>
      <ExerciseHeader moldLabel="Type what you hear" />
      <AudioPlayer audioUrl={content.audio_url_ll ?? null} autoPlay />
      {content.hint_al ? <Text variant="caption">{content.hint_al}</Text> : null}
      <Input value={text} onChangeText={setText} editable={phase === 'idle'} />
      {phase === 'idle' ? (
        <Button title={t('exercise.check')} onPress={() => void check()} />
      ) : null}
      <SuccessMessage visible={phase === 'result' && correct} message={t('lesson.correct')} />
      <ErrorMessage visible={phase === 'result' && !correct} message={t('lesson.wrong')} />
      {phase === 'result' ? (
        <Button
          title={t('common.continue')}
          onPress={() => {
            setPhase('idle');
            setText('');
            onNext();
          }}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({ wrap: { gap: spacing.md } });
