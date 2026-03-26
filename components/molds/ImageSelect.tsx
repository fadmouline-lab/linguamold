import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AudioPlayer } from '@/components/common/AudioPlayer';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { ExerciseHeader } from '@/components/common/ExerciseHeader';
import { SuccessMessage } from '@/components/common/SuccessMessage';
import { EditableField } from '@/components/molds/EditableField';
import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { colors, radii, spacing } from '@/components/ui/theme';
import { useUIString } from '@/hooks/useUIString';
import { scoreImageSelect } from '@/lib/scoring';
import type { ImageSelectContent, MoldProps } from '@/types/molds';

export function ImageSelect({
  exercise,
  onAnswer,
  onNext,
  isAdminMode,
  onContentChange,
}: MoldProps) {
  const { t } = useUIString();
  const base = exercise.content as unknown as ImageSelectContent;
  const [content, setContent] = useState(base);
  const [phase, setPhase] = useState<'idle' | 'result'>('idle');
  const [correct, setCorrect] = useState(false);
  const [picked, setPicked] = useState<number | null>(null);

  const patch = (next: Partial<ImageSelectContent>) => {
    const merged = { ...content, ...next };
    setContent(merged);
    onContentChange?.(merged as Record<string, unknown>);
  };

  const choose = (i: number) => {
    if (phase === 'result') return;
    setPicked(i);
    const ok = scoreImageSelect(content, i);
    setCorrect(ok);
    setPhase('result');
    onAnswer(ok, i);
  };

  return (
    <View style={styles.wrap}>
      <ExerciseHeader moldLabel="Image select" />
      <AudioPlayer audioUrl={content.audio_url_ll ?? null} autoPlay />
      <EditableField
        isAdminMode={isAdminMode}
        value={content.prompt_al}
        multiline
        onCommit={(v) => patch({ prompt_al: v })}
      />
      <View style={styles.grid}>
        {content.options.map((o, i) => (
          <Pressable
            key={`img-${i}`}
            onPress={() => choose(i)}
            disabled={phase === 'result'}
            style={[
              styles.tile,
              phase === 'result' && o.is_correct && styles.tileOk,
              phase === 'result' && picked === i && !o.is_correct && styles.tileBad,
            ]}
          >
            <Text variant="bodyBold" style={styles.tileText}>
              {o.label_ll ?? `Option ${i + 1}`}
            </Text>
          </Pressable>
        ))}
      </View>
      <SuccessMessage visible={phase === 'result' && correct} message={t('lesson.correct')} />
      <ErrorMessage visible={phase === 'result' && !correct} message={t('lesson.wrong')} />
      {phase === 'result' ? (
        <Button
          title={t('common.continue')}
          onPress={() => {
            setPhase('idle');
            setPicked(null);
            onNext();
          }}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.md },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  tile: {
    width: '47%',
    aspectRatio: 1,
    backgroundColor: colors.surfaceLight,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  tileOk: { borderColor: colors.primary },
  tileBad: { borderColor: colors.error },
  tileText: { textAlign: 'center', padding: spacing.sm },
});
