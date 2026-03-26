import { create } from 'zustand';

import type { Session, User } from '@supabase/supabase-js';

export type UserRole = 'user' | 'superadmin';

export interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  role: UserRole;
  setSession: (session: Session | null) => void;
  setLoading: (loading: boolean) => void;
  setRole: (role: UserRole) => void;
  reset: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  isLoading: true,
  isAuthenticated: false,
  role: 'user',
  setSession: (session) =>
    set({
      session,
      user: session?.user ?? null,
      isAuthenticated: Boolean(session?.user),
    }),
  setLoading: (isLoading) => set({ isLoading }),
  setRole: (role) => set({ role }),
  reset: () =>
    set({
      user: null,
      session: null,
      isLoading: false,
      isAuthenticated: false,
      role: 'user',
    }),
}));
