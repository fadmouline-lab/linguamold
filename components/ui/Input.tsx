import {
  StyleSheet,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';

import { Text } from '@/components/ui/Text';
import { colors, radii, spacing, typography } from '@/components/ui/theme';

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export function Input({ label, error, style, ...rest }: InputProps) {
  return (
    <View style={styles.wrap}>
      {label ? (
        <Text variant="caption" style={styles.label}>
          {label}
        </Text>
      ) : null}
      <TextInput
        placeholderTextColor={colors.textSecondary}
        {...rest}
        style={[
          styles.input,
          typography.body,
          error ? styles.inputError : null,
          style,
        ]}
      />
      {error ? (
        <Text variant="caption" style={styles.errorText}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.xs, width: '100%' },
  label: { color: colors.textSecondary },
  input: {
    backgroundColor: colors.surfaceLight,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.textPrimary,
  },
  inputError: { borderColor: colors.error },
  errorText: { color: colors.error, marginTop: spacing.xs },
});
