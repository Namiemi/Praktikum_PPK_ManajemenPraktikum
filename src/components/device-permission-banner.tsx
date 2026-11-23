/**
 * @file device-permission-banner.tsx
 * @description Banner status izin perangkat dan kondisi lokasi/notifikasi (FR-33, SRS-48).
 */

import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AlertCircleIcon } from '@/components/icons/modal-icons';
import {
  ClockIcon,
  MapPinIcon,
} from '@/components/icons/praktikum-theme-icons';
import { bukaPengaturanPerangkat } from '@/services';

export type StatusIzinPerangkat =
  | 'izin_lokasi_ditolak'
  | 'izin_notifikasi_ditolak'
  | 'gps_mati'
  | 'lokasi_memuat'
  | 'di_luar_radius'
  | 'notifikasi_gagal';

export interface DevicePermissionBannerProps {
  /** Kondisi perangkat yang ingin ditampilkan */
  status: StatusIzinPerangkat;
  /** Pesan tambahan untuk mengganti deskripsi bawaan */
  pesan?: string;
  /** Aksi coba lagi; tombol "Coba Lagi" hanya muncul bila diisi */
  onRetry?: () => void;
}

interface KonfigurasiBanner {
  judul: string;
  deskripsi: string;
  tampilkanPengaturan: boolean;
  jenisIkon: 'lokasi' | 'waktu' | 'peringatan';
  nada: 'bahaya' | 'peringatan' | 'info';
}

const KONFIGURASI: Record<StatusIzinPerangkat, KonfigurasiBanner> = {
  izin_lokasi_ditolak: {
    judul: 'Izin lokasi ditolak',
    deskripsi:
      'Aplikasi memerlukan akses lokasi untuk memeriksa jarak Anda ke laboratorium. Buka pengaturan perangkat dan izinkan akses lokasi.',
    tampilkanPengaturan: true,
    jenisIkon: 'lokasi',
    nada: 'bahaya',
  },
  izin_notifikasi_ditolak: {
    judul: 'Izin notifikasi ditolak',
    deskripsi:
      'Aktifkan izin notifikasi di pengaturan perangkat agar pemberitahuan sesi, jadwal, dan keputusan izin praktikum tetap diterima.',
    tampilkanPengaturan: true,
    jenisIkon: 'peringatan',
    nada: 'bahaya',
  },
  gps_mati: {
    judul: 'GPS tidak aktif',
    deskripsi:
      'Aktifkan layanan lokasi (GPS) di perangkat agar aplikasi dapat memeriksa posisi Anda terhadap laboratorium.',
    tampilkanPengaturan: true,
    jenisIkon: 'lokasi',
    nada: 'peringatan',
  },
  lokasi_memuat: {
    judul: 'Mencari lokasi...',
    deskripsi:
      'Mohon tunggu, aplikasi sedang mengambil posisi perangkat Anda. Pastikan GPS aktif dan berada di area terbuka.',
    tampilkanPengaturan: false,
    jenisIkon: 'waktu',
    nada: 'info',
  },
  di_luar_radius: {
    judul: 'Di luar radius laboratorium',
    deskripsi:
      'Posisi Anda berada di luar radius laboratorium. Mendekatlah ke titik laboratorium, lalu coba lagi.',
    tampilkanPengaturan: false,
    jenisIkon: 'lokasi',
    nada: 'peringatan',
  },
  notifikasi_gagal: {
    judul: 'Notifikasi gagal',
    deskripsi:
      'Aplikasi tidak dapat menampilkan notifikasi. Periksa izin notifikasi dan koneksi perangkat, lalu coba lagi.',
    tampilkanPengaturan: false,
    jenisIkon: 'peringatan',
    nada: 'bahaya',
  },
};

const WARNA_IKON: Record<KonfigurasiBanner['nada'], string> = {
  bahaya: '#9E3B2B',
  peringatan: '#8A6D1F',
  info: '#3E543E',
};

const LATAR_IKON: Record<KonfigurasiBanner['nada'], string> = {
  bahaya: '#F4DFDA',
  peringatan: '#F7EFD8',
  info: '#E8EEE4',
};

function IkonBanner({
  jenis,
  nada,
}: {
  jenis: KonfigurasiBanner['jenisIkon'];
  nada: KonfigurasiBanner['nada'];
}) {
  if (jenis === 'waktu') {
    return <ClockIcon size={24} color={WARNA_IKON[nada]} />;
  }
  if (jenis === 'peringatan') {
    return <AlertCircleIcon size={24} />;
  }
  return <MapPinIcon size={24} color={WARNA_IKON[nada]} />;
}

/**
 * Banner untuk menjelaskan kondisi izin perangkat, GPS, lokasi, atau notifikasi.
 *
 * Contoh pemakaian untuk Abhista:
 * ```tsx
 * <DevicePermissionBanner
 *   status="di_luar_radius"
 *   pesan={`Jarak Anda ${jarak} m dari laboratorium.`}
 *   onRetry={muatUlangLokasi}
 * />
 * ```
 */
export function DevicePermissionBanner({
  status,
  pesan,
  onRetry,
}: DevicePermissionBannerProps) {
  const konfigurasi = KONFIGURASI[status];

  return (
    <View style={styles.container}>
      <View
        style={[styles.ikonWrapper, { backgroundColor: LATAR_IKON[konfigurasi.nada] }]}
      >
        <IkonBanner jenis={konfigurasi.jenisIkon} nada={konfigurasi.nada} />
      </View>

      <View style={styles.konten}>
        <Text style={styles.judul}>{konfigurasi.judul}</Text>
        <Text style={styles.deskripsi}>{pesan ?? konfigurasi.deskripsi}</Text>

        <View style={styles.aksi}>
          {konfigurasi.tampilkanPengaturan ? (
            <Pressable
              style={({ pressed }) => [
                styles.tombolUtama,
                pressed && styles.tombolPressed,
              ]}
              onPress={() => {
                void bukaPengaturanPerangkat();
              }}
              accessibilityRole="button"
              accessibilityLabel="Buka Pengaturan"
            >
              <Text style={styles.teksTombolUtama}>Buka Pengaturan</Text>
            </Pressable>
          ) : null}

          {onRetry ? (
            <Pressable
              style={({ pressed }) => [
                styles.tombolSekunder,
                pressed && styles.tombolPressed,
              ]}
              onPress={onRetry}
              accessibilityRole="button"
              accessibilityLabel="Coba Lagi"
            >
              <Text style={styles.teksTombolSekunder}>Coba Lagi</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E6E4DD',
    borderRadius: 16,
    padding: 16,
  },
  ikonWrapper: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  konten: {
    flex: 1,
  },
  judul: {
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
    color: '#1C281C',
  },
  deskripsi: {
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 19,
    color: '#5A6B5A',
    marginTop: 4,
  },
  aksi: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  tombolUtama: {
    backgroundColor: '#344E38',
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  tombolSekunder: {
    backgroundColor: '#F5F2EB',
    borderWidth: 1,
    borderColor: '#D5E0D5',
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  tombolPressed: {
    opacity: 0.85,
  },
  teksTombolUtama: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  teksTombolSekunder: {
    color: '#344E38',
    fontSize: 13,
    fontWeight: '600',
  },
});
