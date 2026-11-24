/**
 * @file filter-sesi.ts
 * @description Pencarian dan filter daftar jadwal sesi (FR-36, SRS-35).
 * Dipakai jadwal praktikan dan dapat dipakai ulang oleh jadwal asisten.
 */

import { SesiPraktikum, StatusSesi } from '@/types';

export type RentangJam = 'pagi' | 'siang' | 'sore';

export const RENTANG_JAM: Record<RentangJam, { label: string; dari: string; sampai: string }> = {
  pagi: { label: 'Pagi (< 12.00)', dari: '00:00', sampai: '11:59' },
  siang: { label: 'Siang (12.00-14.59)', dari: '12:00', sampai: '14:59' },
  sore: { label: 'Sore (>= 15.00)', dari: '15:00', sampai: '23:59' },
};

export interface KriteriaFilterSesi {
  /** Dicocokkan ke mata kuliah, topik, dan ruangan (tidak peka huruf besar) */
  kataKunci: string;
  mataKuliah: string | null;
  /** Tanggal YYYY-MM-DD */
  tanggal: string | null;
  /** Dicocokkan ke jam mulai sesi */
  rentangJam: RentangJam | null;
  status: StatusSesi | null;
}

export const KRITERIA_KOSONG: KriteriaFilterSesi = {
  kataKunci: '',
  mataKuliah: null,
  tanggal: null,
  rentangJam: null,
  status: null,
};

export function filterSesi(
  sesiList: SesiPraktikum[],
  kriteria: KriteriaFilterSesi
): SesiPraktikum[] {
  const kunci = kriteria.kataKunci.trim().toLowerCase();
  const rentang = kriteria.rentangJam ? RENTANG_JAM[kriteria.rentangJam] : null;

  return sesiList.filter((sesi) => {
    if (
      kunci &&
      ![sesi.mataKuliah, sesi.topik, sesi.ruang].some((teks) =>
        (teks ?? '').toLowerCase().includes(kunci)
      )
    ) {
      return false;
    }
    if (kriteria.mataKuliah && sesi.mataKuliah !== kriteria.mataKuliah) return false;
    if (kriteria.tanggal && sesi.tanggal !== kriteria.tanggal) return false;
    if (rentang && (sesi.jamMulai < rentang.dari || sesi.jamMulai > rentang.sampai)) {
      return false;
    }
    if (kriteria.status && sesi.status !== kriteria.status) return false;
    return true;
  });
}

/** Jumlah filter aktif selain kata kunci, untuk ditampilkan di tombol filter. */
export function hitungFilterAktif(kriteria: KriteriaFilterSesi): number {
  return [kriteria.mataKuliah, kriteria.tanggal, kriteria.rentangJam, kriteria.status].filter(
    Boolean
  ).length;
}
