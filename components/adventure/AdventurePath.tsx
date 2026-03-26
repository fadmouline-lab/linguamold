import { useEffect, useRef } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { ModuleNode, type NodeState } from '@/components/adventure/ModuleNode';
import { PathConnector } from '@/components/adventure/PathConnector';
import { colors, spacing } from '@/components/ui/theme';
import type { ModuleWithProgress } from '@/hooks/useModules';

export interface AdventurePathProps {
  modules: ModuleWithProgress[];
  onSelectModule: (m: ModuleWithProgress) => void;
  adminReorder?: boolean;
}

function inferState(m: ModuleWithProgress, index: number): NodeState {
  const st = m.progress?.status;
  if (st === 'completed') return 'completed';
  if (st === 'in_progress') return 'in_progress';
  if (index === 0) return 'available';
  return st === 'available' || st === 'in_progress' ? 'available' : 'locked';
}

export function AdventurePath({
  modules,
  onSelectModule,
}: AdventurePathProps) {
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    const idx = modules.findIndex(
      (m) => m.progress?.status === 'in_progress' || m.progress?.status === 'available'
    );
    if (idx >= 0) {
      setTimeout(() => {
        scrollRef.current?.scrollTo({ y: Math.max(0, idx * 140), animated: true });
      }, 300);
    }
  }, [modules]);

  return (
    <ScrollView
      ref={scrollRef}
      contentContainerStyle={styles.content}
      style={styles.scroll}
    >
      {modules.map((m, i) => (
        <View key={m.id}>
          {i > 0 ? (
            <PathConnector completed={inferState(modules[i - 1]!, i - 1) === 'completed'} />
          ) : null}
          <ModuleNode
            module={m}
            state={inferState(m, i)}
            onPress={() => onSelectModule(m)}
          />
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.background },
  content: { paddingVertical: spacing.lg, paddingBottom: 120 },
});
