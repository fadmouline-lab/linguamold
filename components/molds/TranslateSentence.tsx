import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AudioPlayer } from '@/components/common/AudioPlayer';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { ExerciseHeader } from '@/components/common/ExerciseHeader';
import { SuccessMessage } from '@/components/common/SuccessMessage';
import { EditableField } from '@/components/molds/EditableField';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Text } from '@/components/ui/Text';
import { spacing } from '@/components/ui/theme';
import { useUIString } from '@/hooks/useUIString';
import { scoreTranslateSentence } from '@/lib/scoring';
import type { MoldProps, TranslateSentenceContent } from '@/types/molds';

export function TranslateSentence({
  exercise,
  onAnswer,
  onNext,
  isAdminMode,
  onContentChange,
}: MoldProps) {
  const { t } = useUIString();
  const base = exercise.content as unknown as TranslateSentenceContent;
  const [content, setContent] = useState(base);
  const [text, setText] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [phase, setPhase] = useState<'idle' | 'result'>('idle');
  const [correct, setCorrect] = useState(false);

  const check = () => {
    const ok = scoreTranslateSentence(content, text);
    setCorrect(ok);
    setPhase('result');
    onAnswer(ok, text);
  };

  const patch = (next: Partial<TranslateSentenceContent>) => {
    const merged = { ...content, ...next };
    setContent(merged);
    onContentChange?.(merged as Record<string, unknown>);
  };

  return (
    <View style={styles.wrap}>
      <ExerciseHeader moldLabel="Translate" />
      <EditableField
        isAdminMode={isAdminMode}
        value={content.prompt_al}
        multiline
        onCommit={(v) => patch({ prompt_al: v })}
      />
      <AudioPlayer audioUrl={content.audio_url_ll ?? null} />
      <Input
        value={text}
        onChangeText={setText}
        editable={phase === 'idle'}
        placeholder="English"
      />
      {showHint && content.hint_al ? (
        <Text variant="caption">{content.hint_al}</Text>
      ) : null}
      {phase === 'idle' ? (
        <View style={styles.row}>
          <Button
            title={t('exercise.hint')}
            variant="secondary"
            onPress={() => setShowHint(true)}
          />
          <Button title={t('exercise.check')} onPress={() => void check()} />
        </View>
      ) : null}
      <SuccessMessage
        visible={phase === 'result' && correct}
        message={t('lesson.correct')}
      />
      <ErrorMessage
        visible={phase === 'result' && !correct}
        message={t('lesson.wrong')}
      />
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

const styles = StyleSheet.create({
  wrap: { gap: spacing.md },
  row: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' },
});
