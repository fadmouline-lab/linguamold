import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Text } from '@/components/ui/Text';
import { colors, radii, spacing } from '@/components/ui/theme';
import { useUIString } from '@/hooks/useUIString';

const MOTIVATIONS = [
  { emoji: '🌍', label: 'Travel' },
  { emoji: '💼', label: 'Work' },
  { emoji: '🧠', label: 'Brain training' },
  { emoji: '❤️', label: 'Relationships' },
  { emoji: '📚', label: 'Culture' },
  { emoji: '🎯', label: 'Just for fun' },
] as const;

export default function MotivationScreen() {
  const router = useRouter();
  const { t } = useUIString();
  const [selected, setSelected] = useState<string[]>([]);

  const toggleMotivation = (label: string) => {
    setSelected((prev) =>
      prev.includes(label)
        ? prev.filter((item) => item !== label)
        : [...prev, label]
    );
  };

  const handleContinue = async () => {
    await AsyncStorage.setItem(
      'linguamold.learning_motivation',
      JSON.stringify(selected)
    );
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
          {MOTIVATIONS.map((item) => {
            const isSelected = selected.includes(item.label);
            return (
              <Pressable
                key={item.label}
                onPress={() => toggleMotivation(item.label)}
                style={[
                  styles.card,
                  isSelected && styles.cardSelected,
                ]}
              >
                <Text style={styles.emoji}>{item.emoji}</Text>
                <Text variant="bodyBold">{item.label}</Text>
              </Pressable>
            );
          })}
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
  card: {
    width: '47%',
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
