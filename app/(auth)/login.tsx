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

export default function LoginScreen() {
  const { t } = useUIString();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      await signIn(email, password);
      router.replace('/');
    } catch {
      setError(t('auth.error_invalid'));
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
            {t('auth.login_title')}
          </Text>
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
            autoComplete="password"
          />
          {error ? (
            <Text variant="caption" style={styles.error}>
              {error}
            </Text>
          ) : null}
          <View style={styles.spacer} />
          <Button
            title={t('auth.sign_in')}
            onPress={() => void onSubmit()}
            loading={loading}
          />
          <Link href="/(auth)/forgot-password" asChild>
            <Text variant="caption" style={styles.link}>
              {t('auth.forgot_password')}
            </Text>
          </Link>
          <View style={styles.row}>
            <Text variant="caption">{t('auth.no_account')} </Text>
            <Link href="/(auth)/register" asChild>
              <Text variant="caption" style={styles.linkBold}>
                {t('auth.sign_up')}
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
  link: { color: colors.primary, marginTop: spacing.md, textAlign: 'center' },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.lg,
    flexWrap: 'wrap',
  },
  linkBold: { color: colors.primary, fontWeight: '700' },
});
