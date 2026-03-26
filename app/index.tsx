import AsyncStorage from '@react-native-async-storage/async-storage';
import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { colors } from '@/components/ui/theme';
import { useAuth } from '@/hooks/useAuth';
import { useLanguagePair } from '@/hooks/useLanguagePair';

const PROF_KEY = 'linguamold.proficiency_onboarded';

export default function Index() {
  const { isLoading, isAuthenticated } = useAuth();
  const { currentLL, loading: pairLoading } = useLanguagePair();
  const [profDone, setProfDone] = useState<boolean | null>(null);

  useEffect(() => {
    let alive = true;
    AsyncStorage.getItem(PROF_KEY).then((v) => {
      if (alive) setProfDone(v === '1');
    });
    return () => {
      alive = false;
    };
  }, [isAuthenticated, currentLL?.id]);

  if (isLoading || (isAuthenticated && pairLoading) || profDone === null) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  if (!currentLL) {
    return <Redirect href="/(onboarding)/select-language" />;
  }

  if (!profDone) {
    return <Redirect href="/(onboarding)/proficiency" />;
  }

  return <Redirect href="/(main)/home" />;
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
});
