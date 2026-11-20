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

          {/* Toggle Pilihan Peran (Capsule Segmented Control) */}
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
              <View style={styles.whitelistBox}>
                <Text style={styles.whitelistNotice}>
                  * Email asisten wajib telah didaftarkan dalam whitelist oleh pengajar/PM.
                </Text>
              </View>
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
                <ActivityIndicator color="#FDFBF7" size="small" />
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
    paddingTop: 112,
    paddingBottom: 32,
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
  roleContainer: {
    marginBottom: 16,
  },
  roleLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2E3E2E',
    marginBottom: 8,
  },
  roleTabContainer: {
    flexDirection: 'row',
    backgroundColor: '#E4DAC6',
    borderRadius: 9999,
    padding: 4,
    height: 50,
    alignItems: 'center',
  },
  roleTabButton: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 9999,
  },
  roleTabButtonActive: {
    backgroundColor: '#3E5033',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  roleTabText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#34432A',
  },
  roleTabTextActive: {
    color: '#FDFBF7',
    fontWeight: '700',
  },
  whitelistBox: {
    backgroundColor: '#F4ECD8',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 10,
  },
  whitelistNotice: {
    fontSize: 12,
    color: '#5A4922',
    lineHeight: 17,
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
    marginTop: 22,
    marginBottom: 12,
    gap: 6,
  },
  footerText: {
    fontSize: 14,
    color: '#55634E',
  },
  loginLink: {
    fontSize: 14,
    fontWeight: '700',
    color: '#3E5033',
  },
});
