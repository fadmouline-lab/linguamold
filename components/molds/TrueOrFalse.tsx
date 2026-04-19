import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ExerciseHeader } from '@/components/common/ExerciseHeader';
import { EditableField } from '@/components/molds/EditableField';
import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
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
}: MoldProps) {
  const { t } = useUIString();
  const base = exercise.content as unknown as TrueOrFalseContent;
  const [content, setContent] = useState(base);
  const [phase, setPhase] = useState<'idle' | 'result'>('idle');

  const patch = (next: Partial<TrueOrFalseContent>) => {
    const merged = { ...content, ...next };
    setContent(merged);
    onContentChange?.(merged as Record<string, unknown>);
  };

  const answer = (v: boolean) => {
    if (phase === 'result') return;
    const ok = scoreTrueOrFalse(content, v);
    setPhase('result');
    onAnswer(ok, v);
  };

  return (
    <View style={styles.wrap}>
      <ExerciseHeader moldLabel="True / False" />
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
      {phase === 'result' ? (
        <>
          <Text variant="body">{content.explanation_al}</Text>
          <Button
            title={t('common.continue')}
            onPress={() => {
              setPhase('idle');
              onNext();
            }}
          />
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.lg },
  row: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' },
});
