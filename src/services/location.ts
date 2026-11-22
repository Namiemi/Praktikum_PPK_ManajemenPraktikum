/**
 * @file location.ts
 * @description Service lokasi perangkat: izin akses, posisi saat ini, pemantauan posisi,
 * dan perhitungan jarak Haversine untuk validasi radius presensi (FR-31, FR-37).
 */

import * as Location from 'expo-location';
import { Linking } from 'react-native';

const RADIUS_BUMI_METER = 6371000;

/**
 * Status izin lokasi dari expo-location.
 */
export type StatusIzinLokasi = Awaited<
  ReturnType<typeof Location.requestForegroundPermissionsAsync>
>['status'];

/**
 * Hasil permintaan atau pemeriksaan izin lokasi.
 */
export interface HasilIzinLokasi {
  granted: boolean;
  status: StatusIzinLokasi;
}

/**
 * Menghitung jarak dua koordinat memakai rumus Haversine.
 * @returns Jarak dalam meter (dibulatkan)
 */
export function hitungJarakMeter(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const toRad = (derajat: number) => (derajat * Math.PI) / 180;

  const deltaLat = toRad(lat2 - lat1);
  const deltaLon = toRad(lon2 - lon1);

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(deltaLon / 2) *
      Math.sin(deltaLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(RADIUS_BUMI_METER * c);
}

/**
 * Meminta izin akses lokasi saat aplikasi digunakan (foreground).
 */
export async function requestIzinLokasi(): Promise<HasilIzinLokasi> {
  const { granted, status } = await Location.requestForegroundPermissionsAsync();
  return { granted, status };
}

/**
 * Memeriksa izin akses lokasi tanpa menampilkan dialog.
 */
export async function cekIzinLokasi(): Promise<HasilIzinLokasi> {
  const { granted, status } = await Location.getForegroundPermissionsAsync();
  return { granted, status };
}

/**
 * Memeriksa apakah layanan lokasi (GPS) perangkat sedang aktif.
 */
export async function cekLayananLokasiAktif(): Promise<boolean> {
  return Location.hasServicesEnabledAsync();
}

/**
 * Mengambil posisi perangkat saat ini.
 * @returns `null` bila lokasi belum tersedia atau pengambilan gagal
 */
export async function ambilPosisiSaatIni(): Promise<Location.LocationObject | null> {
  try {
    return await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
  } catch {
    return null;
  }
}

/**
 * Memantau perubahan posisi perangkat selama aplikasi di foreground.
 * @param callback Dipanggil setiap posisi baru diterima
 * @param onError Dipanggil bila pemantauan gagal
 * @param intervalJeda Jeda minimum antar-pembaruan dalam milidetik
 * @returns Fungsi untuk menghentikan pemantauan
 */
export function pantauPosisi(
  callback: (lokasi: Location.LocationObject) => void,
  onError?: (err: unknown) => void,
  intervalJeda = 5000
): () => void {
  let subscription: Location.LocationSubscription | null = null;
  let dihentikan = false;

  Location.watchPositionAsync(
    {
      accuracy: Location.Accuracy.High,
      timeInterval: intervalJeda,
      distanceInterval: 0,
    },
    callback,
    (alasan) => {
      if (onError) onError(alasan);
    }
  )
    .then((sub) => {
      if (dihentikan) {
        sub.remove();
        return;
      }
      subscription = sub;
    })
    .catch((err) => {
      if (onError) onError(err);
    });

  return () => {
    dihentikan = true;
    subscription?.remove();
    subscription = null;
  };
}

/**
 * Membuka halaman pengaturan perangkat agar pengguna dapat mengaktifkan izin
 * lokasi atau layanan GPS.
 */
export async function bukaPengaturanPerangkat(): Promise<void> {
  await Linking.openSettings();
}
