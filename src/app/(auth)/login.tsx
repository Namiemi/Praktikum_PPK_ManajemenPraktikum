import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FormField } from '@/components/form-field';
import {
  CardCornerLeafOrnament,
  HeaderBotanicalBlob,
} from '@/components/icons/praktikum-theme-icons';
import { Botanical } from '@/constants/theme';
import { useAuth } from '@/context/auth-context';
import { validateEmail, validatePassword } from '@/utils/validation';

export default function LoginScreen() {
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async () => {
    setGeneralError(null);

    const errEmail = validateEmail(email);
    const errPassword = validatePassword(password);

    setEmailError(errEmail);
    setPasswordError(errPassword);

    if (errEmail || errPassword) {
      return;
    }

    setIsSubmitting(true);
    try {
      await login(email, password);
      // Pengalihan ke layar tujuan ditangani secara otomatis oleh Route Guard di _layout.tsx
    } catch (err: any) {
      setGeneralError(
        err?.message || 'Gagal masuk. Periksa kembali email dan password Anda.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerOrnament} pointerEvents="none">
        <HeaderBotanicalBlob width={160} height={115} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <View style={styles.appBadge}>
              <Text style={styles.appTitle}>Manajemen Praktikum</Text>
            </View>
            <Text style={styles.title}>Masuk ke Akun</Text>
            <Text style={styles.subtitle}>
              Silakan masukkan email dan password untuk melanjutkan ke sesi praktikum.
            </Text>
          </View>

          {generalError ? (
            <View style={styles.errorBox}>
              <Text style={styles.generalErrorText}>{generalError}</Text>
            </View>
          ) : null}

          <View style={styles.formCard}>
            <FormField
              label="Email"
              placeholder="nama@ugm.ac.id"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (emailError) setEmailError(null);
                if (generalError) setGeneralError(null);
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              error={emailError}
              required
            />

            <FormField
              label="Password"
              placeholder="Masukkan password"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (passwordError) setPasswordError(null);
                if (generalError) setGeneralError(null);
              }}
              isPassword
              error={passwordError}
              required
            />

            <Pressable
              style={({ pressed }) => [
                styles.submitButton,
                isSubmitting && styles.submitButtonDisabled,
                pressed && !isSubmitting && styles.submitButtonPressed,
              ]}
              onPress={handleLogin}
              disabled={isSubmitting}
              accessibilityRole="button"
              accessibilityLabel="Tombol Masuk"
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.submitButtonText}>Masuk</Text>
              )}
            </Pressable>

            <View style={styles.cornerOrnament} pointerEvents="none">
              <CardCornerLeafOrnament width={68} height={68} />
            </View>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Belum memiliki akun?</Text>
            <Pressable
              onPress={() => router.push('/(auth)/register')}
              accessibilityRole="button"
              accessibilityLabel="Daftar Akun Baru"
            >
              <Text style={styles.registerLink}>Daftar Sekarang</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Botanical.canvas,
    position: 'relative',
  },
  headerOrnament: {
    position: 'absolute',
    top: 0,
    right: 0,
    zIndex: 0,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    marginBottom: 22,
    alignItems: 'center',
  },
  appBadge: {
    backgroundColor: Botanical.sagePill,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    marginBottom: 10,
  },
  appTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: Botanical.primaryDark,
    textTransform: 'uppercase',
    letterSpacing: 0.9,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Botanical.textPrimary,
    marginBottom: 6,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13.5,
    color: Botanical.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
  errorBox: {
    backgroundColor: Botanical.dangerBg,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  generalErrorText: {
    color: Botanical.dangerText,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  formCard: {
    backgroundColor: Botanical.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Botanical.border,
    overflow: 'hidden',
    position: 'relative',
  },
  submitButton: {
    backgroundColor: Botanical.primary,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  submitButtonDisabled: {
    backgroundColor: Botanical.disabled,
  },
  submitButtonPressed: {
    opacity: 0.85,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  cornerOrnament: {
    position: 'absolute',
    right: 0,
    bottom: 0,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
    gap: 6,
  },
  footerText: {
    fontSize: 14,
    color: Botanical.textMuted,
  },
  registerLink: {
    fontSize: 14,
    fontWeight: '700',
    color: Botanical.primary,
  },
});
