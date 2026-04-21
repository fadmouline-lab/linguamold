import { create } from 'zustand';

import { APP_STRINGS_FALLBACK } from '@/lib/app-strings-fallback';
import { APP_STRINGS_FR_PRIORITY } from '@/lib/app-strings-fr-priority';

function defaultStrings(): Record<string, string> {
  return { ...APP_STRINGS_FALLBACK, ...APP_STRINGS_FR_PRIORITY };
}

export interface UiStringState {
  strings: Record<string, string>;
  al: string | null;
  isLoaded: boolean;
  setStrings: (al: string, map: Record<string, string>) => void;
  clear: () => void;
}

export const useUiStringStore = create<UiStringState>((set) => ({
  strings: defaultStrings(),
  al: null,
  isLoaded: false,
  setStrings: (al, map) => set({ strings: map, al, isLoaded: true }),
  clear: () => set({ strings: defaultStrings(), al: null, isLoaded: false }),
}));
