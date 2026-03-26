import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { colors } from '@/components/ui/theme';

export interface CelebrationOverlayProps {
  visible: boolean;
  title: string;
  onDone?: () => void;
}

export function CelebrationOverlay({
  visible,
  title,
  onDone,
}: CelebrationOverlayProps) {
  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(() => onDone?.(), 3000);
    return () => clearTimeout(t);
  }, [visible, onDone]);

  if (!visible) return null;

  return (
    <View style={styles.overlay} pointerEvents="none">
      <Text variant="h1" style={styles.title}>
        {title}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 50,
  },
  title: { color: colors.accent },
});
