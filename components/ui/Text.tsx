import { I18nManager, Text as RNText, type TextProps as RNTextProps } from 'react-native';

import { typography, type TextVariant } from '@/components/ui/theme';

export interface ThemedTextProps extends RNTextProps {
  variant?: TextVariant;
  color?: string;
}

export function Text({
  variant = 'body',
  style,
  color,
  children,
  ...rest
}: ThemedTextProps) {
  const base = typography[variant];
  const writingDirection = I18nManager.isRTL ? 'rtl' : 'ltr';
  return (
    <RNText
      {...rest}
      style={[base, color ? { color } : null, { writingDirection }, style]}
    >
      {children}
    </RNText>
  );
}
