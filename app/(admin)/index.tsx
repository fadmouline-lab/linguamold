import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Text } from '@/components/ui/Text';
import { colors, spacing } from '@/components/ui/theme';
import { useAdminMode } from '@/hooks/useAdminMode';
import { useUIString } from '@/hooks/useUIString';
import { supabase } from '@/lib/supabase';
import { useAdminStore } from '@/stores/adminStore';
import type { Language } from '@/types/index';

export default function AdminIndexScreen() {
  const { t } = useUIString();
  const { setAdminLanguages } = useAdminMode();
  const setAdminMode = useAdminStore((s) => s.setAdminMode);
  const [langs, setLangs] = useState<Language[]>([]);
  const [al, setAl] = useState<Language | null>(null);
  const [ll, setLl] = useState<Language | null>(null);

  useEffect(() => {
    const run = async () => {
      const { data } = await supabase.from('languages').select('*').eq('is_active', true);
      setLangs((data as Language[]) ?? []);
    };
    void run();
  }, []);

  const enter = useCallback(() => {
    if (!al || !ll) return;
    setAdminLanguages(al, ll);
    setAdminMode(true);
    router.replace('/(admin)/modules');
  }, [al, ll, setAdminLanguages, setAdminMode]);

  return (
    <ScreenContainer>
      <Text variant="h1">{t('admin.enter')}</Text>
      <Text variant="caption" style={styles.sub}>
        App language (AL)
      </Text>
      <View style={styles.grid}>
        {langs.map((l) => (
          <Pressable
            key={l.id}
            onPress={() => setAl(l)}
            style={[styles.chip, al?.id === l.id && styles.chipOn]}
          >
            <Text variant="body">{l.flag_emoji} {l.name_native}</Text>
          </Pressable>
        ))}
      </View>
      <Text variant="caption" style={styles.sub}>
        Learning language (LL)
      </Text>
      <View style={styles.grid}>
        {langs
          .filter((l) => l.id !== al?.id)
          .map((l) => (
            <Pressable
              key={l.id}
              onPress={() => setLl(l)}
              style={[styles.chip, ll?.id === l.id && styles.chipOn]}
            >
              <Text variant="body">{l.flag_emoji} {l.name_native}</Text>
            </Pressable>
          ))}
      </View>
      <Button title={t('admin.enter')} disabled={!al || !ll} onPress={enter} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  sub: { marginTop: spacing.md, marginBottom: spacing.sm, color: colors.textSecondary },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.lg },
  chip: {
    padding: spacing.sm,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipOn: { borderColor: colors.primary },
});
