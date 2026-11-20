/**
 * @file presensi-form.tsx
 * @description Form input kode presensi dengan validasi dan konfirmasi (FR-26).
 */

import React, { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { ConfirmModal } from '@/components/confirm-modal';
import { FormField } from '@/components/form-field';
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
          pressed && styles.tombolPressed,
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
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E6E4DD',
  },
  judul: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1C281C',
  },
  deskripsi: {
    fontSize: 13,
    lineHeight: 19,
    color: '#5A6B5A',
    marginTop: 4,
    marginBottom: 12,
  },
  alert: {
    backgroundColor: '#F4DFDA',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 12,
  },
  alertJudul: {
    fontSize: 13,
    fontWeight: '700',
    color: '#9E3B2B',
  },
  alertTeks: {
    fontSize: 12,
    fontWeight: '500',
    color: '#9E3B2B',
    marginTop: 2,
  },
  tombol: {
    backgroundColor: '#344E38',
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  tombolDisabled: {
    backgroundColor: '#C9CEC4',
  },
  tombolPressed: {
    opacity: 0.85,
  },
  tombolText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
