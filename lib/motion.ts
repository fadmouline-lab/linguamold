import { Dimensions, Platform } from 'react-native';

export const TIMING = {
  instant:  100,
  fast:     200,
  normal:   350,
  slow:     600,
  dramatic: 1000,
} as const;

// Spring sub-configs (damping + stiffness, no mass) — spread into withSpring()
export const EASING = {
  spring:   { damping: 15, stiffness: 120 },
  gentle:   { damping: 20, stiffness: 100 },
  snappy:   { damping: 12, stiffness: 200 },
  dramatic: { damping: 8,  stiffness: 80  },
} as const;

// Full spring configs (with mass) — for withSpring() on celebration/card animations
export const SPRING = {
  button:      { mass: 1,   damping: 15, stiffness: 200 },
  card:        { mass: 1.2, damping: 18, stiffness: 100 },
  celebration: { mass: 1.5, damping: 10, stiffness: 120 },
} as const;

export type DeviceTier = 'high' | 'mid' | 'low';

// Stub — enhanced in M4.1 with expo-device RAM detection
export function getDeviceTier(): DeviceTier {
  if (Platform.OS === 'ios') return 'high';
  const { width, height } = Dimensions.get('screen');
  const pixels = width * height;
  if (pixels > 2073600) return 'high';
  if (pixels > 921600) return 'mid';
  return 'low';
}

// Guard for screen-level transitions only (not decorative animations)
// Set to true during SlideInRight mold entrance; decorative motion never reads this
let _isTransitioning = false;

export const transitionGuard = {
  start(): void { _isTransitioning = true; },
  end():   void { _isTransitioning = false; },
  get isActive(): boolean { return _isTransitioning; },
} as const;
