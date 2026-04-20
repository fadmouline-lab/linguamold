import { create } from 'zustand';

import type { ExerciseRow } from '@/types/index';

export interface LessonAnswer {
  exerciseId: string;
  isCorrect: boolean;
  answer: unknown;
  timeSpentMs: number;
  isReview?: boolean;
  isSkipped?: boolean;
  hintsUsed?: number;
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
  // UX Feedback: reviewQueue (separate from exercises array per review fix #1)
  reviewQueue: ExerciseRow[];
  requeueCount: Map<string, number>;
  skipCount: number;
  isReviewExercise: boolean;
  lastWasWrong: boolean;
  soundEnabled: boolean;
  // Practice/review mode (hearts-zero recovery)
  practiceMode: boolean;
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
  // UX Feedback additions
  enqueueForReview: (exercise: ExerciseRow) => void;
  popReviewExercise: () => ExerciseRow | null;
  incrementSkip: () => void;
  setLastWasWrong: (v: boolean) => void;
  setSoundEnabled: (v: boolean) => void;
  setPracticeMode: (v: boolean) => void;
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
  reviewQueue: [],
  requeueCount: new Map(),
  skipCount: 0,
  isReviewExercise: false,
  lastWasWrong: false,
  soundEnabled: true,
  practiceMode: false,
  setLessonId: (lessonId) => set({ lessonId }),
  setExercises: (exercises) =>
    set({
      exercises,
      currentIndex: 0,
      answers: [],
      score: 0,
      isComplete: false,
      comboStreak: 0,
      reviewQueue: [],
      requeueCount: new Map(),
      skipCount: 0,
      isReviewExercise: false,
      lastWasWrong: false,
      practiceMode: false,
    }),
  setLoading: (isLoading) => set({ isLoading }),
  setHearts: (hearts) => set({ hearts }),
  pushAnswer: (a) => set((s) => ({ answers: [...s.answers, a] })),
  next: () => {
    const { currentIndex, exercises, reviewQueue } = get();
    // Every 4th exercise, pop from review queue if available
    const shouldReview = reviewQueue.length > 0 && (currentIndex + 1) % 4 === 3;
    if (shouldReview) {
      const reviewEx = reviewQueue[0]!;
      set({
        reviewQueue: reviewQueue.slice(1),
        isReviewExercise: true,
      });
      // Replace the current exercise temporarily for the review
      const updated = [...exercises];
      updated.splice(currentIndex + 1, 0, reviewEx);
      set({ exercises: updated, currentIndex: currentIndex + 1 });
    } else if (currentIndex + 1 >= exercises.length) {
      // If there are still review items, serve them at end
      if (reviewQueue.length > 0) {
        const reviewEx = reviewQueue[0]!;
        set({
          reviewQueue: reviewQueue.slice(1),
          isReviewExercise: true,
        });
        const updated = [...exercises, reviewEx];
        set({ exercises: updated, currentIndex: currentIndex + 1 });
      } else {
        set({ isComplete: true });
      }
    } else {
      set({ currentIndex: currentIndex + 1, isReviewExercise: false });
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
      reviewQueue: [],
      requeueCount: new Map(),
      skipCount: 0,
      isReviewExercise: false,
      lastWasWrong: false,
      practiceMode: false,
    }),
  setScore: (score) => set({ score }),
  bumpCombo: () => set((s) => ({ comboStreak: s.comboStreak + 1 })),
  resetCombo: () => set({ comboStreak: 0 }),
  enqueueForReview: (exercise) => {
    const { requeueCount, reviewQueue } = get();
    const count = requeueCount.get(exercise.id) ?? 0;
    if (count >= 2) return; // max 2 re-queues per exercise
    const newMap = new Map(requeueCount);
    newMap.set(exercise.id, count + 1);
    set({ reviewQueue: [...reviewQueue, exercise], requeueCount: newMap });
  },
  popReviewExercise: () => {
    const { reviewQueue } = get();
    if (reviewQueue.length === 0) return null;
    const ex = reviewQueue[0]!;
    set({ reviewQueue: reviewQueue.slice(1) });
    return ex;
  },
  incrementSkip: () => set((s) => ({ skipCount: s.skipCount + 1 })),
  setLastWasWrong: (lastWasWrong) => set({ lastWasWrong }),
  setSoundEnabled: (soundEnabled) => set({ soundEnabled }),
  setPracticeMode: (practiceMode) => set({ practiceMode }),
}));
