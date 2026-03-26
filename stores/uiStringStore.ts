import { create } from 'zustand';

export interface UiStringState {
  strings: Record<string, string>;
  languageId: string | null;
  isLoaded: boolean;
  setStrings: (languageId: string, map: Record<string, string>) => void;
  clear: () => void;
}

export const useUiStringStore = create<UiStringState>((set) => ({
  strings: {},
  languageId: null,
  isLoaded: false,
  setStrings: (languageId, map) =>
    set({ strings: map, languageId, isLoaded: true }),
  clear: () => set({ strings: {}, languageId: null, isLoaded: false }),
}));
