import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { useUIString } from '@/hooks/useUIString';
import { colors, radii, spacing, typography } from '@/components/ui/theme';

export interface EditableFieldProps {
  value: string;
  isAdminMode?: boolean;
  onCommit: (next: string) => void;
  multiline?: boolean;
}

export function EditableField({
  value,
  isAdminMode,
  onCommit,
  multiline,
}: EditableFieldProps) {
  const { t } = useUIString();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  if (!isAdminMode) {
    return (
      <Text variant="body" style={styles.text}>
        {value}
      </Text>
    );
  }

  if (editing) {
    return (
      <View style={styles.editWrap}>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          multiline={multiline}
          style={[styles.input, typography.body, multiline && styles.inputMulti]}
          placeholderTextColor={colors.textSecondary}
        />
        <View style={styles.row}>
          <Button
            title={t('common.save')}
            variant="primary"
            onPress={() => {
              onCommit(draft);
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
  text: { flexShrink: 1 },
  tap: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.adminBar,
    borderRadius: radii.sm,
    padding: spacing.sm,
  },
  editWrap: { gap: spacing.sm },
  input: {
    backgroundColor: colors.surfaceLight,
    color: colors.textPrimary,
    borderRadius: radii.sm,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  inputMulti: { minHeight: 80, textAlignVertical: 'top' },
  row: { flexDirection: 'row', gap: spacing.sm },
});
