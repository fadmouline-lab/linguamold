import { Stack, useRouter } from 'expo-router';
import { useEffect } from 'react';

import { colors } from '@/components/ui/theme';
import { useAuth } from '@/hooks/useAuth';

export default function AdminLayout() {
  const router = useRouter();
  const { isAuthenticated, isLoading, role } = useAuth();

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || role !== 'superadmin')) {
      router.replace('/(auth)/login');
    }
  }, [isAuthenticated, isLoading, role, router]);

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: colors.adminBar },
        headerTintColor: colors.background,
        contentStyle: { backgroundColor: colors.background },
      }}
    />
  );
}
