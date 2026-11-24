/**
 * @file jadwal-filter.ts
 * @description Utilitas pure function untuk pencarian dan filter daftar jadwal sesi (FR-36, SRS-35).
 */

import { SesiPraktikum, StatusSesi } from '@/types';

export type FilterStatusSesi = 'SEMUA' | StatusSesi;

export interface JadwalFilterState {
  query: string;
  status: FilterStatusSesi;
  mataKuliah: string;
  tanggal: string;
  jamMulai: string;
  jamSelesai: string;
  ruang: string;
}

export interface JadwalFilterOptions {
  mataKuliahList: string[];
  ruangList: string[];
}

export const INITIAL_JADWAL_FILTER: JadwalFilterState = {
  query: '',
  status: 'SEMUA',
  mataKuliah: '',
  tanggal: '',
  jamMulai: '',
  jamSelesai: '',
  ruang: '',
};

/**
 * Menghitung jumlah filter lanjutan yang sedang aktif (mata kuliah, tanggal, jam, ruangan).
 */
export function countActiveAdvancedFilters(filter: JadwalFilterState): number {
  let count = 0;
  if (filter.mataKuliah) count += 1;
  if (filter.tanggal) count += 1;
  if (filter.jamMulai || filter.jamSelesai) count += 1;
  if (filter.ruang) count += 1;
  return count;
}

/**
 * true bila ada kata kunci pencarian, status non-SEMUA, atau filter lanjutan aktif.
 */
export function hasActiveJadwalFilter(filter: JadwalFilterState): boolean {
  return (
    filter.query.trim().length > 0 ||
    filter.status !== 'SEMUA' ||
    countActiveAdvancedFilters(filter) > 0
  );
}

/**
 * Mengekstrak daftar unik mata kuliah dan ruangan dari daftar sesi secara terurut.
 */
export function extractJadwalFilterOptions(
  sesiList: SesiPraktikum[]
): JadwalFilterOptions {
  const matkulSet = new Set<string>();
  const ruangSet = new Set<string>();

  for (const sesi of sesiList) {
    if (sesi.mataKuliah.trim()) matkulSet.add(sesi.mataKuliah.trim());
    if (sesi.ruang.trim()) ruangSet.add(sesi.ruang.trim());
  }

  return {
    mataKuliahList: [...matkulSet].sort((a, b) => a.localeCompare(b)),
    ruangList: [...ruangSet].sort((a, b) => a.localeCompare(b)),
  };
}

function cocokRentangJam(
  sesi: SesiPraktikum,
  jamMulaiFilter: string,
  jamSelesaiFilter: string
): boolean {
  const mulai = jamMulaiFilter.trim();
  const selesai = jamSelesaiFilter.trim();
  if (!mulai && !selesai) return true;

  // Menggunakan pencocokan irisan rentang jam agar sesi yang sedang berlangsung
  // pada rentang tersebut tetap ditemukan, tanpa menyertakan sesi yang tepat
  // berakhir/dimulai di batas luar interval.
  if (mulai && selesai) {
    const [batasAwal, batasAkhir] =
      mulai <= selesai ? [mulai, selesai] : [selesai, mulai];
    if (batasAwal === batasAkhir) {
      return sesi.jamMulai <= batasAwal && sesi.jamSelesai >= batasAwal;
    }
    return sesi.jamMulai < batasAkhir && sesi.jamSelesai > batasAwal;
  }

  if (mulai) {
    return sesi.jamSelesai > mulai;
  }

  return sesi.jamMulai < selesai;
}

/**
 * Menyaring daftar sesi praktikum berdasarkan pencarian teks dan seluruh filter aktif.
 */
export function filterJadwalSesi(
  sesiList: SesiPraktikum[],
  filter: JadwalFilterState
): SesiPraktikum[] {
  const queryNorm = filter.query.trim().toLowerCase();

  return sesiList.filter((sesi) => {
    if (filter.status !== 'SEMUA' && sesi.status !== filter.status) {
      return false;
    }

    if (
      filter.mataKuliah &&
      sesi.mataKuliah.trim() !== filter.mataKuliah.trim()
    ) {
      return false;
    }

    if (filter.ruang && sesi.ruang.trim() !== filter.ruang.trim()) {
      return false;
    }

    if (filter.tanggal && sesi.tanggal.trim() !== filter.tanggal.trim()) {
      return false;
    }

    if (!cocokRentangJam(sesi, filter.jamMulai, filter.jamSelesai)) {
      return false;
    }

    if (!queryNorm) return true;

    const haystack = [
      sesi.mataKuliah,
      sesi.topik,
      sesi.ruang,
      `kelas ${sesi.kelas}`,
    ]
      .join(' ')
      .toLowerCase();

    return haystack.includes(queryNorm);
  });
}
