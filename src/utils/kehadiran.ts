/**
 * @file kehadiran.ts
 * @description Penentuan status kehadiran praktikan pada sebuah sesi (FR-25, FR-27).
 */

import { Izin, Presensi, SesiPraktikum } from '@/types';

export type StatusKehadiran = 'hadir' | 'izin' | 'tidak_hadir' | 'menunggu';

/**
 * Presensi selalu didahulukan, lalu izin yang sudah diterima asisten.
 * Sesi yang ditutup tanpa keduanya dianggap tidak hadir; selain itu masih menunggu.
 */
export function getStatusKehadiran(
  sesi: SesiPraktikum,
  presensi?: Presensi,
  izin?: Izin
): StatusKehadiran {
  if (presensi) return 'hadir';
  if (izin?.status === 'diterima') return 'izin';
  if (sesi.status === 'DITUTUP') return 'tidak_hadir';
  return 'menunggu';
}

/**
 * Sesi yang masih boleh diajukan izin (FR-28): belum ditutup, belum presensi,
 * dan belum pernah diajukan izin. Sama dengan syarat di Security Rules.
 */
export function bisaAjukanIzin(
  sesi: SesiPraktikum,
  presensiList: Presensi[],
  izinList: Izin[]
): boolean {
  return (
    sesi.status !== 'DITUTUP' &&
    !presensiList.some((p) => p.sesiId === sesi.id) &&
    !izinList.some((i) => i.sesiId === sesi.id)
  );
}
