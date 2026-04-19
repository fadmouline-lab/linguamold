import { StyleSheet, View } from 'react-native';

import { colors, spacing } from '@/components/ui/theme';

export interface PathConnectorProps {
  completed?: boolean;
  fromOffset?: number;
  toOffset?: number;
}

const CONNECTOR_HEIGHT = spacing.xxxl + 16;
const DASH_SIZE = 7;
const GAP_SIZE = 7;

export function PathConnector({ completed, fromOffset = 0, toOffset = 0 }: PathConnectorProps) {
  const diff = toOffset - fromOffset;
  const angle = diff !== 0 ? Math.atan2(diff, CONNECTOR_HEIGHT) * (180 / Math.PI) : 0;

  const dashColor = completed ? colors.accent : colors.borderStrong;
  const dashCount = Math.floor(CONNECTOR_HEIGHT / (DASH_SIZE + GAP_SIZE));

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.lineWrapper,
          angle !== 0 && { transform: [{ rotate: `${angle}deg` }] },
        ]}
      >
        {Array.from({ length: dashCount }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.dash,
              { backgroundColor: dashColor },
              i === 0 && { marginTop: 0 },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: CONNECTOR_HEIGHT,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  lineWrapper: {
    width: 4,
    height: CONNECTOR_HEIGHT,
    alignItems: 'center',
    gap: GAP_SIZE,
    paddingVertical: 2,
  },
  dash: {
    width: 4,
    height: DASH_SIZE,
    borderRadius: 2,
  },
});
