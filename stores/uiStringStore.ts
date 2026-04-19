import { create } from 'zustand';

export interface UiStringState {
  strings: Record<string, string>;
  al: string | null;
  isLoaded: boolean;
  setStrings: (al: string, map: Record<string, string>) => void;
  clear: () => void;
}

export const useUiStringStore = create<UiStringState>((set) => ({
  strings: {},
  al: null,
  isLoaded: false,
  setStrings: (al, map) => set({ strings: map, al, isLoaded: true }),
  clear: () => set({ strings: {}, al: null, isLoaded: false }),
}));
