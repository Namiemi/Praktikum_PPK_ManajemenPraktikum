/**
 * @file presensi-form.tsx
 * @description Form input kode presensi dengan validasi dan konfirmasi bergaya Botanical (FR-26).
 */

import React, { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { ConfirmModal } from '@/components/confirm-modal';
import { FormField } from '@/components/form-field';
import { CardCornerLeafOrnament } from '@/components/icons/praktikum-theme-icons';
import { Botanical } from '@/constants/theme';
import { usePraktikum } from '@/context/praktikum-context';
import { Presensi } from '@/types';
import { validateKodePresensi } from '@/utils/validation';

export interface PresensiFormProps {
  sesiId: string;
  onSuccess: (presensi: Presensi) => void;
}

export function PresensiForm({ sesiId, onSuccess }: PresensiFormProps) {
  const { presensi } = usePraktikum();
  const [kode, setKode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [errorKirim, setErrorKirim] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (value: string) => {
    setKode(value.replace(/\D/g, ''));
    if (error) setError(null);
    if (errorKirim) setErrorKirim(null);
  };

  const handleKonfirmasi = () => {
    const errKode = validateKodePresensi(kode);
    if (errKode) {
      setError(errKode);
      return;
    }
    setConfirmOpen(true);
  };

  const handleKirim = async () => {
    setConfirmOpen(false);
    setSubmitting(true);
    const result = await presensi(sesiId, kode.trim());
    setSubmitting(false);

    if (result.success && result.data) {
      setKode('');
      onSuccess(result.data);
    } else {
      setKode('');
      setErrorKirim(result.message);
    }
  };

  return (
    <View style={styles.card}>
      <Text style={styles.judul}>Presensi Kehadiran</Text>
      <Text style={styles.deskripsi}>
        Masukkan 4 digit kode presensi yang ditunjukkan asisten.
      </Text>

      {errorKirim ? (
        <View
          style={styles.alert}
          accessibilityRole="alert"
          accessibilityLiveRegion="assertive"
        >
          <Text style={styles.alertJudul}>Presensi gagal</Text>
          <Text style={styles.alertTeks}>{errorKirim}</Text>
        </View>
      ) : null}

      <FormField
        label="Kode Presensi"
        required
        value={kode}
        onChangeText={handleChange}
        error={error}
        placeholder="Contoh: 1234"
        keyboardType="number-pad"
        maxLength={4}
        editable={!submitting}
        returnKeyType="done"
        onSubmitEditing={handleKonfirmasi}
        accessibilityLabel="Kode presensi"
      />

      <Pressable
        style={({ pressed }) => [
          styles.tombol,
          (submitting || !kode) && styles.tombolDisabled,
          pressed && !submitting && kode && styles.tombolPressed,
        ]}
        onPress={handleKonfirmasi}
        disabled={submitting || !kode}
        accessibilityRole="button"
        accessibilityLabel="Kirim presensi"
        accessibilityState={{ disabled: submitting || !kode, busy: submitting }}
      >
        {submitting ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.tombolText}>Kirim Presensi</Text>
        )}
      </Pressable>

      <View style={styles.cornerOrnament} pointerEvents="none">
        <CardCornerLeafOrnament width={64} height={64} />
      </View>

      <ConfirmModal
        visible={confirmOpen}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={handleKirim}
        title="Konfirmasi Presensi"
        message={`Kirim presensi dengan kode ${kode}?`}
        confirmText="Ya, Kirim"
        cancelText="Batal"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Botanical.surface,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: Botanical.border,
    overflow: 'hidden',
    position: 'relative',
  },
  judul: {
    fontSize: 16,
    fontWeight: '700',
    color: Botanical.textPrimary,
  },
  deskripsi: {
    fontSize: 13,
    lineHeight: 19,
    color: Botanical.textMuted,
    marginTop: 4,
    marginBottom: 14,
  },
  alert: {
    backgroundColor: Botanical.dangerBg,
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
  },
  alertJudul: {
    fontSize: 13,
    fontWeight: '700',
    color: Botanical.dangerText,
  },
  alertTeks: {
    fontSize: 12.5,
    color: Botanical.dangerText,
    marginTop: 2,
  },
  tombol: {
    backgroundColor: Botanical.primary,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  tombolDisabled: {
    backgroundColor: Botanical.disabled,
  },
  tombolPressed: {
    opacity: 0.85,
  },
  tombolText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  cornerOrnament: {
    position: 'absolute',
    right: 0,
    bottom: 0,
  },
});
