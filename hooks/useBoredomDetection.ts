import { useCallback, useRef, useState } from 'react';

interface BoredomState {
  lessonsThisSession: number;
  shouldOfferChallenge: boolean;
  shouldSuggestBreak: boolean;
}

export function useBoredomDetection() {
  const lessonsRef = useRef(0);
  const [state, setState] = useState<BoredomState>({
    lessonsThisSession: 0,
    shouldOfferChallenge: false,
    shouldSuggestBreak: false,
  });

  const recordLessonComplete = useCallback(() => {
    lessonsRef.current += 1;
    const count = lessonsRef.current;
    setState({
      lessonsThisSession: count,
      shouldOfferChallenge: count === 3,
      shouldSuggestBreak: count >= 5,
    });
  }, []);

  const dismissChallenge = useCallback(() => {
    setState((s) => ({ ...s, shouldOfferChallenge: false }));
  }, []);

  const dismissBreak = useCallback(() => {
    setState((s) => ({ ...s, shouldSuggestBreak: false }));
  }, []);

  const resetSession = useCallback(() => {
    lessonsRef.current = 0;
    setState({ lessonsThisSession: 0, shouldOfferChallenge: false, shouldSuggestBreak: false });
  }, []);

  return { ...state, recordLessonComplete, dismissChallenge, dismissBreak, resetSession };
}
