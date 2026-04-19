import { useEffect } from 'react';
import { Pressable, StyleSheet, Text as RNText, View } from 'react-native';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { Text } from '@/components/ui/Text';
import { colors, fonts, radii, shadows, spacing } from '@/components/ui/theme';
import type { ModuleWithProgress } from '@/hooks/useModules';

export type NodeState = 'locked' | 'available' | 'in_progress' | 'completed';

const NODE_SIZE = 80;

// Map icon_name to a themed emoji. Fallback to a sensible default.
const ICON_MAP: Record<string, string> = {
  trophy:     '🏆',
  greetings:  '👋',
  numbers:    '🔢',
  family:     '👨‍👩‍👧',
  colors:     '🎨',
  food:       '🍽️',
  travel:     '✈️',
  animals:    '🐾',
  phrases:    '💬',
  verbs:      '⚡',
  time:       '🕐',
  shopping:   '🛍️',
  weather:    '☀️',
  body:       '💪',
  home:       '🏠',
  work:       '💼',
  test:       '🏆',
  level:      '⭐',
};

function resolveIcon(iconName?: string | null, title?: string | null): string {
  if (iconName) {
    const key = iconName.toLowerCase();
    for (const [k, v] of Object.entries(ICON_MAP)) {
      if (key.includes(k)) return v;
    }
  }
  if (title) {
    const t = title.toLowerCase();
    if (t.includes('test') || t.includes('niveau')) return '🏆';
    if (t.includes('salut') || t.includes('greet')) return '👋';
    if (t.includes('chiffre') || t.includes('number')) return '🔢';
    if (t.includes('famille') || t.includes('family')) return '👨‍👩‍👧';
    if (t.includes('couleur') || t.includes('color') || t.includes('forme')) return '🎨';
    if (t.includes('nourrit') || t.includes('food') || t.includes('mange')) return '🍽️';
    if (t.includes('voyage') || t.includes('travel')) return '✈️';
    if (t.includes('animal')) return '🐾';
    if (t.includes('phrase') || t.includes('talk') || t.includes('convers')) return '💬';
  }
  return '📚';
}

export interface ModuleNodeProps {
  module: ModuleWithProgress;
  state: NodeState;
  isCurrentNode: boolean;
  onPress: () => void;
}

export function ModuleNode({ module, state, isCurrentNode, onPress }: ModuleNodeProps) {
  const icon = resolveIcon(module.icon_name, module.title_al);

  const scale = useSharedValue(1);
  const ringOpacity = useSharedValue(0.3);

  useEffect(() => {
    if (isCurrentNode) {
      scale.value = withRepeat(
        withSequence(
          withTiming(1.05, { duration: 1100 }),
          withTiming(1.0, { duration: 1100 })
        ),
        -1,
        true
      );
      ringOpacity.value = withRepeat(
        withSequence(
          withTiming(0.65, { duration: 1100 }),
          withTiming(0.25, { duration: 1100 })
        ),
        -1,
        true
      );
    } else {
      cancelAnimation(scale);
      cancelAnimation(ringOpacity);
      scale.value = withTiming(1, { duration: 200 });
      ringOpacity.value = withTiming(0, { duration: 200 });
    }
  }, [isCurrentNode, scale, ringOpacity]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const ringStyle = useAnimatedStyle(() => ({
    opacity: ringOpacity.value,
  }));

  const nodeBackground = (() => {
    if (state === 'completed') return colors.accent;
    if (state === 'available' || state === 'in_progress') return colors.primary;
    return colors.surfaceLight;
  })();

  const nodeShadow = (() => {
    if (state === 'completed') return shadows.glow?.accent;
    if (state === 'available' || state === 'in_progress') return shadows.glow?.primary;
    return null;
  })();

  return (
    <Pressable
      onPress={onPress}
      disabled={state === 'locked'}
      style={styles.wrap}
    >
      <Animated.View style={[styles.nodeContainer, pulseStyle]}>
        {/* Pulse ring for active node */}
        {isCurrentNode && (
          <Animated.View
            style={[
              styles.pulseRing,
              { borderColor: colors.primary },
              ringStyle,
            ]}
          />
        )}

        {/* Node circle */}
        <View
          style={[
            styles.circle,
            { backgroundColor: nodeBackground },
            state === 'locked' && styles.locked,
            nodeShadow,
          ]}
        >
          {/* Themed emoji icon */}
          <RNText style={[styles.icon, state === 'locked' && styles.iconLocked]}>
            {state === 'locked' ? '🔒' : icon}
          </RNText>
        </View>

        {/* Crown badge for completed */}
        {state === 'completed' && (
          <View style={styles.crownBadge}>
            <RNText style={styles.crownIcon}>👑</RNText>
          </View>
        )}
      </Animated.View>

      {/* Module label */}
      <Text
        variant="caption"
        style={[
          styles.title,
          state === 'locked' && styles.lockedText,
          isCurrentNode && styles.activeTitle,
        ]}
        numberOfLines={2}
      >
        {module.title_al}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    width: 120,
  },
  nodeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: NODE_SIZE + 20,
    height: NODE_SIZE + 20,
  },
  pulseRing: {
    position: 'absolute',
    width: NODE_SIZE + 18,
    height: NODE_SIZE + 18,
    borderRadius: (NODE_SIZE + 18) / 2,
    borderWidth: 3,
  },
  circle: {
    width: NODE_SIZE,
    height: NODE_SIZE,
    borderRadius: NODE_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locked: {
    borderWidth: 2.5,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surfaceLight,
  },
  icon: {
    fontSize: 32,
    textAlign: 'center',
  },
  iconLocked: {
    opacity: 0.5,
    fontSize: 26,
  },
  crownBadge: {
    position: 'absolute',
    top: 2,
    right: 6,
    width: 24,
    height: 24,
    borderRadius: radii.full,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  crownIcon: {
    fontSize: 12,
  },
  title: {
    marginTop: spacing.sm,
    textAlign: 'center',
    paddingHorizontal: spacing.xs,
    color: colors.textSecondary,
    fontFamily: fonts.bodySemiBold,
  },
  lockedText: {
    color: colors.textFaint,
  },
  activeTitle: {
    color: colors.primary,
    fontFamily: fonts.bodyBold,
  },
});
