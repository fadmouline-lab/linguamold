import { Platform, type TextStyle, type ViewStyle } from 'react-native';

export const fonts = {
  display: 'CabinetGrotesk-ExtraBold',
  displayBold: 'CabinetGrotesk-Bold',
  displayMedium: 'CabinetGrotesk-Medium',
  body: 'DMSans-Regular',
  bodyMedium: 'DMSans-Medium',
  bodySemiBold: 'DMSans-SemiBold',
  bodyBold: 'DMSans-Bold',
} as const;

export const colors = {
  // Backgrounds
  background:    '#FAFAF7',   // warm cream
  surface:       '#FFFFFF',
  surfaceLight:  '#F4F2ED',   // pressed states, locked nodes, alt rows

  // Primary — deep sky teal
  primary:       '#0891B2',
  primaryDark:   '#066E8A',   // 3D button shadow
  primaryLight:  '#E0F2FE',   // tinted backgrounds, selected states

  // Accent — warm amber (XP, gems, completed nodes)
  accent:        '#F59E0B',
  accentDark:    '#D97706',   // 3D button shadow
  accentLight:   '#FEF3C7',

  // Semantic
  success:       '#16A34A',
  successLight:  '#DCFCE7',
  error:         '#EF4444',
  errorLight:    '#FEE2E2',

  // Text
  textPrimary:   '#1C1917',   // warm near-black
  textSecondary: '#78716C',
  textFaint:     '#A8A29E',   // placeholders, disabled

  // Borders
  border:        '#E7E5E0',
  borderStrong:  '#D6D3CE',

  // Gamification UI
  adminBar:      '#F59E0B',

  // Overlays / glows
  overlay:       'rgba(28, 25, 23, 0.5)',
  correctGlow:   'rgba(22, 163, 74, 0.25)',
  errorGlow:     'rgba(239, 68, 68, 0.25)',
} as const;

export const button3D = {
  primaryBottom:  '#066E8A',
  secondaryBottom:'#D6D3CE',
  correctBottom:  '#15803D',
  errorBottom:    '#B91C1C',
  accentBottom:   '#D97706',
} as const;

export const glows = {
  primary: 'rgba(8, 145, 178, 0.35)',
  error:   'rgba(239, 68, 68, 0.35)',
  accent:  'rgba(245, 158, 11, 0.35)',
} as const;

export const spacing = {
  xxs:  2,
  xs:   4,
  sm:   8,
  md:   12,
  lg:   16,
  xl:   20,
  xxl:  24,
  xxxl: 32,
  huge: 48,
  max:  64,
} as const;

export const radii = {
  xs:   8,    // tags, small chips
  sm:   12,   // inputs, small buttons
  md:   16,   // standard buttons, cards
  lg:   20,   // large cards, bottom sheets
  xl:   28,
  pill: 999,
  full: 9999,
} as const;

export const typography = {
  display: {
    fontSize: 32,
    fontFamily: fonts.display,
    lineHeight: 36,
    letterSpacing: -0.5,
    color: colors.textPrimary,
  } as TextStyle,
  h1: {
    fontSize: 28,
    fontFamily: fonts.display,
    lineHeight: 34,
    letterSpacing: -0.3,
    color: colors.textPrimary,
  } as TextStyle,
  h2: {
    fontSize: 22,
    fontFamily: fonts.displayBold,
    lineHeight: 28,
    color: colors.textPrimary,
  } as TextStyle,
  h3: {
    fontSize: 18,
    fontFamily: fonts.displayBold,
    lineHeight: 24,
    color: colors.textPrimary,
  } as TextStyle,
  body: {
    fontSize: 16,
    fontFamily: fonts.body,
    lineHeight: 22,
    color: colors.textPrimary,
  } as TextStyle,
  bodyBold: {
    fontSize: 16,
    fontFamily: fonts.bodyBold,
    lineHeight: 22,
    color: colors.textPrimary,
  } as TextStyle,
  label: {
    fontSize: 14,
    fontFamily: fonts.bodySemiBold,
    lineHeight: 20,
    color: colors.textPrimary,
  } as TextStyle,
  caption: {
    fontSize: 12,
    fontFamily: fonts.bodyMedium,
    lineHeight: 16,
    color: colors.textSecondary,
  } as TextStyle,
  micro: {
    fontSize: 11,
    fontFamily: fonts.bodyBold,
    lineHeight: 14,
    letterSpacing: 0.02,
    color: colors.textSecondary,
  } as TextStyle,
  button: {
    fontSize: 16,
    fontFamily: fonts.bodyBold,
    lineHeight: 20,
    letterSpacing: 0.2,
    color: colors.textPrimary,
  } as TextStyle,
  score: {
    fontSize: 36,
    fontFamily: fonts.display,
    lineHeight: 40,
    letterSpacing: -0.5,
    color: colors.textPrimary,
  } as TextStyle,
} as const;

export type TextVariant = keyof typeof typography;

export const shadows = {
  card: Platform.select<ViewStyle>({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
    },
    android: { elevation: 2 },
    default: {},
  }),
  elevated: Platform.select<ViewStyle>({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
    },
    android: { elevation: 4 },
    default: {},
  }),
  glow: {
    primary: Platform.select<ViewStyle>({
      ios: {
        shadowColor: '#0891B2',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 14,
      },
      android: { elevation: 8 },
      default: {},
    }),
    accent: Platform.select<ViewStyle>({
      ios: {
        shadowColor: '#F59E0B',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 14,
      },
      android: { elevation: 8 },
      default: {},
    }),
  },
} as const;
