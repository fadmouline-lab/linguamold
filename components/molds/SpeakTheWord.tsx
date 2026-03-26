import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AudioPlayer } from '@/components/common/AudioPlayer';
import { ExerciseHeader } from '@/components/common/ExerciseHeader';
import { EditableField } from '@/components/molds/EditableField';
import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { spacing } from '@/components/ui/theme';
import { useUIString } from '@/hooks/useUIString';
import { scoreSpeakTheWord } from '@/lib/scoring';
import type { MoldProps, SpeakTheWordContent } from '@/types/molds';

export function SpeakTheWord({
  exercise,
  onAnswer,
  onNext,
  isAdminMode,
  onContentChange,
}: MoldProps) {
  const { t } = useUIString();
  const base = exercise.content as unknown as SpeakTheWordContent;
  const [content, setContent] = useState(base);

  const patch = (next: Partial<SpeakTheWordContent>) => {
    const merged = { ...content, ...next };
    setContent(merged);
    onContentChange?.(merged as Record<string, unknown>);
  };

  const done = (ok: boolean) => {
    onAnswer(scoreSpeakTheWord(), ok);
    onNext();
  };

  return (
    <View style={styles.wrap}>
      <ExerciseHeader moldLabel="Speak" />
      <EditableField
        isAdminMode={isAdminMode}
        value={content.word_ll}
        onCommit={(v) => patch({ word_ll: v })}
      />
      {content.phonetic_ll ? (
        <Text variant="caption">{content.phonetic_ll}</Text>
      ) : null}
      <EditableField
        isAdminMode={isAdminMode}
        value={content.translation_al}
        onCommit={(v) => patch({ translation_al: v })}
      />
      <AudioPlayer audioUrl={content.audio_url_ll ?? null} />
      <View style={styles.row}>
        <Button title={t('exercise.self_correct')} onPress={() => done(true)} />
        <Button
          title={t('exercise.self_practice')}
          variant="secondary"
          onPress={() => done(false)}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.md },
  row: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' },
});
