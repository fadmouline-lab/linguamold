import { useEffect, useRef } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { colors, radii, spacing } from '@/components/ui/theme';
import { useCountUp } from '@/hooks/useCountUp';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useUIString } from '@/hooks/useUIString';
import { celebration } from '@/lib/haptics';
import { SPRING, TIMING } from '@/lib/motion';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const PARTICLE_COUNT = 15;
const PARTICLE_COLORS = ['#0891B2', '#F59E0B', '#EF4444', '#22D3EE', '#F97316', '#A78BFA'];

interface ParticleConfig {
  x: number; y: number;
  color: string; size: number;
  destX: number; destY: number;
  delay: number;
}

function makeParticles(): ParticleConfig[] {
  return Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
    x: SCREEN_W * 0.3 + Math.random() * SCREEN_W * 0.4,
    y: SCREEN_H * 0.35,
    color: PARTICLE_COLORS[i % PARTICLE_COLORS.length]!,
    size: 8 + Math.random() * 8,
    destX: Math.random() * SCREEN_W,
    destY: -50 + Math.random() * SCREEN_H * 0.6,
    delay: i * 80,
  }));
}

function ConfettiParticle({ config }: { config: ParticleConfig }) {
  const x = useSharedValue(config.x);
  const y = useSharedValue(config.y);
  const opacity = useSharedValue(0);
  const rotate = useSharedValue(0);

  useEffect(() => {
    x.value = withDelay(config.delay, withTiming(config.destX, { duration: 1500 }));
    y.value = withDelay(config.delay, withTiming(config.destY, { duration: 1500 }));
    opacity.value = withDelay(config.delay, withSequence(
      withTiming(1, { duration: 200 }),
      withDelay(1000, withTiming(0, { duration: 500 }))
    ));
    rotate.value = withDelay(config.delay, withTiming(
      360 * (Math.random() > 0.5 ? 1 : -1), { duration: 1500 }
    ));
    return () => {
      cancelAnimation(x);
      cancelAnimation(y);
      cancelAnimation(opacity);
      cancelAnimation(rotate);
    };
  }, [config.delay, config.destX, config.destY, opacity, rotate, x, y]);

  const style = useAnimatedStyle(() => ({
    position: 'absolute',
    left: x.value,
    top: y.value,
    width: config.size,
    height: config.size,
    borderRadius: config.size / 4,
    backgroundColor: config.color,
    opacity: opacity.value,
    transform: [{ rotate: `${rotate.value}deg` }],
  }));

  return <Animated.View style={style} />;
}

export interface ModuleCompleteScreenProps {
  moduleName: string;
  moduleEmoji: string;
  lessonsCompleted: number;
  accuracyPct: number;
  minutesSpent: number;
  xpEarned: number;
  nextModuleName?: string;
  nextModuleEmoji?: string;
  onContinue: () => void;
}

export function ModuleCompleteScreen({
  moduleName,
  moduleEmoji,
  lessonsCompleted,
  accuracyPct,
  minutesSpent,
  xpEarned,
  nextModuleName,
  nextModuleEmoji,
  onContinue,
}: ModuleCompleteScreenProps) {
  const { t } = useUIString();
  const reduced = useReducedMotion();
  const particles = useRef(makeParticles()).current;
  const xpDisplay = useCountUp(xpEarned, 1200, 400);

  // Badge: scale 0→1.3→1.0 with rotation
  const badgeScale = useSharedValue(reduced ? 1 : 0);
  const badgeRotate = useSharedValue(0);

  // Stats stagger
  const statsOpacity = useSharedValue(reduced ? 1 : 0);
  const statsTranslate = useSharedValue(reduced ? 0 : 20);

  // Next module card slide-up
  const nextCardOpacity = useSharedValue(reduced ? 1 : 0);
  const nextCardTranslate = useSharedValue(reduced ? 0 : 30);

  // Continue button fade-in last
  const btnOpacity = useSharedValue(reduced ? 1 : 0);

  useEffect(() => {
    if (reduced) return;

    // Badge entrance + rotation
    badgeScale.value = withSequence(
      withSpring(1.3, SPRING.celebration),
      withSpring(1.0, SPRING.celebration),
    );
    badgeRotate.value = withSequence(
      withTiming(15,  { duration: 200 }),
      withTiming(-15, { duration: 200 }),
      withTiming(0,   { duration: 200 }),
    );
    celebration();

    // Stats stagger
    statsOpacity.value   = withDelay(300, withTiming(1,  { duration: TIMING.fast }));
    statsTranslate.value = withDelay(300, withSpring(0,  SPRING.card));

    // Next module card
    nextCardOpacity.value   = withDelay(600, withTiming(1,  { duration: TIMING.fast }));
    nextCardTranslate.value = withDelay(600, withSpring(0,  SPRING.card));

    // Button last
    btnOpacity.value = withDelay(1400, withTiming(1, { duration: TIMING.fast }));

    return () => {
      cancelAnimation(badgeScale);
      cancelAnimation(badgeRotate);
      cancelAnimation(statsOpacity);
      cancelAnimation(statsTranslate);
      cancelAnimation(nextCardOpacity);
      cancelAnimation(nextCardTranslate);
      cancelAnimation(btnOpacity);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const badgeStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: badgeScale.value },
      { rotate: `${badgeRotate.value}deg` },
    ],
  }));

  const statsStyle = useAnimatedStyle(() => ({
    opacity: statsOpacity.value,
    transform: [{ translateY: statsTranslate.value }],
  }));

  const nextCardStyle = useAnimatedStyle(() => ({
    opacity: nextCardOpacity.value,
    transform: [{ translateY: nextCardTranslate.value }],
  }));

  const btnStyle = useAnimatedStyle(() => ({ opacity: btnOpacity.value }));

  return (
    <View style={styles.wrap}>
      {particles.map((p, i) => <ConfettiParticle key={i} config={p} />)}

      <View style={styles.content}>
        <Animated.Text style={[styles.emoji, badgeStyle]}>
          {moduleEmoji}
        </Animated.Text>

        <Animated.View style={statsStyle}>
          <Text variant="h1" style={styles.title}>
            {t('gamify.module_complete')}
          </Text>

          <Text variant="bodyBold" style={styles.moduleName}>
            {moduleName}
          </Text>

          <Text variant="caption" style={styles.stats}>
            {lessonsCompleted} lessons · {accuracyPct}% accuracy · {minutesSpent} min
          </Text>

          <Text variant="score" style={styles.xp}>
            +{xpDisplay} XP
          </Text>
        </Animated.View>

        {nextModuleName ? (
          <Animated.View style={[styles.nextCard, nextCardStyle]}>
            <Text variant="caption" style={styles.nextLabel}>
              {t('gamify.module_next')}
            </Text>
            <View style={styles.nextRow}>
              <Text style={styles.nextEmoji}>{nextModuleEmoji}</Text>
              <Text variant="bodyBold">{nextModuleName}</Text>
            </View>
          </Animated.View>
        ) : null}

        <View style={styles.spacer} />

        <Animated.View style={[styles.buttonWrap, btnStyle]}>
          <Button
            title={t('gamify.module_continue')}
            variant="primary"
            onPress={onContinue}
            style={styles.button}
          />
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: spacing.xxxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  title: {
    textAlign: 'center',
    marginBottom: spacing.sm,
    color: colors.accent,
  },
  moduleName: {
    textAlign: 'center',
    marginBottom: spacing.xl,
    color: colors.textSecondary,
  },
  stats: {
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  xp: {
    color: colors.accent,
    marginBottom: spacing.xxl,
    textAlign: 'center',
  },
  nextCard: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  nextLabel: {
    marginBottom: spacing.sm,
  },
  nextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  nextEmoji: {
    fontSize: 24,
  },
  spacer: {
    height: spacing.xxxl,
  },
  buttonWrap: {
    width: '100%',
  },
  button: {
    width: '100%',
  },
});
