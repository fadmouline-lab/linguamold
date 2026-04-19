import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

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
import { scoreConversationListen } from '@/lib/scoring';
import type { ConversationListenContent, MoldProps } from '@/types/molds';

export function ConversationListen({
  exercise,
  onAnswer,
  onNext,
  isAdminMode,
  onContentChange,
}: MoldProps) {
  const { t } = useUIString();
  const base = exercise.content as unknown as ConversationListenContent;
  const [content, setContent] = useState(base);
  const [showTranscript, setShowTranscript] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [phase, setPhase] = useState<'idle' | 'result'>('idle');
  const [correct, setCorrect] = useState(false);

  const patch = (next: Partial<ConversationListenContent>) => {
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
    const ok = scoreConversationListen(content, i);
    setCorrect(ok);
    setPhase('result');
    onAnswer(ok, i);
  };

  return (
    <View style={styles.wrap}>
      <ExerciseHeader moldLabel="Conversation" />
      <AudioPlayer audioUrl={content.audio_url_ll ?? null} autoPlay />
      <Pressable onPress={() => setShowTranscript((s) => !s)}>
        <Text variant="caption" style={styles.link}>
          {showTranscript ? t('common.close') : t('exercise.transcript')}
        </Text>
      </Pressable>
      {showTranscript ? (
        <View style={styles.box}>
          <EditableField
            isAdminMode={isAdminMode}
            value={content.transcript_ll}
            multiline
            onCommit={(v) => patch({ transcript_ll: v })}
          />
          <EditableField
            isAdminMode={isAdminMode}
            value={content.transcript_al}
            multiline
            onCommit={(v) => patch({ transcript_al: v })}
          />
        </View>
      ) : null}
      <EditableField
        isAdminMode={isAdminMode}
        value={content.question_al}
        multiline
        onCommit={(v) => patch({ question_al: v })}
      />
      {content.options.map((o, i) => (
        <OptionButton
          key={`${o.text_al}-${i}`}
          label={o.text_al}
          state={optionState(i)}
          disabled={phase === 'result'}
          onPress={() => submit(i)}
        />
      ))}
      <SuccessMessage visible={phase === 'result' && correct} message={t('lesson.correct')} />
      <ErrorMessage visible={phase === 'result' && !correct} message={t('lesson.wrong')} />
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
  link: { color: colors.primary },
  box: { gap: spacing.sm },
});
