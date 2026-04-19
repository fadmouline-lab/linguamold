import 'react-native-gesture-handler';

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as Font from 'expo-font';
import { useEffect, useState } from 'react';
import { Platform, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { OfflineBanner } from '@/components/common/OfflineBanner';
import { ToastQueue } from '@/components/common/ToastQueue';
import { colors } from '@/components/ui/theme';

export default function RootLayout() {
  const [online, setOnline] = useState(true);
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    Font.loadAsync({
      'CabinetGrotesk-ExtraBold': require('../assets/fonts/CabinetGrotesk-ExtraBold.ttf'),
      'CabinetGrotesk-Bold': require('../assets/fonts/CabinetGrotesk-Bold.ttf'),
      'CabinetGrotesk-Medium': require('../assets/fonts/CabinetGrotesk-Medium.ttf'),
      'DMSans-Regular': require('../assets/fonts/DMSans-Regular.ttf'),
      'DMSans-Medium': require('../assets/fonts/DMSans-Medium.ttf'),
      'DMSans-SemiBold': require('../assets/fonts/DMSans-SemiBold.ttf'),
      'DMSans-Bold': require('../assets/fonts/DMSans-Bold.ttf'),
    }).then(() => setFontsLoaded(true));
  }, []);

  useEffect(() => {
    if (Platform.OS === 'web') {
      const sync = () =>
        setOnline(typeof navigator !== 'undefined' ? navigator.onLine : true);
      sync();
      window.addEventListener('online', sync);
      window.addEventListener('offline', sync);
      return () => {
        window.removeEventListener('online', sync);
        window.removeEventListener('offline', sync);
      };
    }
    let cancelled = false;
    const check = async () => {
      try {
        await fetch('https://www.google.com/generate_204', { method: 'HEAD', cache: 'no-store' });
        if (!cancelled) setOnline(true);
      } catch {
        if (!cancelled) setOnline(false);
      }
    };
    void check();
    const interval = setInterval(() => void check(), 15000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: colors.background }} />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <OfflineBanner visible={!online} message="Pas de connexion internet" />
        <ToastQueue />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.background },
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(onboarding)" />
          <Stack.Screen name="(main)" />
          <Stack.Screen name="(admin)" />
          <Stack.Screen name="lesson/[lessonId]" options={{ gestureEnabled: false }} />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
