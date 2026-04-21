import { useEffect, useRef } from 'react';
import { Dimensions, ScrollView, StyleSheet, View } from 'react-native';

import { ModuleNode, type NodeState } from '@/components/adventure/ModuleNode';
import { PathConnector } from '@/components/adventure/PathConnector';
import { colors, spacing } from '@/components/ui/theme';
import type { ModuleWithProgress } from '@/hooks/useModules';

const SCREEN_WIDTH = Dimensions.get('window').width;
const NODE_WIDTH = 120;
const WINDING_OFFSET = 44;
const NODE_ROW_HEIGHT = 140;

export interface AdventurePathProps {
  modules: ModuleWithProgress[];
  onSelectModule: (m: ModuleWithProgress) => void;
  adminReorder?: boolean;
}

function inferState(m: ModuleWithProgress, index: number, modules: ModuleWithProgress[]): NodeState {
  const st = m.progress?.status;
  if (st === 'completed') return 'completed';
  if (st === 'in_progress') return 'in_progress';
  if (index === 0) return 'available';
  if (st === 'available') return 'available';
  // Auto-unlock if the previous module is completed
  const prev = modules[index - 1];
  if (prev?.progress?.status === 'completed') return 'available';
  return 'locked';
}

export function AdventurePath({
  modules,
  onSelectModule,
}: AdventurePathProps) {
  const scrollRef = useRef<ScrollView>(null);

  // Index of the single "current" node (first non-completed, non-locked)
  const currentIndex = modules.findIndex((m) => {
    const st = m.progress?.status;
    return st === 'in_progress' || st === 'available';
  });
  // If none found, first module is current
  const resolvedCurrentIndex = currentIndex >= 0 ? currentIndex : 0;

  useEffect(() => {
    const scrollY = Math.max(0, (resolvedCurrentIndex - 1) * NODE_ROW_HEIGHT);
    setTimeout(() => {
      scrollRef.current?.scrollTo({ y: scrollY, animated: true });
    }, 400);
  }, [resolvedCurrentIndex]);

  const centerX = SCREEN_WIDTH / 2 - NODE_WIDTH / 2 - spacing.lg;

  return (
    <ScrollView
      ref={scrollRef}
      contentContainerStyle={styles.content}
      style={styles.scroll}
      showsVerticalScrollIndicator={false}
    >
      {modules.map((m, i) => {
        // Alternating left/right: even = center-left, odd = center-right
        const offset = i % 2 === 0 ? -WINDING_OFFSET : WINDING_OFFSET;
        const state = inferState(m, i, modules);
        const isCurrentNode = i === resolvedCurrentIndex;

        return (
          <View key={m.id} style={styles.row}>
            {i > 0 ? (
              <PathConnector
                completed={inferState(modules[i - 1]!, i - 1, modules) === 'completed'}
                fromOffset={i % 2 === 1 ? -WINDING_OFFSET : WINDING_OFFSET}
                toOffset={offset}
              />
            ) : null}
            <View style={[styles.nodeWrapper, { marginLeft: centerX + offset }]}>
              <ModuleNode
                module={m}
                state={state}
                isCurrentNode={isCurrentNode}
                onPress={() => onSelectModule(m)}
              />
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.background },
  content: {
    paddingTop: spacing.sm,
    paddingBottom: 120,
    paddingHorizontal: spacing.lg,
  },
  row: {
    alignItems: 'flex-start',
  },
  nodeWrapper: {
    // marginLeft set dynamically based on winding offset
  },
});
