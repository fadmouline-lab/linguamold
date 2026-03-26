import { useCallback, useEffect } from 'react';

import type { UserRole } from '@/stores/authStore';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/lib/supabase';

export function useAuth() {
  const {
    user,
    session,
    isLoading,
    isAuthenticated,
    role,
    setSession,
    setLoading,
    setRole,
    reset,
  } = useAuthStore();

  const loadRole = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', userId)
        .maybeSingle();
      if (error) {
        setRole('user');
        return;
      }
      const r = data?.role as UserRole | undefined;
      setRole(r === 'superadmin' ? 'superadmin' : 'user');
    } catch {
      setRole('user');
    }
  }, [setRole]);

  useEffect(() => {
    let mounted = true;
    const init = async () => {
      setLoading(true);
      try {
        const { data } = await supabase.auth.getSession();
        if (!mounted) return;
        setSession(data.session ?? null);
        if (data.session?.user) {
          await loadRole(data.session.user.id);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };
    void init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      setSession(nextSession);
      if (nextSession?.user) {
        await loadRole(nextSession.user.id);
      } else {
        setRole('user');
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [loadRole, setLoading, setRole, setSession]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) throw error;
      setSession(data.session);
      if (data.user) await loadRole(data.user.id);
      return data;
    },
    [loadRole, setSession]
  );

  const signUp = useCallback(
    async (email: string, password: string, displayName: string) => {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { data: { display_name: displayName } },
      });
      if (error) throw error;
      const uid = data.user?.id;
      if (uid) {
        const { error: profileError } = await supabase.from('user_profiles').upsert(
          {
            id: uid,
            display_name: displayName,
            role: 'user',
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'id' }
        );
        if (profileError) throw profileError;
      }
      setSession(data.session);
      if (data.user) await loadRole(data.user.id);
      return data;
    },
    [loadRole, setSession]
  );

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    reset();
  }, [reset]);

  const getSession = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    return data.session;
  }, []);

  return {
    user,
    session,
    isLoading,
    isAuthenticated,
    role,
    signIn,
    signUp,
    signOut,
    getSession,
  };
}
