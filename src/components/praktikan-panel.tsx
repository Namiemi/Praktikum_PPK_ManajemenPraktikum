/**
 * @file praktikan-panel.tsx
 * @description Panel bawah Detail Sesi untuk praktikan (FR-25, FR-26).
 * Menampilkan form presensi, kartu presensi tercatat, atau info sesuai status sesi.
 */

import { router } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BottomSheet } from '@/components/bottom-sheet';
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
    infoIzin = (
      <View style={[styles.card, styles.cardInfo, styles.izinInfo]}>
        <Text style={styles.judulInfo}>
          {izinSaya.status === 'menunggu' ? 'Izin Menunggu Keputusan' : 'Izin Ditolak'}
        </Text>
        <Text style={styles.teksInfo}>
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
    backgroundColor: '#E4F2E4',
    borderColor: '#C8E6C9',
    alignItems: 'center',
  },
  judulHadir: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2E7D32',
  },
  teksHadir: {
    fontSize: 14,
    color: '#1B5E20',
    marginTop: 4,
  },
  cardIzin: {
    backgroundColor: '#E3EEF9',
    borderColor: '#C5DBF0',
  },
  judulIzin: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E5A96',
  },
  teksIzin: {
    fontSize: 13,
    color: '#2F4F6F',
    marginTop: 4,
  },
  cardInfo: {
    backgroundColor: '#FFFFFF',
    borderColor: '#EAECE3',
    borderStyle: 'dashed',
  },
  judulInfo: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1C281C',
  },
  teksInfo: {
    fontSize: 13,
    color: '#5A6B5A',
    marginTop: 4,
  },
  izinInfo: {
    marginTop: 12,
  },
  linkIzin: {
    marginTop: 12,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#C9CEC4',
  },
  linkPressed: {
    opacity: 0.7,
  },
  linkIzinText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D3E2D',
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
    color: '#2E7D32',
    marginTop: 4,
  },
  sheetInfo: {
    fontSize: 13,
    color: '#5A6B5A',
    marginTop: 4,
  },
});
