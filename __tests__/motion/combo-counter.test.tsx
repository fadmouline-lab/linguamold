/**
 * ComboCounter motion tests.
 * Reanimated mock collapses animations to final values synchronously.
 * Tests assert delay arguments and rendering conditions, not timing.
 */
import React from 'react';
import { render } from '@testing-library/react-native';

// Mock external dependencies
jest.mock('@/hooks/useUIString', () => ({
  useUIString: () => ({ t: (key: string) => key }),
}));
jest.mock('@/hooks/useReducedMotion', () => ({
  useReducedMotion: () => false,
}));
jest.mock('@/lib/haptics', () => ({
  celebration: jest.fn(),
}));

import * as Reanimated from 'react-native-reanimated';
import { ComboCounter } from '@/components/gamification/ComboCounter';

describe('ComboCounter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders nothing when streak < 3', () => {
    const { queryByText } = render(<ComboCounter streak={0} />);
    expect(queryByText(/x0/)).toBeNull();
  });

  it('renders pill with streak count at x3', () => {
    const { getByText } = render(<ComboCounter streak={3} />);
    expect(getByText('🔥 x3')).toBeTruthy();
  });

  it('shows combo label at x5', () => {
    const { getByText } = render(<ComboCounter streak={5} />);
    expect(getByText('gamify.combo_5')).toBeTruthy();
  });

  it('shows combo label at x10', () => {
    const { getByText } = render(<ComboCounter streak={10} />);
    expect(getByText('gamify.combo_10')).toBeTruthy();
  });

  it('fires celebration haptic when streak reaches 5', () => {
    const { celebration } = require('@/lib/haptics');
    render(<ComboCounter streak={5} />);
    expect(celebration).toHaveBeenCalledTimes(1);
  });

  it('fires celebration haptic when streak reaches 10', () => {
    const { celebration } = require('@/lib/haptics');
    render(<ComboCounter streak={10} />);
    expect(celebration).toHaveBeenCalledTimes(1);
  });

  it('uses withRepeat for pulse animation at x5 (calls reanimated functions)', () => {
    const withRepeat = jest.spyOn(Reanimated, 'withRepeat');
    render(<ComboCounter streak={5} />);
    expect(withRepeat).toHaveBeenCalled();
  });
});
