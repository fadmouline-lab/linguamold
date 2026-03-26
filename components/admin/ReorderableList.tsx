import { type ReactNode, useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { colors, spacing } from '@/components/ui/theme';

export interface ReorderableItem {
  id: string;
  display_order: number;
}

export interface ReorderableListProps<T extends ReorderableItem> {
  items: T[];
  adminMode?: boolean;
  onReorder: (ordered: T[]) => void;
  renderItem: (item: T) => ReactNode;
}

export function ReorderableList<T extends ReorderableItem>({
  items,
  adminMode,
  onReorder,
  renderItem,
}: ReorderableListProps<T>) {
  const [local, setLocal] = useState<T[]>(items);

  useEffect(() => {
    setLocal([...items].sort((a, b) => a.display_order - b.display_order));
  }, [items]);

  const move = (index: number, dir: -1 | 1) => {
    const next = [...local];
    const j = index + dir;
    if (j < 0 || j >= next.length) return;
    const tmp = next[index]!;
    next[index] = next[j]!;
    next[j] = tmp;
    const renumbered = next.map((it, i) => ({ ...it, display_order: i + 1 }));
    setLocal(renumbered);
    onReorder(renumbered);
  };

  return (
    <FlatList
      data={local}
      keyExtractor={(it) => it.id}
      renderItem={({ item, index }) => (
        <View style={styles.row}>
          {adminMode ? (
            <View style={styles.handle}>
              <Pressable onPress={() => move(index, -1)}>
                <Text variant="caption">▲</Text>
              </Pressable>
              <Pressable onPress={() => move(index, 1)}>
                <Text variant="caption">▼</Text>
              </Pressable>
            </View>
          ) : null}
          <View style={styles.content}>{renderItem(item)}</View>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  handle: { width: 40, gap: 4 },
  content: { flex: 1 },
});
