import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';

import { colors, spacing } from '@/components/ui/theme';
import { playAudio, stopAudio } from '@/lib/audio';

const isWeb = Platform.OS === 'web';

export interface AudioPlayerProps {
  audioUrl: string | null | undefined;
  autoPlay?: boolean;
  size?: number;
}

export function AudioPlayer({
  audioUrl,
  autoPlay = false,
  size = 48,
}: AudioPlayerProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    let alive = true;
    const run = async () => {
      // Web: autoplay is unreliable (browser policies); user must tap.
      if (!autoPlay || !audioUrl || isWeb) return;
      setLoading(true);
      setError(false);
      try {
        await playAudio(audioUrl);
      } catch {
        if (alive) setError(true);
      } finally {
        if (alive) setLoading(false);
      }
    };
    void run();
    return () => {
      alive = false;
      void stopAudio();
    };
  }, [audioUrl, autoPlay]);

  const onPress = useCallback(async () => {
    if (!audioUrl || error) return;
    setLoading(true);
    setError(false);
    try {
      await playAudio(audioUrl);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [audioUrl, error]);

  const disabled = !audioUrl || error;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={
        isWeb ? 'Lecture audio (appuyez pour jouer)' : 'Play audio'
      }
      onPress={() => void onPress()}
      disabled={disabled}
      style={[styles.btn, { width: size, height: size, borderRadius: size / 2 }]}
    >
      {loading ? (
        <ActivityIndicator color={colors.textPrimary} />
      ) : (
        <View style={styles.iconWrap}>
          <Ionicons
            name="volume-high"
            size={size * 0.5}
            color={disabled ? colors.textSecondary : colors.textPrimary}
          />
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    backgroundColor: colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconWrap: { alignItems: 'center', justifyContent: 'center' },
});
