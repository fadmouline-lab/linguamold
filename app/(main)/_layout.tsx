import { Ionicons } from '@expo/vector-icons';
import { Tabs, useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { colors, spacing } from '@/components/ui/theme';
import { useAuth } from '@/hooks/useAuth';
import { useUIString } from '@/hooks/useUIString';

export default function MainLayout() {
  const { t } = useUIString();
  const router = useRouter();
  const { role } = useAuth();
  const isSa = role === 'superadmin';

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.textPrimary,
        headerTitleStyle: { fontWeight: '700' },
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: t('nav.home'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" color={color} size={size} />
          ),
          headerRight: () =>
            isSa ? (
              <Pressable
                onPress={() => router.push('/(admin)/')}
                style={styles.headerBtn}
              >
                <Text variant="caption" style={styles.headerBtnText}>
                  Admin
                </Text>
              </Pressable>
            ) : (
              <View />
            ),
        }}
      />
      <Tabs.Screen
        name="leaderboard"
        options={{
          title: t('nav.leaderboard'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="trophy" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('nav.profile'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="browse"
        options={{
          title: t('nav.browse'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="grid" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="shop"
        options={{
          href: null,
          title: t('nav.shop'),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  headerBtn: { marginRight: spacing.md, padding: spacing.xs },
  headerBtnText: { color: colors.accent },
});
