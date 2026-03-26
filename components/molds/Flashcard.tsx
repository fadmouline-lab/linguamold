import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { AudioPlayer } from '@/components/common/AudioPlayer';
import { ExerciseHeader } from '@/components/common/ExerciseHeader';
import { EditableField } from '@/components/molds/EditableField';
import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { colors, radii, spacing } from '@/components/ui/theme';
import { useUIString } from '@/hooks/useUIString';
import { scoreFlashcard } from '@/lib/scoring';
import type { FlashcardContent, MoldProps } from '@/types/molds';

export function Flashcard({
  exercise,
  onAnswer,
  onNext,
  isAdminMode,
  onContentChange,
}: MoldProps) {
  const { t } = useUIString();
  const base = exercise.content as unknown as FlashcardContent;
  const [content, setContent] = useState(base);
  const [showBack, setShowBack] = useState(false);

  const patch = (next: Partial<FlashcardContent>) => {
    const merged = { ...content, ...next };
    setContent(merged);
    onContentChange?.(merged as Record<string, unknown>);
  };

  const finish = () => {
    onAnswer(scoreFlashcard(), true);
    onNext();
  };

  return (
    <View style={styles.wrap}>
      <ExerciseHeader moldLabel="Flashcard" />
      <Pressable onPress={() => setShowBack((s) => !s)} style={styles.cardArea}>
        {showBack ? (
          <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.inner}>
            <EditableField
              isAdminMode={isAdminMode}
              value={content.translation_al}
              onCommit={(v) => patch({ translation_al: v })}
            />
            <EditableField
              isAdminMode={isAdminMode}
              value={content.example_ll}
              multiline
              onCommit={(v) => patch({ example_ll: v })}
            />
            <EditableField
              isAdminMode={isAdminMode}
              value={content.example_al}
              multiline
              onCommit={(v) => patch({ example_al: v })}
            />
            <AudioPlayer audioUrl={content.audio_url_ll ?? null} />
          </Animated.View>
        ) : (
          <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.inner}>
            <EditableField
              isAdminMode={isAdminMode}
              value={content.word_ll}
              onCommit={(v) => patch({ word_ll: v })}
            />
            {content.pronunciation_ll ? (
              <Text variant="caption">{content.pronunciation_ll}</Text>
            ) : null}
            <Text variant="caption">{t('lesson.progress')}</Text>
          </Animated.View>
        )}
      </Pressable>
      <View style={styles.row}>
        <Button title={t('exercise.self_correct')} onPress={() => finish()} />
        <Button
          title={t('exercise.self_practice')}
          variant="secondary"
          onPress={() => finish()}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.md },
  cardArea: {
    minHeight: 220,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.lg,
  },
  inner: { gap: spacing.sm },
  row: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' },
});
