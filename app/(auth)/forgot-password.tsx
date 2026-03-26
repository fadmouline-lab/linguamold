import { Link } from 'expo-router';
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
import { useUIString } from '@/hooks/useUIString';
import { supabase } from '@/lib/supabase';

export default function ForgotPasswordScreen() {
  const { t } = useUIString();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const { error: e } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        { redirectTo: 'linguamold://reset' }
      );
      if (e) throw e;
      setMessage(t('auth.reset_sent'));
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
        <ScrollView contentContainerStyle={styles.scroll}>
          <Text variant="h2" style={styles.title}>
            {t('auth.forgot_password')}
          </Text>
          <Input
            label={t('auth.email')}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          {message ? (
            <Text variant="body" style={styles.ok}>
              {message}
            </Text>
          ) : null}
          {error ? (
            <Text variant="caption" style={styles.error}>
              {error}
            </Text>
          ) : null}
          <View style={styles.spacer} />
          <Button
            title={t('common.continue')}
            onPress={() => void onSubmit()}
            loading={loading}
          />
          <Link href="/(auth)/login" asChild>
            <Text variant="caption" style={styles.link}>
              {t('auth.sign_in')}
            </Text>
          </Link>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { paddingVertical: spacing.xxxl, gap: spacing.md },
  title: { marginBottom: spacing.md },
  spacer: { height: spacing.lg },
  ok: { color: colors.primary, marginTop: spacing.sm },
  error: { color: colors.error, marginTop: spacing.sm },
  link: { color: colors.primary, marginTop: spacing.lg, textAlign: 'center' },
});
