import { useEffect, type ReactNode } from 'react';

import { loadAppStrings } from '@/lib/loadAppStrings';
import { supabase } from '@/lib/supabase';

/**
 * Loads localized app strings once per auth session (not per screen).
 * Must sit inside the same tree as navigation after fonts are ready.
 */
export function AppStringsBootstrap({ children }: { children: ReactNode }) {
  useEffect(() => {
    const run = (userId: string | null) => {
      void loadAppStrings(userId);
    };

    void supabase.auth.getSession().then(({ data }) => {
      run(data.session?.user?.id ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      run(session?.user?.id ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return <>{children}</>;
}
