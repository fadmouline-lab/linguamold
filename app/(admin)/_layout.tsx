import { Stack } from 'expo-router';

import { colors } from '@/components/ui/theme';

export default function AdminLayout() {
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
