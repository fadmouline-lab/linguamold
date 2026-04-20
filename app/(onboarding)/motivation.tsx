import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Pressable, ScrollView } from 'react-native';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { Button } from '@/components/ui/Button';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Text } from '@/components/ui/Text';
import { colors, radii, spacing } from '@/components/ui/theme';
import { useAnimatedMount } from '@/hooks/useAnimatedMount';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useUIString } from '@/hooks/useUIString';
import { SPRING } from '@/lib/motion';

const MOTIVATIONS = [
  { emoji: '🌍', label: 'Travel' },
  { emoji: '💼', label: 'Work' },
  { emoji: '🧠', label: 'Brain training' },
  { emoji: '❤️', label: 'Relationships' },
  { emoji: '📚', label: 'Culture' },
  { emoji: '🎯', label: 'Just for fun' },
] as const;

function MotivationCard({
  emoji,
  label,
  isSelected,
  onPress,
  mountDelay,
}: {
  emoji: string;
  label: string;
  isSelected: boolean;
  onPress: () => void;
  mountDelay: number;
}) {
  const reduced = useReducedMotion();
  const mountStyle = useAnimatedMount({ translateY: 20, delay: mountDelay });
  const pressScale = useSharedValue(1);

  const handlePressIn = useCallback(() => {
    if (reduced) return;
    pressScale.value = withSpring(0.95, SPRING.snappy);
  }, [pressScale, reduced]);

  const handlePressOut = useCallback(() => {
    if (reduced) return;
    cancelAnimation(pressScale);
    pressScale.value = withSpring(1, SPRING.button);
  }, [pressScale, reduced]);

  const pressStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pressScale.value }],
  }));

  return (
    <Animated.View style={[mountStyle, pressStyle, styles.cardWrap]}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[styles.card, isSelected && styles.cardSelected]}
      >
        <Text style={styles.emoji}>{emoji}</Text>
        <Text variant="bodyBold">{label}</Text>
      </Pressable>
    </Animated.View>
  );
}

export default function MotivationScreen() {
  const router = useRouter();
  const { t } = useUIString();
  const [selected, setSelected] = useState<string[]>([]);

  const toggleMotivation = (label: string) => {
    setSelected((prev) =>
      prev.includes(label) ? prev.filter((item) => item !== label) : [...prev, label]
    );
  };

  const handleContinue = async () => {
    await AsyncStorage.setItem('linguamold.learning_motivation', JSON.stringify(selected));
    router.push('/(onboarding)/daily-goal');
  };

  return (
    <ScreenContainer>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text variant="h1" style={styles.title}>
          {t('onboarding.motivation_title')}
        </Text>
        <Text variant="body" color={colors.textSecondary} style={styles.subtitle}>
          {t('onboarding.motivation_sub')}
        </Text>

        <View style={styles.grid}>
          {MOTIVATIONS.map((item, i) => (
            <MotivationCard
              key={item.label}
              emoji={item.emoji}
              label={item.label}
              isSelected={selected.includes(item.label)}
              onPress={() => toggleMotivation(item.label)}
              mountDelay={i * 100}
            />
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title={t('onboarding.continue') || 'Continue'}
          variant="primary"
          disabled={selected.length === 0}
          onPress={handleContinue}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: spacing.xxxl,
    paddingBottom: spacing.xxl,
  },
  title: {
    marginBottom: spacing.sm,
  },
  subtitle: {
    marginBottom: spacing.xxl,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  cardWrap: {
    width: '47%',
  },
  card: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    borderRadius: radii.md,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    gap: spacing.sm,
  },
  cardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  emoji: {
    fontSize: 32,
  },
  footer: {
    paddingVertical: spacing.lg,
  },
});
