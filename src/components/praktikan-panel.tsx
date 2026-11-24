/**
 * @file praktikan-panel.tsx
 * @description Panel bawah Detail Sesi untuk praktikan (FR-25, FR-37).
 * Menampilkan tombol menuju halaman presensi, kartu presensi tercatat, atau info sesuai status sesi.
 */

import { router } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { CheckIcon } from '@/components/icons/praktikum-theme-icons';
import { usePraktikum } from '@/context/praktikum-context';
import { SesiPraktikum } from '@/types';

export interface PraktikanPanelProps {
  sesi: SesiPraktikum;
}

export function PraktikanPanel({ sesi }: PraktikanPanelProps) {
  const { currentUser, getPresensiBySesi, getIzinBySesi } = usePraktikum();

  const presensiSaya = getPresensiBySesi(sesi.id).find(
    (p) => p.praktikanId === currentUser?.id
  );
  const izinSaya = getIzinBySesi(sesi.id).find(
    (i) => i.praktikanId === currentUser?.id
  );

  let konten: React.ReactNode;

  if (presensiSaya) {
    konten = (
      <View style={[styles.card, styles.cardHadir]}>
        <View style={styles.hadirBadge}>
          <CheckIcon size={18} color="#2D3E2D" />
        </View>
        <Text style={styles.judulHadir}>Presensi Tercatat</Text>
        <Text style={styles.teksHadir}>Pukul {presensiSaya.waktuPresensi} WIB</Text>
      </View>
    );
  } else if (izinSaya?.status === 'diterima') {
    konten = (
      <View style={[styles.card, styles.cardIzin]}>
        <Text style={styles.judulIzin}>Izin Diterima</Text>
        <Text style={styles.teksIzin}>
          Anda tercatat izin pada sesi ini, tidak perlu melakukan presensi.
        </Text>
      </View>
    );
  } else if (sesi.status === 'DIBUKA') {
    konten = (
      <View style={[styles.card, styles.cardBuka]}>
        <Text style={styles.judulInfo}>Sesi Sedang Dibuka</Text>
        <Text style={styles.teksInfo}>
          Lakukan presensi di halaman presensi. Lokasi Anda akan diperiksa
          terhadap radius laboratorium.
        </Text>
        <Pressable
          style={({ pressed }) => [styles.tombolPresensi, pressed && styles.linkPressed]}
          onPress={() => router.push(`/presensi/${sesi.id}`)}
          accessibilityRole="button"
          accessibilityLabel="Buka halaman presensi"
        >
          <Text style={styles.tombolPresensiText}>Buka Halaman Presensi</Text>
        </Pressable>
      </View>
    );
  } else if (sesi.status === 'DITUTUP') {
    konten = (
      <View style={[styles.card, styles.cardInfo]}>
        <Text style={styles.judulInfo}>Sesi Sudah Ditutup</Text>
        <Text style={styles.teksInfo}>
          Presensi untuk sesi ini sudah tidak dapat dilakukan.
        </Text>
      </View>
    );
  } else {
    konten = (
      <View style={[styles.card, styles.cardInfo]}>
        <Text style={styles.judulInfo}>Sesi Belum Dibuka</Text>
        <Text style={styles.teksInfo}>
          Form presensi akan muncul otomatis saat asisten membuka sesi.
        </Text>
      </View>
    );
  }

  let infoIzin: React.ReactNode = null;
  if (!presensiSaya && izinSaya && izinSaya.status !== 'diterima') {
    const isDitolak = izinSaya.status === 'ditolak';
    infoIzin = (
      <View
        style={[
          styles.card,
          isDitolak ? styles.cardDitolak : styles.cardInfo,
          styles.izinInfo,
        ]}
      >
        <Text style={isDitolak ? styles.judulDitolak : styles.judulInfo}>
          {izinSaya.status === 'menunggu' ? 'Izin Menunggu Keputusan' : 'Izin Ditolak'}
        </Text>
        <Text style={isDitolak ? styles.teksDitolak : styles.teksInfo}>
          {izinSaya.status === 'menunggu'
            ? 'Pengajuan izin Anda sedang diperiksa asisten.'
            : izinSaya.catatanAsisten
              ? `Catatan asisten: ${izinSaya.catatanAsisten}`
              : 'Silakan hadir dan lakukan presensi bila sesi dibuka.'}
        </Text>
      </View>
    );
  } else if (!presensiSaya && !izinSaya && sesi.status !== 'DITUTUP') {
    infoIzin = (
      <Pressable
        style={({ pressed }) => [styles.linkIzin, pressed && styles.linkPressed]}
        onPress={() =>
          router.push({ pathname: '/izin/ajukan', params: { sesiId: sesi.id } })
        }
        accessibilityRole="button"
        accessibilityLabel="Ajukan izin untuk sesi ini"
      >
        <Text style={styles.linkIzinText}>Tidak bisa hadir? Ajukan izin</Text>
      </Pressable>
    );
  }

  return (
    <>
      {konten}
      {infoIzin}

    </>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
  },
  cardBuka: {
    backgroundColor: '#FFFFFF',
    borderColor: '#C8D7B8',
  },
  tombolPresensi: {
    marginTop: 12,
    backgroundColor: '#2D3E2D',
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tombolPresensiText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  cardHadir: {
    backgroundColor: '#EDF3E6',
    borderColor: '#C8D7B8',
    alignItems: 'center',
  },
  hadirBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#C8D7B8',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  judulHadir: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1C281C',
  },
  teksHadir: {
    fontSize: 13,
    fontWeight: '500',
    color: '#3E543E',
    marginTop: 4,
    fontVariant: ['tabular-nums'],
  },
  cardIzin: {
    backgroundColor: '#FAF5E6',
    borderColor: '#E6DAB8',
  },
  judulIzin: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4A3D1D',
  },
  teksIzin: {
    fontSize: 13,
    lineHeight: 19,
    color: '#6B5A31',
    marginTop: 4,
  },
  cardDitolak: {
    backgroundColor: '#FDF4F2',
    borderColor: '#F4DFDA',
  },
  judulDitolak: {
    fontSize: 15,
    fontWeight: '700',
    color: '#9E3B2B',
  },
  teksDitolak: {
    fontSize: 13,
    lineHeight: 19,
    color: '#7A2F23',
    marginTop: 4,
  },
  cardInfo: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E6E4DD',
    borderStyle: 'dashed',
  },
  judulInfo: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1C281C',
  },
  teksInfo: {
    fontSize: 13,
    lineHeight: 19,
    color: '#5A6B5A',
    marginTop: 4,
  },
  izinInfo: {
    marginTop: 12,
  },
  linkIzin: {
    marginTop: 12,
    paddingVertical: 13,
    alignItems: 'center',
    borderRadius: 14,
    backgroundColor: '#F5F2EB',
    borderWidth: 1,
    borderColor: '#D5E0D5',
  },
  linkPressed: {
    opacity: 0.82,
  },
  linkIzinText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3E543E',
  },
});
