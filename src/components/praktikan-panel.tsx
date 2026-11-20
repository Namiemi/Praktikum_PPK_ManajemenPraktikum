/**
 * @file praktikan-panel.tsx
 * @description Panel bawah Detail Sesi untuk praktikan (FR-25, FR-26).
 * Menampilkan form presensi, kartu presensi tercatat, atau info sesuai status sesi.
 */

import { router } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BottomSheet } from '@/components/bottom-sheet';
import { CheckIcon } from '@/components/icons/praktikum-theme-icons';
import { PresensiForm } from '@/components/presensi-form';
import { usePraktikum } from '@/context/praktikum-context';
import { SesiPraktikum } from '@/types';

export interface PraktikanPanelProps {
  sesi: SesiPraktikum;
}

export function PraktikanPanel({ sesi }: PraktikanPanelProps) {
  const { currentUser, getPresensiBySesi, getIzinBySesi } = usePraktikum();
  const [waktuSukses, setWaktuSukses] = useState<string | null>(null);

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
      <PresensiForm
        sesiId={sesi.id}
        onSuccess={(p) => setWaktuSukses(p.waktuPresensi)}
      />
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

      <BottomSheet
        visible={waktuSukses !== null}
        onClose={() => setWaktuSukses(null)}
        title="Presensi Berhasil"
        closeText="Tutup"
      >
        <View style={styles.sheetBody}>
          <Text style={styles.sheetJudul}>Kehadiran Anda tercatat</Text>
          <Text style={styles.sheetWaktu}>Pukul {waktuSukses} WIB</Text>
          <Text style={styles.sheetInfo}>Terima kasih telah hadir.</Text>
        </View>
      </BottomSheet>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
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
  sheetBody: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  sheetJudul: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1C281C',
  },
  sheetWaktu: {
    fontSize: 15,
    fontWeight: '700',
    color: '#344E38',
    fontVariant: ['tabular-nums'],
    marginTop: 4,
  },
  sheetInfo: {
    fontSize: 13,
    color: '#5A6B5A',
    marginTop: 4,
  },
});
