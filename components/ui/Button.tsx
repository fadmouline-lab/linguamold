import * as Haptics from 'expo-haptics';
import { useCallback } from 'react';
import {
  ActivityIndicator,
  Pressable,
  type PressableProps,
  StyleSheet,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { Text } from '@/components/ui/Text';
import { colors, radii, spacing } from '@/components/ui/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';

export interface ButtonProps extends Omit<PressableProps, 'children'> {
  title: string;
  variant?: ButtonVariant;
  loading?: boolean;
  haptic?: boolean;
}

export function Button({
  title,
  variant = 'primary',
  loading,
  disabled,
  haptic = true,
  onPressIn,
  onPressOut,
  onPress,
  style,
  ...rest
}: ButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(
    (e: Parameters<NonNullable<PressableProps['onPressIn']>>[0]) => {
      scale.value = withSpring(0.97, { damping: 15, stiffness: 400 });
      onPressIn?.(e);
    },
    [onPressIn, scale]
  );

  const handlePressOut = useCallback(
    (e: Parameters<NonNullable<PressableProps['onPressOut']>>[0]) => {
      scale.value = withSpring(1, { damping: 15, stiffness: 400 });
      onPressOut?.(e);
    },
    [onPressOut, scale]
  );

  const handlePress = useCallback(
    (e: Parameters<NonNullable<PressableProps['onPress']>>[0]) => {
      if (haptic && !disabled && !loading) {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      onPress?.(e);
    },
    [disabled, haptic, loading, onPress]
  );

  const palette = stylesForVariant(variant);
  const isDisabled = Boolean(disabled || loading);

  return (
    <AnimatedPressable
      accessibilityRole="button"
      {...rest}
      disabled={isDisabled}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.base,
        palette.container,
        isDisabled && styles.disabled,
        animatedStyle,
        style,
      ]}
    >
      <View style={styles.inner}>
        {loading ? (
          <ActivityIndicator color={palette.indicatorColor} />
        ) : (
          <Text variant="button" style={[styles.label, { color: palette.textColor }]}>
            {title}
          </Text>
        )}
      </View>
    </AnimatedPressable>
  );
}

function stylesForVariant(variant: ButtonVariant) {
  switch (variant) {
    case 'secondary':
      return {
        container: {
          backgroundColor: colors.surfaceLight,
          borderWidth: 1,
          borderColor: colors.border,
        },
        textColor: colors.textPrimary,
        indicatorColor: colors.textPrimary,
      };
    case 'outline':
      return {
        container: {
          backgroundColor: 'transparent',
          borderWidth: 2,
          borderColor: colors.primary,
        },
        textColor: colors.primary,
        indicatorColor: colors.primary,
      };
    case 'ghost':
      return {
        container: { backgroundColor: 'transparent' },
        textColor: colors.textSecondary,
        indicatorColor: colors.textSecondary,
      };
    default:
      return {
        container: { backgroundColor: colors.primary },
        textColor: colors.textPrimary,
        indicatorColor: colors.textPrimary,
      };
  }
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radii.sm,
    overflow: 'hidden',
  },
  inner: {
    minHeight: 48,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    textTransform: 'uppercase',
  },
  disabled: { opacity: 0.5 },
});
