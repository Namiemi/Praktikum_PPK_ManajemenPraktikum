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
import { useAuth } from '@/context/auth-context';
import { Peran } from '@/types';
import {
  validateEmail,
  validateKonfirmasiPassword,
  validateNama,
  validateNim,
  validatePassword,
} from '@/utils/validation';

export default function RegisterScreen() {
  const { register } = useAuth();

  const [peran, setPeran] = useState<Peran>('praktikan');
  const [nama, setNama] = useState('');
  const [nim, setNim] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [konfirmasiPassword, setKonfirmasiPassword] = useState('');

  const [namaError, setNamaError] = useState<string | null>(null);
  const [nimError, setNimError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [konfirmasiError, setKonfirmasiError] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRegister = async () => {
    setGeneralError(null);

    const errNama = validateNama(nama);
    const errNim = validateNim(nim);
    const errEmail = validateEmail(email);
    const errPassword = validatePassword(password);
    const errKonfirmasi = validateKonfirmasiPassword(password, konfirmasiPassword);

    setNamaError(errNama);
    setNimError(errNim);
    setEmailError(errEmail);
    setPasswordError(errPassword);
    setKonfirmasiError(errKonfirmasi);

    if (errNama || errNim || errEmail || errPassword || errKonfirmasi) {
      return;
    }

    setIsSubmitting(true);
    try {
      await register({
        nama,
        nim,
        email,
        password,
        peran,
      });
      // Sukses: otomatis diarahkan oleh Route Guard di _layout.tsx
    } catch (err: any) {
      setGeneralError(
        err?.message || 'Pendaftaran akun gagal. Silakan coba kembali.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={styles.appTitle}>Manajemen Praktikum</Text>
            <Text style={styles.title}>Daftar Akun Baru</Text>
            <Text style={styles.subtitle}>
              Lengkapi data di bawah ini untuk membuat akun praktikum Anda.
            </Text>
          </View>

          {generalError ? (
            <View style={styles.errorBox}>
              <Text style={styles.generalErrorText}>{generalError}</Text>
            </View>
          ) : null}

          {/* Toggle Pilihan Peran */}
          <View style={styles.roleContainer}>
            <Text style={styles.roleLabel}>Pilih Peran Anda:</Text>
            <View style={styles.roleTabContainer}>
              <Pressable
                style={[
                  styles.roleTabButton,
                  peran === 'praktikan' && styles.roleTabButtonActive,
                ]}
                onPress={() => setPeran('praktikan')}
              >
                <Text
                  style={[
                    styles.roleTabText,
                    peran === 'praktikan' && styles.roleTabTextActive,
                  ]}
                >
                  Praktikan
                </Text>
              </Pressable>

              <Pressable
                style={[
                  styles.roleTabButton,
                  peran === 'asisten' && styles.roleTabButtonActive,
                ]}
                onPress={() => setPeran('asisten')}
              >
                <Text
                  style={[
                    styles.roleTabText,
                    peran === 'asisten' && styles.roleTabTextActive,
                  ]}
                >
                  Asisten
                </Text>
              </Pressable>
            </View>
            {peran === 'asisten' ? (
              <Text style={styles.whitelistNotice}>
                * Email asisten wajib telah didaftarkan dalam whitelist oleh pengajar/PM.
              </Text>
            ) : null}
          </View>

          <View style={styles.formCard}>
            <FormField
              label="Nama Lengkap"
              placeholder="Contoh: Dimas Pratama"
              value={nama}
              onChangeText={(text) => {
                setNama(text);
                if (namaError) setNamaError(null);
              }}
              autoCapitalize="words"
              error={namaError}
              required
            />

            <FormField
              label="Nomor Induk Mahasiswa (NIM)"
              placeholder="Contoh: 23512001 (8-15 digit angka)"
              value={nim}
              onChangeText={(text) => {
                setNim(text);
                if (nimError) setNimError(null);
              }}
              keyboardType="number-pad"
              error={nimError}
              required
            />

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
              placeholder="Minimal 6 karakter"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (passwordError) setPasswordError(null);
              }}
              isPassword
              error={passwordError}
              required
            />

            <FormField
              label="Konfirmasi Password"
              placeholder="Ulangi password"
              value={konfirmasiPassword}
              onChangeText={(text) => {
                setKonfirmasiPassword(text);
                if (konfirmasiError) setKonfirmasiError(null);
              }}
              isPassword
              error={konfirmasiError}
              required
            />

            <Pressable
              style={({ pressed }) => [
                styles.submitButton,
                isSubmitting && styles.submitButtonDisabled,
                pressed && !isSubmitting && styles.submitButtonPressed,
              ]}
              onPress={handleRegister}
              disabled={isSubmitting}
              accessibilityRole="button"
              accessibilityLabel="Tombol Daftar"
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.submitButtonText}>
                  Daftar sebagai {peran === 'asisten' ? 'Asisten' : 'Praktikan'}
                </Text>
              )}
            </Pressable>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Sudah memiliki akun?</Text>
            <Pressable
              onPress={() => router.push('/(auth)/login')}
              accessibilityRole="button"
              accessibilityLabel="Masuk ke Akun"
            >
              <Text style={styles.loginLink}>Masuk di sini</Text>
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
    backgroundColor: '#F9FAFB',
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
    marginBottom: 20,
    alignItems: 'center',
  },
  appTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#208AEF',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  errorBox: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#F87171',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  generalErrorText: {
    color: '#B91C1C',
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
  },
  roleContainer: {
    marginBottom: 16,
  },
  roleLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  roleTabContainer: {
    flexDirection: 'row',
    backgroundColor: '#E5E7EB',
    borderRadius: 8,
    padding: 4,
  },
  roleTabButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  roleTabButtonActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  roleTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  roleTabTextActive: {
    color: '#111827',
    fontWeight: '700',
  },
  whitelistNotice: {
    fontSize: 12,
    color: '#D97706',
    marginTop: 6,
    fontStyle: 'italic',
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  submitButton: {
    backgroundColor: '#111827',
    height: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  submitButtonPressed: {
    opacity: 0.85,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 12,
    gap: 6,
  },
  footerText: {
    fontSize: 14,
    color: '#6B7280',
  },
  loginLink: {
    fontSize: 14,
    fontWeight: '600',
    color: '#208AEF',
  },
});
