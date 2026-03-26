import { create } from 'zustand';

import type { ExerciseRow } from '@/types/index';

export interface LessonAnswer {
  exerciseId: string;
  isCorrect: boolean;
  answer: unknown;
  timeSpentMs: number;
}

export interface LessonState {
  exercises: ExerciseRow[];
  currentIndex: number;
  answers: LessonAnswer[];
  score: number;
  isComplete: boolean;
  isLoading: boolean;
  hearts: number;
  lessonId: string | null;
  comboStreak: number;
  setLessonId: (id: string | null) => void;
  setExercises: (list: ExerciseRow[]) => void;
  setLoading: (v: boolean) => void;
  setHearts: (n: number) => void;
  pushAnswer: (a: LessonAnswer) => void;
  next: () => void;
  setComplete: (v: boolean) => void;
  reset: () => void;
  setScore: (n: number) => void;
  bumpCombo: () => void;
  resetCombo: () => void;
}

export const useLessonStore = create<LessonState>((set, get) => ({
  exercises: [],
  currentIndex: 0,
  answers: [],
  score: 0,
  isComplete: false,
  isLoading: false,
  hearts: 5,
  lessonId: null,
  comboStreak: 0,
  setLessonId: (lessonId) => set({ lessonId }),
  setExercises: (exercises) =>
    set({
      exercises,
      currentIndex: 0,
      answers: [],
      score: 0,
      isComplete: false,
      comboStreak: 0,
    }),
  setLoading: (isLoading) => set({ isLoading }),
  setHearts: (hearts) => set({ hearts }),
  pushAnswer: (a) => set((s) => ({ answers: [...s.answers, a] })),
  next: () => {
    const { currentIndex, exercises } = get();
    if (currentIndex + 1 >= exercises.length) {
      set({ isComplete: true });
    } else {
      set({ currentIndex: currentIndex + 1 });
    }
  },
  setComplete: (isComplete) => set({ isComplete }),
  reset: () =>
    set({
      exercises: [],
      currentIndex: 0,
      answers: [],
      score: 0,
      isComplete: false,
      isLoading: false,
      lessonId: null,
      comboStreak: 0,
    }),
  setScore: (score) => set({ score }),
  bumpCombo: () => set((s) => ({ comboStreak: s.comboStreak + 1 })),
  resetCombo: () => set({ comboStreak: 0 }),
}));
