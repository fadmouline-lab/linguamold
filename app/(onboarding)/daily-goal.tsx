import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Pressable } from 'react-native';
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

interface GoalOption {
  emoji: string;
  labelKey: string;
  minutes: number;
}

const GOAL_OPTIONS: GoalOption[] = [
  { emoji: '🐢', labelKey: 'onboarding.goal_casual',  minutes: 5  },
  { emoji: '🎯', labelKey: 'onboarding.goal_regular', minutes: 10 },
  { emoji: '🔥', labelKey: 'onboarding.goal_serious', minutes: 15 },
  { emoji: '🚀', labelKey: 'onboarding.goal_intense', minutes: 20 },
];

function GoalCard({
  option,
  isSelected,
  onPress,
  mountDelay,
}: {
  option: GoalOption;
  isSelected: boolean;
  onPress: () => void;
  mountDelay: number;
}) {
  const { t } = useUIString();
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
    <Animated.View style={[mountStyle, pressStyle]}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[styles.card, isSelected && styles.cardSelected]}
      >
        <Text style={styles.emoji}>{option.emoji}</Text>
        <View style={styles.cardText}>
          <Text variant="bodyBold">{t(option.labelKey)}</Text>
          <Text variant="caption">
            {option.minutes} {t('onboarding.minutes_per_day') || 'min/day'}
          </Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

export default function DailyGoalScreen() {
  const router = useRouter();
  const { t } = useUIString();
  const [selectedMinutes, setSelectedMinutes] = useState<number | null>(null);

  const handleContinue = async () => {
    if (selectedMinutes === null) return;
    await AsyncStorage.setItem('linguamold.daily_goal_minutes', String(selectedMinutes));
    router.push('/(onboarding)/notifications');
  };

  return (
    <ScreenContainer>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text variant="h1" style={styles.title}>
          {t('onboarding.goal_title')}
        </Text>

        <View style={styles.options}>
          {GOAL_OPTIONS.map((option, i) => (
            <GoalCard
              key={option.minutes}
              option={option}
              isSelected={selectedMinutes === option.minutes}
              onPress={() => setSelectedMinutes(option.minutes)}
              mountDelay={i * 100}
            />
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title={t('onboarding.continue') || 'Continue'}
          variant="primary"
          disabled={selectedMinutes === null}
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
    marginBottom: spacing.xxl,
  },
  options: {
    gap: spacing.md,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.md,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    gap: spacing.lg,
  },
  cardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  cardText: {
    flex: 1,
    gap: spacing.xxs,
  },
  emoji: {
    fontSize: 32,
  },
  footer: {
    paddingVertical: spacing.lg,
  },
});
