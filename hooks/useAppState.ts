import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, type AppStateStatus } from 'react-native';

export function useAppState(onForeground?: (secondsInBackground: number) => void) {
  const [appState, setAppState] = useState<AppStateStatus>(AppState.currentState);
  const backgroundedAt = useRef<number | null>(null);

  const handleChange = useCallback(
    (next: AppStateStatus) => {
      const prev = appState;
      setAppState(next);

      if (prev !== 'active' && next === 'active' && backgroundedAt.current) {
        const seconds = Math.round((Date.now() - backgroundedAt.current) / 1000);
        backgroundedAt.current = null;
        onForeground?.(seconds);
      }

      if (prev === 'active' && next !== 'active') {
        backgroundedAt.current = Date.now();
      }
    },
    [appState, onForeground]
  );

  useEffect(() => {
    const sub = AppState.addEventListener('change', handleChange);
    return () => sub.remove();
  }, [handleChange]);

  return { appState };
}
