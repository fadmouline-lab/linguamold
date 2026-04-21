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
import { button3D, colors, radii, spacing } from '@/components/ui/theme';
import { tap } from '@/lib/haptics';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'correct' | 'wrong';

export interface ButtonProps extends Omit<PressableProps, 'style'> {
  title: string;
  variant?: ButtonVariant;
  loading?: boolean;
  haptic?: boolean;
  style?: import('react-native').StyleProp<import('react-native').ViewStyle>;
}

const SPRING_CONFIG = { damping: 15, stiffness: 150 };

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
  const pressed = useSharedValue(0);
  const has3D = variant !== 'outline' && variant !== 'ghost';
  const palette = paletteForVariant(variant);
  const isDisabled = Boolean(disabled || loading);

  // Outer animated view: holds the 3D bottom border (not overflow-clipped)
  const outerAnimStyle = useAnimatedStyle(() => ({
    borderBottomWidth: has3D
      ? withSpring(pressed.value === 1 ? 0 : 4, SPRING_CONFIG)
      : 0,
    marginBottom: has3D
      ? withSpring(pressed.value === 1 ? 4 : 0, SPRING_CONFIG)
      : 0,
  }));

  // Inner animated view: scale + press-down shift
  const innerAnimStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: withSpring(pressed.value === 1 ? 0.97 : 1, SPRING_CONFIG) },
    ],
  }));

  const handlePressIn = useCallback(
    (e: Parameters<NonNullable<PressableProps['onPressIn']>>[0]) => {
      pressed.value = 1;
      onPressIn?.(e);
    },
    [onPressIn, pressed]
  );

  const handlePressOut = useCallback(
    (e: Parameters<NonNullable<PressableProps['onPressOut']>>[0]) => {
      pressed.value = 0;
      onPressOut?.(e);
    },
    [onPressOut, pressed]
  );

  const handlePress = useCallback(
    (e: Parameters<NonNullable<PressableProps['onPress']>>[0]) => {
      if (haptic && !disabled && !loading) {
        tap();
      }
      onPress?.(e);
    },
    [disabled, haptic, loading, onPress]
  );

  return (
    <Animated.View
      style={[
        styles.outer,
        {
          borderRadius: radii.sm,
          borderBottomColor: palette.bottomColor,
          opacity: isDisabled ? 0.5 : 1,
        },
        outerAnimStyle,
        style,
      ]}
    >
      <Pressable
        accessibilityRole="button"
        {...rest}
        disabled={isDisabled}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          styles.pressable,
          {
            backgroundColor: palette.backgroundColor,
            borderRadius: radii.sm,
          },
          variant === 'outline' ? styles.outline : null,
        ]}
      >
        <Animated.View style={[styles.inner, innerAnimStyle]}>
          {loading ? (
            <ActivityIndicator color={palette.textColor} />
          ) : (
            <Text variant="button" style={{ color: palette.textColor }}>
              {title}
            </Text>
          )}
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

function paletteForVariant(variant: ButtonVariant) {
  switch (variant) {
    case 'secondary':
      return {
        backgroundColor: colors.surfaceLight,
        textColor: colors.textPrimary,
        bottomColor: button3D.secondaryBottom,
      };
    case 'outline':
      return {
        backgroundColor: 'transparent' as const,
        textColor: colors.primary,
        bottomColor: 'transparent' as const,
      };
    case 'ghost':
      return {
        backgroundColor: 'transparent' as const,
        textColor: colors.textSecondary,
        bottomColor: 'transparent' as const,
      };
    case 'correct':
      return {
        backgroundColor: colors.success,
        textColor: '#FFFFFF',
        bottomColor: button3D.correctBottom,
      };
    case 'wrong':
      return {
        backgroundColor: colors.error,
        textColor: '#FFFFFF',
        bottomColor: button3D.errorBottom,
      };
    default: // primary
      return {
        backgroundColor: colors.primary,
        textColor: '#FFFFFF',
        bottomColor: button3D.primaryBottom,
      };
  }
}

const styles = StyleSheet.create({
  outer: {
    borderBottomWidth: 4,
  },
  pressable: {
    overflow: 'hidden',
  },
  inner: {
    minHeight: 48,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outline: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
});
