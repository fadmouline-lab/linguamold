import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { Text } from '@/components/ui/Text';
import { colors, radii, spacing } from '@/components/ui/theme';

export interface FirstTimeTooltipProps {
  storageKey: string;
  message: string;
  children: React.ReactNode;
}

export function FirstTimeTooltip({
  storageKey,
  message,
  children,
}: FirstTimeTooltipProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void AsyncStorage.getItem(storageKey).then((val) => {
      if (!cancelled && val !== '1') setShow(true);
    });
    return () => {
      cancelled = true;
    };
  }, [storageKey]);

  const dismiss = () => {
    setShow(false);
    void AsyncStorage.setItem(storageKey, '1');
  };

  return (
    <View style={styles.container}>
      {children}
      {show ? (
        <Animated.View
          entering={FadeIn.duration(300)}
          exiting={FadeOut.duration(200)}
          style={styles.overlay}
        >
          <Pressable style={styles.touchArea} onPress={dismiss}>
            <View style={styles.bubble}>
              <Text variant="body" style={styles.text}>
                {message}
              </Text>
            </View>
          </Pressable>
        </Animated.View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  touchArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  bubble: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing.lg,
    marginHorizontal: spacing.xl,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  text: {
    textAlign: 'center',
    color: colors.textPrimary,
  },
});
