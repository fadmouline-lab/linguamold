import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View, type ViewStyle } from 'react-native';

import { Text } from '@/components/ui/Text';
import { colors, radii, spacing } from '@/components/ui/theme';
import { tap } from '@/lib/haptics';

export type OptionState = 'idle' | 'selected' | 'correct' | 'wrong';

export interface OptionButtonProps {
  label: string;
  onPress: () => void;
  state?: OptionState;
  disabled?: boolean;
  style?: ViewStyle;
}

export function OptionButton({
  label,
  onPress,
  state = 'idle',
  disabled,
  style,
}: OptionButtonProps) {
  const palette = borderForState(state);
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={() => {
        tap();
        onPress();
      }}
      style={({ pressed }) => [
        styles.base,
        { borderColor: palette.border, backgroundColor: palette.bg },
        pressed && styles.pressed,
        style,
      ]}
    >
      {state === 'correct' || state === 'wrong' ? (
        <View style={styles.labelRow}>
          <Ionicons
            name={state === 'correct' ? 'checkmark-circle' : 'close-circle'}
            size={20}
            color={palette.text}
          />
          <Text variant="bodyBold" style={{ color: palette.text, flex: 1 }} numberOfLines={3}>
            {label}
          </Text>
        </View>
      ) : (
        <Text
          variant="bodyBold"
          style={{ color: palette.text }}
          numberOfLines={3}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}

function borderForState(state: OptionState) {
  switch (state) {
    case 'correct':
      return {
        border: colors.primary,
        bg: colors.correctGlow,
        text: colors.primary,
      };
    case 'wrong':
      return {
        border: colors.error,
        bg: colors.errorGlow,
        text: colors.error,
      };
    case 'selected':
      return {
        border: colors.accent,
        bg: colors.surfaceLight,
        text: colors.textPrimary,
      };
    default:
      return {
        border: colors.border,
        bg: colors.surface,
        text: colors.textPrimary,
      };
  }
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.md,
    borderWidth: 2,
    marginBottom: spacing.sm,
  },
  pressed: { opacity: 0.9 },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});
