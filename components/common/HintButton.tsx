import { useCallback, useRef, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { colors, spacing } from '@/components/ui/theme';
import { useUIString } from '@/hooks/useUIString';

interface HintButtonProps {
  onHint: () => void;
  disabled?: boolean;
  hintsUsed: number;
  maxHints?: number;
}

export function HintButton({ onHint, disabled, hintsUsed, maxHints = 3 }: HintButtonProps) {
  const { t } = useUIString();
  const [showPenalty, setShowPenalty] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const isExhausted = hintsUsed >= maxHints;

  const handlePress = useCallback(() => {
    onHint();

    // Show "-2 XP" indicator briefly
    setShowPenalty(true);
    fadeAnim.setValue(1);
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 1200,
      useNativeDriver: true,
    }).start(() => {
      setShowPenalty(false);
    });
  }, [onHint, fadeAnim]);

  return (
    <View style={styles.container}>
      <Button
        title={t('exercise.hint')}
        variant="outline"
        onPress={handlePress}
        disabled={disabled || isExhausted}
        style={styles.button}
      />
      {showPenalty && (
        <Animated.View style={[styles.penaltyContainer, { opacity: fadeAnim }]}>
          <Text variant="label" color={colors.error}>
            -2 XP
          </Text>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    position: 'relative',
  },
  button: {
    borderBottomWidth: 0,
    minWidth: 72,
  },
  penaltyContainer: {
    position: 'absolute',
    top: -spacing.xl,
    alignSelf: 'center',
  },
});
