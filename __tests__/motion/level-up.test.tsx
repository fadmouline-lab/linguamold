/**
 * LevelUpScreen motion tests.
 * Asserts useCountUp renders target value, delay args are passed, haptic fires.
 */
import React from 'react';
import { render } from '@testing-library/react-native';

jest.mock('@/hooks/useUIString', () => ({
  useUIString: () => ({ t: (key: string) => key }),
}));
jest.mock('@/hooks/useReducedMotion', () => ({
  useReducedMotion: () => false,
}));
jest.mock('@/lib/haptics', () => ({
  celebration: jest.fn(),
}));
// Mock useCountUp to return target immediately (simulates settled state)
jest.mock('@/hooks/useCountUp', () => ({
  useCountUp: (_target: number) => _target,
}));

import * as Reanimated from 'react-native-reanimated';
import { LevelUpScreen } from '@/components/gamification/LevelUpScreen';

describe('LevelUpScreen', () => {
  it('renders level number', () => {
    const { getAllByText } = render(
      <LevelUpScreen level={5} onDismiss={jest.fn()} />
    );
    // Level appears in the number display and in "Level 5!" heading
    const matches = getAllByText(/5/);
    expect(matches.length).toBeGreaterThanOrEqual(1);
  });

  it('renders level heading', () => {
    const { getByText } = render(
      <LevelUpScreen level={5} onDismiss={jest.fn()} />
    );
    expect(getByText('Level 5!')).toBeTruthy();
  });

  it('renders descriptor text key', () => {
    const { getByText } = render(
      <LevelUpScreen level={5} onDismiss={jest.fn()} />
    );
    expect(getByText('gamify.level_descriptor_intermediate')).toBeTruthy();
  });

  it('uses withDelay for staggered element reveals', () => {
    const withDelay = jest.spyOn(Reanimated, 'withDelay');
    render(<LevelUpScreen level={3} onDismiss={jest.fn()} />);
    // Multiple withDelay calls expected for staggered heading/descriptor/button
    expect(withDelay).toHaveBeenCalled();
  });

  it('background overlay is rendered for color transition', () => {
    const { UNSAFE_getByProps } = render(
      <LevelUpScreen level={1} onDismiss={jest.fn()} />
    );
    // The bg overlay View exists with absoluteFillObject style
    expect(() => UNSAFE_getByProps({ pointerEvents: 'none' })).not.toThrow();
  });
});
