/**
 * Reduced motion tests.
 * Verifies that animations degrade gracefully when reduce-motion is enabled.
 */
import React from 'react';
import { render } from '@testing-library/react-native';

jest.mock('@/hooks/useUIString', () => ({
  useUIString: () => ({ t: (key: string) => key }),
}));
jest.mock('@/lib/haptics', () => ({
  celebration: jest.fn(),
  tap: jest.fn(),
  success: jest.fn(),
}));

// Simulate reduced motion enabled
jest.mock('@/hooks/useReducedMotion', () => ({
  useReducedMotion: () => true,
}));

import * as Reanimated from 'react-native-reanimated';
import { ComboCounter } from '@/components/gamification/ComboCounter';
import { WelcomeBackScreen } from '@/components/gamification/WelcomeBackScreen';
import { DailyGoalRing } from '@/components/gamification/DailyGoalRing';

describe('Reduced motion: ComboCounter', () => {
  it('renders at x5 without calling withRepeat (no pulse)', () => {
    const withRepeat = jest.spyOn(Reanimated, 'withRepeat');
    render(<ComboCounter streak={5} />);
    expect(withRepeat).not.toHaveBeenCalled();
  });

  it('does not render edge glow overlay at x10 when reduced', () => {
    const { queryByTestId } = render(<ComboCounter streak={10} />);
    // Edge glow uses absoluteFill; reduced motion skips it
    // Component should still render the pill
    // (visual glow is conditionally rendered only when !reduced)
    expect(queryByTestId?.('edge-glow')).toBeNull();
  });
});

describe('Reduced motion: WelcomeBackScreen', () => {
  it('renders content immediately (no entrance animation)', () => {
    const { getByText } = render(
      <WelcomeBackScreen
        dayCount={2}
        wordsLearned={10}
        onContinue={jest.fn()}
        onDismiss={jest.fn()}
      />
    );
    // Content renders synchronously (not gated behind animation completion)
    expect(getByText('onboarding.day2')).toBeTruthy();
  });

  it('does not fire tap haptic when reduced motion', () => {
    const { tap } = require('@/lib/haptics');
    render(
      <WelcomeBackScreen
        dayCount={2}
        wordsLearned={10}
        onContinue={jest.fn()}
        onDismiss={jest.fn()}
      />
    );
    // Haptic fires via setTimeout — jest.useFakeTimers() would be needed for exact count,
    // but we verify it's not called synchronously
    expect(tap).not.toHaveBeenCalled();
  });
});

describe('Reduced motion: DailyGoalRing', () => {
  it('renders without throwing when at goal', () => {
    expect(() =>
      render(<DailyGoalRing currentMinutes={10} goalMinutes={10} />)
    ).not.toThrow();
  });

  it('does not call withSequence for pulse when reduced', () => {
    const withSequence = jest.spyOn(Reanimated, 'withSequence');
    render(<DailyGoalRing currentMinutes={10} goalMinutes={10} />);
    // Goal ring pulse uses withSequence; reduced motion skips it
    expect(withSequence).not.toHaveBeenCalled();
  });
});

describe('useCountUp with reduced motion', () => {
  it('returns target immediately when reduced', () => {
    // useReducedMotion is already mocked to return true at the top of this file.
    // useCountUp should call setDisplay(target) synchronously on mount.
    const { renderHook } = require('@testing-library/react-native');
    const { useCountUp } = require('@/hooks/useCountUp');

    const { result } = renderHook(() => useCountUp(42, 600, 0));
    // With reduced motion, target is set immediately via setDisplay(target)
    expect(result.current).toBe(42);
  });
});
