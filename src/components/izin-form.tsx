/**
 * @file izin-form.tsx
 * @description Form pengajuan izin: pilih sesi, isi alasan, konfirmasi (FR-28).
 * Alasan diklasifikasikan model AI lokal sebelum disimpan (FR-29).
 */

import React, { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { ConfirmModal } from '@/components/confirm-modal';
import { FormField } from '@/components/form-field';
import { usePraktikum } from '@/context/praktikum-context';
import { klasifikasiAlasan } from '@/services/ai';
import { Izin, SesiPraktikum } from '@/types';
import { formatDateIndo } from '@/utils';
import { ALASAN_IZIN_MAX, validateAlasanIzin } from '@/utils/validation';

export interface IzinFormProps {
  /** Sesi yang masih boleh diajukan izin */
  sesiPilihan: SesiPraktikum[];
  /** Sesi yang langsung terpilih (misal dari Detail Sesi) */
  sesiIdAwal?: string;
  onSuccess: (izin: Izin) => void;
}

export function IzinForm({ sesiPilihan, sesiIdAwal, onSuccess }: IzinFormProps) {
  const { ajukanIzin } = usePraktikum();
  const [sesiId, setSesiId] = useState<string | null>(
    sesiPilihan.some((s) => s.id === sesiIdAwal) ? sesiIdAwal! : null
  );
  const [alasan, setAlasan] = useState('');
  const [errorSesi, setErrorSesi] = useState<string | null>(null);
  const [errorAlasan, setErrorAlasan] = useState<string | null>(null);
  const [errorKirim, setErrorKirim] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const sesiTerpilih = sesiPilihan.find((s) => s.id === sesiId);

  const handleAjukan = () => {
    const errSesi = sesiId ? null : 'Pilih sesi yang ingin diajukan izin.';
    const errAlasan = validateAlasanIzin(alasan);
    setErrorSesi(errSesi);
    setErrorAlasan(errAlasan);
    setErrorKirim(null);
    if (errSesi || errAlasan) return;
    setConfirmOpen(true);
  };

  const handleKirim = async () => {
    if (!sesiId) return;
    setConfirmOpen(false);
    setSubmitting(true);
    const hasilAI = klasifikasiAlasan(alasan);
    const result = await ajukanIzin(sesiId, alasan.trim(), hasilAI);
    setSubmitting(false);

    if (result.success && result.data) {
      onSuccess(result.data);
    } else {
      setErrorKirim(result.message);
    }
  };

  return (
    <View style={styles.card}>
      <Text style={styles.label}>
        Sesi Praktikum <Text style={styles.wajib}>*</Text>
      </Text>
      <View style={styles.sesiList}>
        {sesiPilihan.map((sesi) => {
          const aktif = sesi.id === sesiId;
          return (
            <Pressable
              key={sesi.id}
              style={[styles.sesiItem, aktif && styles.sesiItemAktif]}
              onPress={() => {
                setSesiId(sesi.id);
                setErrorSesi(null);
              }}
              disabled={submitting}
              accessibilityRole="radio"
              accessibilityState={{ selected: aktif, disabled: submitting }}
              accessibilityLabel={`${sesi.mataKuliah} pertemuan ${sesi.pertemuan}`}
            >
              <View style={[styles.radio, aktif && styles.radioAktif]}>
                {aktif ? <View style={styles.radioDot} /> : null}
              </View>
              <View style={styles.sesiInfo}>
                <Text style={styles.sesiJudul}>
                  {sesi.mataKuliah} · Pertemuan {sesi.pertemuan}
                </Text>
                <Text style={styles.sesiMeta}>
                  {formatDateIndo(sesi.tanggal)} · {sesi.jamMulai} - {sesi.jamSelesai} WIB
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>
      {errorSesi ? <Text style={styles.error}>{errorSesi}</Text> : null}

      <View style={styles.alasanWrap}>
        <FormField
          label="Alasan Izin"
          required
          value={alasan}
          onChangeText={(v) => {
            setAlasan(v);
            if (errorAlasan) setErrorAlasan(null);
          }}
          error={errorAlasan}
          placeholder="Contoh: Saya sakit demam dan disarankan dokter untuk istirahat."
          multiline
          maxLength={ALASAN_IZIN_MAX}
          editable={!submitting}
          style={styles.alasanInput}
          textAlignVertical="top"
        />
        <Text style={styles.counter}>
          {alasan.trim().length}/{ALASAN_IZIN_MAX}
        </Text>
      </View>

      <Text style={styles.catatanAI}>
        Alasan akan dianalisis otomatis oleh model AI sebagai informasi tambahan
        untuk asisten. Keputusan izin tetap ditentukan oleh asisten.
      </Text>

      {errorKirim ? <Text style={styles.errorKirim}>{errorKirim}</Text> : null}

      <Pressable
        style={({ pressed }) => [
          styles.tombol,
          submitting && styles.tombolDisabled,
          pressed && styles.tombolPressed,
        ]}
        onPress={handleAjukan}
        disabled={submitting}
        accessibilityRole="button"
        accessibilityLabel="Ajukan izin"
        accessibilityState={{ disabled: submitting, busy: submitting }}
      >
        {submitting ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.tombolText}>Ajukan Izin</Text>
        )}
      </Pressable>

      <ConfirmModal
        visible={confirmOpen}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={handleKirim}
        title="Ajukan Izin?"
        message={
          sesiTerpilih
            ? `Izin untuk ${sesiTerpilih.mataKuliah} pertemuan ${sesiTerpilih.pertemuan} hanya bisa diajukan satu kali dan tidak dapat diubah.`
            : ''
        }
        confirmText="Ya, Ajukan"
        cancelText="Batal"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E6E4DD',
    padding: 18,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2E3E2E',
    marginBottom: 8,
  },
  wajib: {
    color: '#9E3B2B',
  },
  sesiList: {
    gap: 8,
  },
  sesiItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E6E4DD',
    backgroundColor: '#FAF9F5',
  },
  sesiItemAktif: {
    borderColor: '#344E38',
    backgroundColor: '#EDF3E6',
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#A0A79A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioAktif: {
    borderColor: '#344E38',
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#344E38',
  },
  sesiInfo: {
    flex: 1,
  },
  sesiJudul: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C281C',
  },
  sesiMeta: {
    fontSize: 12,
    color: '#5A6B5A',
    marginTop: 2,
  },
  error: {
    marginTop: 6,
    fontSize: 12,
    color: '#9E3B2B',
  },
  alasanWrap: {
    marginTop: 16,
  },
  alasanInput: {
    height: 110,
    paddingTop: 12,
  },
  counter: {
    position: 'absolute',
    right: 0,
    top: 0,
    fontSize: 12,
    color: '#5A6B5A',
    fontVariant: ['tabular-nums'],
  },
  catatanAI: {
    fontSize: 12,
    lineHeight: 18,
    color: '#5A6B5A',
    marginBottom: 14,
  },
  errorKirim: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9E3B2B',
    backgroundColor: '#F4DFDA',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  tombol: {
    backgroundColor: '#344E38',
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
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
