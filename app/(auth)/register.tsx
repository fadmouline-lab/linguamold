import { Link, router } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Text } from '@/components/ui/Text';
import { colors, spacing } from '@/components/ui/theme';
import { useAuth } from '@/hooks/useAuth';
import { useUIString } from '@/hooks/useUIString';

export default function RegisterScreen() {
  const { t } = useUIString();
  const { signUp } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      await signUp(email, password, displayName);
      router.replace('/');
    } catch {
      setError(t('auth.error_generic'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <Text variant="h1" style={styles.title}>
            {t('auth.register_title')}
          </Text>
          <Input
            label={t('auth.display_name')}
            value={displayName}
            onChangeText={setDisplayName}
            autoComplete="name"
          />
          <View style={styles.gap} />
          <Input
            label={t('auth.email')}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
          />
          <View style={styles.gap} />
          <Input
            label={t('auth.password')}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="password-new"
          />
          {error ? (
            <Text variant="caption" style={styles.error}>
              {error}
            </Text>
          ) : null}
          <View style={styles.spacer} />
          <Button
            title={t('auth.sign_up')}
            onPress={() => void onSubmit()}
            loading={loading}
          />
          <View style={styles.row}>
            <Text variant="caption">{t('auth.have_account')} </Text>
            <Link href="/(auth)/login" asChild>
              <Text variant="caption" style={styles.linkBold}>
                {t('auth.sign_in')}
              </Text>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: {
    flexGrow: 1,
    paddingVertical: spacing.xxxl,
    gap: spacing.md,
  },
  title: { marginBottom: spacing.lg },
  gap: { height: spacing.sm },
  spacer: { height: spacing.lg },
  error: { color: colors.error, marginTop: spacing.sm },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.lg,
    flexWrap: 'wrap',
  },
  linkBold: { color: colors.primary, fontWeight: '700' },
});
