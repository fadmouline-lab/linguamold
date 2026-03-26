import { type ReactNode, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { colors, radii, spacing, typography } from '@/components/ui/theme';
import { useUIString } from '@/hooks/useUIString';

export interface InlineEditorProps {
  value: string;
  onSave: (next: string) => void;
  fieldPath: string;
  multiline?: boolean;
  adminMode?: boolean;
  children?: ReactNode;
}

export function InlineEditor({
  value,
  onSave,
  multiline,
  adminMode,
  children,
}: InlineEditorProps) {
  const { t } = useUIString();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  if (!adminMode) {
    return <>{children ?? <Text variant="body">{value}</Text>}</>;
  }

  if (editing) {
    return (
      <View style={styles.box}>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          multiline={multiline}
          style={[styles.input, typography.body]}
          placeholderTextColor={colors.textSecondary}
        />
        <View style={styles.row}>
          <Button
            title={t('common.save')}
            onPress={() => {
              onSave(draft);
              setEditing(false);
            }}
          />
          <Button
            title={t('common.cancel')}
            variant="ghost"
            onPress={() => {
              setDraft(value);
              setEditing(false);
            }}
          />
        </View>
      </View>
    );
  }

  return (
    <Pressable onPress={() => setEditing(true)} style={styles.tap}>
      <Text variant="body">{value}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  box: { gap: spacing.sm, borderWidth: 1, borderColor: colors.adminBar, padding: spacing.sm, borderRadius: radii.sm },
  input: {
    color: colors.textPrimary,
    backgroundColor: colors.surfaceLight,
    borderRadius: radii.sm,
    padding: spacing.sm,
    minHeight: 40,
  },
  row: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' },
  tap: { borderWidth: 1, borderColor: colors.adminBar, padding: spacing.xs, borderRadius: radii.sm },
});
