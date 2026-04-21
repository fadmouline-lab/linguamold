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
import { colors, spacing } from '@/components/ui/theme';
import { useAnimatedMount } from '@/hooks/useAnimatedMount';
import { useCountUp } from '@/hooks/useCountUp';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useUIString } from '@/hooks/useUIString';
import { SPRING, TIMING } from '@/lib/motion';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

// ─── Confetti particle ───────────────────────────────────────────────────────

const PARTICLE_COLORS = ['#0891B2', '#F59E0B', '#EF4444', '#22D3EE', '#F97316', '#A78BFA'];
const PARTICLE_COUNT = 15;

interface ParticleConfig {
  x: number;
  y: number;
  color: string;
  size: number;
  destX: number;
  destY: number;
  delay: number;
}

function makeParticles(): ParticleConfig[] {
  return Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
    x: SCREEN_W * 0.3 + Math.random() * SCREEN_W * 0.4,
    y: SCREEN_H * 0.3,
    color: PARTICLE_COLORS[i % PARTICLE_COLORS.length]!,
    size: 8 + Math.random() * 8,
    destX: Math.random() * SCREEN_W,
    destY: -50 + Math.random() * SCREEN_H * 0.6,
    delay: i * 80,
  }));
}

interface ConfettiParticleProps {
  config: ParticleConfig;
}

function ConfettiParticle({ config }: ConfettiParticleProps) {
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
    rotate.value = withDelay(config.delay, withTiming(360 * (Math.random() > 0.5 ? 1 : -1), { duration: 1500 }));

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

// ─── Animated star ────────────────────────────────────────────────────────────

interface AnimatedStarProps {
  filled: boolean;
  delay: number;
  reduced: boolean;
}

function AnimatedStar({ filled, delay, reduced }: AnimatedStarProps) {
  const scale = useSharedValue(reduced ? 1 : 0);
  const opacity = useSharedValue(reduced ? 1 : 0);

  useEffect(() => {
    if (reduced) return;
    scale.value = withDelay(
      delay,
      withSequence(
        withSpring(1.3, SPRING.celebration),
        withSpring(1.0, SPRING.card),
      ),
    );
    opacity.value = withDelay(delay, withTiming(1, { duration: 150 }));
    return () => {
      cancelAnimation(scale);
      cancelAnimation(opacity);
    };
  }, [delay, opacity, reduced, scale]);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.Text style={[styles.starEmoji, style]}>
      {filled ? '⭐' : '☆'}
    </Animated.Text>
  );
}

// ─── Main screen ─────────────────────────────────────────────────────────────

export interface WordSummary {
  word: string;
  translation: string;
}

export interface LessonCompleteScreenProps {
  scorePct: number;
  xpEarned: number;
  streakKept: boolean;
  streakCount?: number;
  onContinue: () => void;
  wordsLearned?: WordSummary[];
  wordsToReview?: WordSummary[];
  nextLessonTitle?: string;
  dailyGoalMinutes?: number;
  dailyGoalCurrent?: number;
}

export function LessonCompleteScreen({
  scorePct,
  xpEarned,
  streakKept,
  streakCount = 0,
  onContinue,
  wordsLearned,
  wordsToReview,
  nextLessonTitle,
  dailyGoalMinutes,
  dailyGoalCurrent,
}: LessonCompleteScreenProps) {
  const { t } = useUIString();
  const reduced = useReducedMotion();
  const stars = scorePct < 60 ? 1 : scorePct < 90 ? 2 : 3;
  const showConfetti = scorePct >= 90 && !reduced;
  const particles = useRef(makeParticles()).current;
  const xpDisplay = useCountUp(xpEarned, TIMING.slow, 400);

  // Staggered section reveals (base delay 800ms = after stars + XP settle)
  const section1Style = useAnimatedMount({ translateY: 20, delay: reduced ? 0 : 800 });
  const section2Style = useAnimatedMount({ translateY: 20, delay: reduced ? 0 : 1000 });
  const section3Style = useAnimatedMount({ translateY: 20, delay: reduced ? 0 : 1200 });

  // Title slides in
  const titleY = useSharedValue(reduced ? 0 : 30);
  const titleOpacity = useSharedValue(reduced ? 1 : 0);
  useEffect(() => {
    if (reduced) return;
    titleY.value = withSpring(0, SPRING.card);
    titleOpacity.value = withTiming(1, { duration: 400 });
    return () => {
      cancelAnimation(titleY);
      cancelAnimation(titleOpacity);
    };
  }, [reduced, titleOpacity, titleY]);

  const titleStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: titleY.value }],
    opacity: titleOpacity.value,
  }));

  // Continue button slides in last
  const btnOpacity = useSharedValue(reduced ? 1 : 0);
  useEffect(() => {
    if (reduced) return;
    btnOpacity.value = withDelay(1000, withTiming(1, { duration: 400 }));
    return () => cancelAnimation(btnOpacity);
  }, [btnOpacity, reduced]);
  const btnStyle = useAnimatedStyle(() => ({ opacity: btnOpacity.value }));

  return (
    <View style={styles.wrap}>
      {showConfetti && particles.map((p, i) => (
        <ConfettiParticle key={i} config={p} />
      ))}

      <View style={styles.content}>
        <Animated.Text style={[styles.trophy, titleStyle]}>🏆</Animated.Text>

        <Animated.View style={titleStyle}>
          <Text variant="h1" style={styles.title}>
            {t('lesson.complete_title')}
          </Text>
        </Animated.View>

        <View style={styles.stars}>
          {[1, 2, 3].map((n) => (
            <AnimatedStar key={n} filled={n <= stars} delay={200 + n * 150} reduced={reduced} />
          ))}
        </View>

        <Text variant="h3" style={styles.xpText}>
          +{xpDisplay} {t('gamify.xp')}
        </Text>

        <Text variant="caption" style={styles.scoreText}>
          {scorePct}% correct
          {streakKept && streakCount > 0 ? `  ·  🔥 ${streakCount} ${t('gamify.streak')}` : streakKept ? `  ·  🔥 ${t('gamify.streak')}` : ''}
        </Text>

        {wordsLearned && wordsLearned.length > 0 && (
          <Animated.View style={[styles.section, section1Style]}>
            <Text variant="label" style={styles.sectionTitle}>
              {t('lesson.complete_words_learned')}
            </Text>
            {wordsLearned.map((w, i) => (
              <Text key={i} variant="body" style={styles.wordRow}>
                {w.word} — {w.translation}
              </Text>
            ))}
          </Animated.View>
        )}

        {wordsToReview && wordsToReview.length > 0 && (
          <Animated.View style={[styles.section, section2Style]}>
            <Text variant="label" style={styles.sectionTitleError}>
              {t('lesson.complete_review')}
            </Text>
            {wordsToReview.map((w, i) => (
              <Text key={i} variant="body" style={styles.wordRow}>
                {w.word} — {w.translation}
              </Text>
            ))}
          </Animated.View>
        )}

        {nextLessonTitle && (
          <Animated.View style={[styles.section, section3Style]}>
            <Text variant="caption" style={styles.nextUp}>
              {t('lesson.complete_next', { title: nextLessonTitle })}
            </Text>
          </Animated.View>
        )}

        <View style={styles.spacer} />

        <Animated.View style={[styles.btnWrap, btnStyle]}>
          <Button title={t('common.continue')} onPress={onContinue} />
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
  trophy: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  title: {
    textAlign: 'center',
    marginBottom: spacing.xl,
    color: colors.accent,
  },
  stars: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  starEmoji: {
    fontSize: 40,
  },
  xpText: {
    color: colors.accent,
    fontSize: 28,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  scoreText: {
    color: colors.textSecondary,
  },
  spacer: { height: spacing.xxxl },
  btnWrap: { width: '100%' },
  section: { width: '100%', marginTop: spacing.lg, gap: spacing.xs },
  sectionTitle: { color: colors.primary, marginBottom: spacing.xs },
  sectionTitleError: { color: colors.error, marginBottom: spacing.xs },
  wordRow: { color: colors.textPrimary },
  nextUp: { color: colors.textSecondary, textAlign: 'center' },
});
