import { create } from 'zustand';

import type { UserAchievement } from '@/types/index';

export interface GamificationState {
  totalXP: number;
  currentStreak: number;
  longestStreak: number;
  gems: number;
  weeklyXP: number;
  hearts: number;
  heartsLastRegen: string;
  achievements: UserAchievement[];
  leaderboardRank: number | null;
  setFromProfile: (p: {
    total_xp: number;
    current_streak: number;
    longest_streak: number;
    gems: number;
    hearts: number;
    hearts_last_regen: string;
  }) => void;
  setWeeklyXP: (n: number) => void;
  setAchievements: (a: UserAchievement[]) => void;
  setRank: (n: number | null) => void;
}

export const useGamificationStore = create<GamificationState>((set) => ({
  totalXP: 0,
  currentStreak: 0,
  longestStreak: 0,
  gems: 0,
  weeklyXP: 0,
  hearts: 5,
  heartsLastRegen: new Date().toISOString(),
  achievements: [],
  leaderboardRank: null,
  setFromProfile: (p) =>
    set({
      totalXP: p.total_xp,
      currentStreak: p.current_streak,
      longestStreak: p.longest_streak,
      gems: p.gems,
      hearts: p.hearts,
      heartsLastRegen: p.hearts_last_regen,
    }),
  setWeeklyXP: (weeklyXP) => set({ weeklyXP }),
  setAchievements: (achievements) => set({ achievements }),
  setRank: (leaderboardRank) => set({ leaderboardRank }),
}));
