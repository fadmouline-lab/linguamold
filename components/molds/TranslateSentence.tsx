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
import { colors, spacing } from '@/components/ui/theme';
import { useUIString } from '@/hooks/useUIString';
import { scoreTranslateSentenceFuzzy } from '@/lib/scoring';
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
  const [close, setClose] = useState(false);
  const [bestMatch, setBestMatch] = useState<string | null>(null);

  const check = () => {
    const trimmed = text.trim();
    setText(trimmed);
    const result = scoreTranslateSentenceFuzzy(content, trimmed);
    setCorrect(result.correct);
    setClose(result.close);
    setBestMatch(result.bestMatch);
    setPhase('result');
    onAnswer(result.correct, trimmed);
  };

  const patch = (next: Partial<TranslateSentenceContent>) => {
    const merged = { ...content, ...next };
    setContent(merged);
    onContentChange?.(merged as Record<string, unknown>);
  };

  return (
    <View style={styles.wrap}>
      <ExerciseHeader moldLabel={t('mold.translate_label')} />
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
        placeholder={t('mold.translate_input_placeholder')}
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
      {phase === 'result' && !correct && close ? (
        <View style={styles.almost}>
          <Text variant="bodyBold" style={{ color: colors.accent }}>
            {t('lesson.almost')}
          </Text>
          {bestMatch ? (
            <Text variant="caption" style={{ color: colors.textSecondary }}>
              {bestMatch}
            </Text>
          ) : null}
        </View>
      ) : null}
      <ErrorMessage
        visible={phase === 'result' && !correct}
        message={t('lesson.wrong')}
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
  row: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' },
  almost: { alignItems: 'center', gap: spacing.xs },
});
