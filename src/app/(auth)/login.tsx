import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
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
  PilihPeranWaveBottom,
  PilihPeranWaveTop,
} from '@/components/icons/praktikum-theme-icons';
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
      <StatusBar style="dark" />

      <View style={styles.waveTopWrapper} pointerEvents="none">
        <PilihPeranWaveTop width="100%" height={210} />
      </View>

      <View style={styles.waveBottomWrapper} pointerEvents="none">
        <PilihPeranWaveBottom width="100%" height={130} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.appTitle}>Manajemen Praktikum</Text>
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
                <ActivityIndicator color="#FDFBF7" size="small" />
              ) : (
                <Text style={styles.submitButtonText}>Masuk</Text>
              )}
            </Pressable>
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
    backgroundColor: '#FAF6EB',
    position: 'relative',
  },
  waveTopWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 0,
  },
  waveBottomWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 0,
  },
  keyboardView: {
    flex: 1,
    zIndex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 118,
    paddingBottom: 32,
    justifyContent: 'center',
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    marginBottom: 22,
    alignItems: 'center',
  },
  appTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#3E5033',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#23311E',
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#55634E',
    textAlign: 'center',
    lineHeight: 20,
  },
  errorBox: {
    backgroundColor: '#F4DFDA',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    marginBottom: 16,
  },
  generalErrorText: {
    color: '#9E3B2B',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: '#EFE8DC',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  submitButton: {
    backgroundColor: '#3E5033',
    height: 52,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButtonDisabled: {
    opacity: 0.45,
  },
  submitButtonPressed: {
    opacity: 0.85,
  },
  submitButtonText: {
    color: '#FDFBF7',
    fontSize: 16,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    gap: 6,
  },
  footerText: {
    fontSize: 14,
    color: '#55634E',
  },
  registerLink: {
    fontSize: 14,
    fontWeight: '700',
    color: '#3E5033',
  },
});
