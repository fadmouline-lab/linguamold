import { useEffect, useRef } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Animated, {
  cancelAnimation,
  runOnJS,
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
import { useUIString } from '@/hooks/useUIString';

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
}

function AnimatedStar({ filled, delay }: AnimatedStarProps) {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    scale.value = withDelay(
      delay,
      withSequence(
        withSpring(1.3, { damping: 8, stiffness: 120 }),
        withSpring(1.0, { damping: 15, stiffness: 150 })
      )
    );
    opacity.value = withDelay(delay, withTiming(1, { duration: 150 }));
  }, [delay, opacity, scale]);

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

// ─── XP Counter ──────────────────────────────────────────────────────────────

interface XPCounterProps {
  target: number;
}

function XPCounter({ target }: XPCounterProps) {
  const displayed = useSharedValue(0);
  const displayRef = useRef(0);

  useEffect(() => {
    displayed.value = withDelay(
      400,
      withTiming(target, { duration: 1500 }, (finished) => {
        if (finished) runOnJS(() => { displayRef.current = target; })();
      })
    );
  }, [displayed, target]);

  const style = useAnimatedStyle(() => ({
    // Use a hack: we animate from 0 to target and display the value
    // via Text that re-renders — actually we just show the animated value
  }));

  return (
    <Animated.Text style={[styles.xpText, style]}>
      +{target} XP
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
  onContinue,
  wordsLearned,
  wordsToReview,
  nextLessonTitle,
  dailyGoalMinutes,
  dailyGoalCurrent,
}: LessonCompleteScreenProps) {
  const { t } = useUIString();
  const stars = scorePct < 60 ? 1 : scorePct < 90 ? 2 : 3;
  const showConfetti = scorePct >= 90;
  const particles = useRef(makeParticles()).current;

  // Title slides in
  const titleY = useSharedValue(30);
  const titleOpacity = useSharedValue(0);
  useEffect(() => {
    titleY.value = withSpring(0, { damping: 15, stiffness: 100 });
    titleOpacity.value = withTiming(1, { duration: 400 });
  }, [titleOpacity, titleY]);

  const titleStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: titleY.value }],
    opacity: titleOpacity.value,
  }));

  // Continue button slides in last
  const btnOpacity = useSharedValue(0);
  useEffect(() => {
    btnOpacity.value = withDelay(1000, withTiming(1, { duration: 400 }));
  }, [btnOpacity]);
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
            <AnimatedStar key={n} filled={n <= stars} delay={200 + n * 150} />
          ))}
        </View>

        <Text variant="h3" style={styles.xpText}>
          +{xpEarned} {t('gamify.xp')}
        </Text>

        <Text variant="caption" style={styles.scoreText}>
          {scorePct}% correct
          {streakKept ? `  ·  🔥 ${t('gamify.streak')}` : ''}
        </Text>

        {/* TODO(motion): section reveal animations (staggered slide-up) */}
        {wordsLearned && wordsLearned.length > 0 && (
          <View style={styles.section}>
            <Text variant="label" style={styles.sectionTitle}>
              {t('lesson.complete_words_learned')}
            </Text>
            {wordsLearned.map((w, i) => (
              <Text key={i} variant="body" style={styles.wordRow}>
                {w.word} — {w.translation}
              </Text>
            ))}
          </View>
        )}

        {wordsToReview && wordsToReview.length > 0 && (
          <View style={styles.section}>
            <Text variant="label" style={styles.sectionTitleError}>
              {t('lesson.complete_review')}
            </Text>
            {wordsToReview.map((w, i) => (
              <Text key={i} variant="body" style={styles.wordRow}>
                {w.word} — {w.translation}
              </Text>
            ))}
          </View>
        )}

        {nextLessonTitle && (
          <View style={styles.section}>
            <Text variant="caption" style={styles.nextUp}>
              {t('lesson.complete_next', { title: nextLessonTitle })}
            </Text>
          </View>
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
