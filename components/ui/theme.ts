import { Platform, type TextStyle, type ViewStyle } from 'react-native';

export const colors = {
  primary: '#58CC02',
  error: '#FF4B4B',
  accent: '#FFD900',
  background: '#131F24',
  surface: '#1A2C34',
  surfaceLight: '#233A44',
  textPrimary: '#FFFFFF',
  textSecondary: '#AFAFAF',
  border: '#2A3F4A',
  correctGlow: 'rgba(88, 204, 2, 0.3)',
  errorGlow: 'rgba(255, 75, 75, 0.3)',
  overlay: 'rgba(0,0,0,0.55)',
  adminBar: '#F59E0B',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 48,
} as const;

export const radii = {
  sm: 8,
  md: 12,
  pill: 24,
  full: 9999,
} as const;

export const typography = {
  h1: {
    fontSize: 28,
    fontWeight: '700' as TextStyle['fontWeight'],
    lineHeight: 34,
    color: colors.textPrimary,
  },
  h2: {
    fontSize: 24,
    fontWeight: '700' as TextStyle['fontWeight'],
    lineHeight: 30,
    color: colors.textPrimary,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600' as TextStyle['fontWeight'],
    lineHeight: 26,
    color: colors.textPrimary,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as TextStyle['fontWeight'],
    lineHeight: 22,
    color: colors.textPrimary,
  },
  bodyBold: {
    fontSize: 16,
    fontWeight: '700' as TextStyle['fontWeight'],
    lineHeight: 22,
    color: colors.textPrimary,
  },
  caption: {
    fontSize: 13,
    fontWeight: '400' as TextStyle['fontWeight'],
    lineHeight: 18,
    color: colors.textSecondary,
  },
  button: {
    fontSize: 16,
    fontWeight: '700' as TextStyle['fontWeight'],
    lineHeight: 20,
    letterSpacing: 0.5,
    textTransform: 'uppercase' as TextStyle['textTransform'],
    color: colors.textPrimary,
  },
} as const;

export type TextVariant = keyof typeof typography;

export const shadows = {
  card: Platform.select<ViewStyle>({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
    },
    android: { elevation: 3 },
    default: {},
  }),
  elevated: Platform.select<ViewStyle>({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 8,
    },
    android: { elevation: 4 },
    default: {},
  }),
} as const;
