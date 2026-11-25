/**
 * @file notifikasi-asisten.ts
 * @description Helper orkestrasi penulisan notifikasi kegiatan praktikum (FR-40)
 * dari aksi asisten (`bukaSesi`, `ubahSesi`, `putuskanIzin`).
 */

import { tulisNotifikasi } from '@/services';
import { Izin, SesiInput, SesiPraktikum, User } from '@/types';
import { formatDateIndo } from '@/utils';

/**
 * Mengirim notifikasi `SESI_DIBUKA` kepada seluruh praktikan di kelas terkait.
 */
export async function kirimNotifSesiDibuka(
  sesi: SesiPraktikum,
  praktikanList: User[]
): Promise<void> {
  const penerima = praktikanList.filter((p) => p.kelasId === sesi.kelasId);
  if (penerima.length === 0) return;

  const hasil = await Promise.allSettled(
    penerima.map((praktikan) =>
      tulisNotifikasi({
        tipe: 'SESI_DIBUKA',
        judul: 'Sesi Praktikum Dibuka',
        pesan: `${sesi.mataKuliah} (Pertemuan ${sesi.pertemuan}) di ${sesi.ruang} telah dibuka oleh asisten.`,
        sesiId: sesi.id,
        kelasId: sesi.kelasId,
        targetUid: praktikan.id,
      })
    )
  );

  const jumlahGagal = hasil.filter((r) => r.status === 'rejected').length;
  if (jumlahGagal > 0) {
    console.warn(`Gagal mengirim ${jumlahGagal} notifikasi SESI_DIBUKA.`);
  }
}

/**
 * Memeriksa apakah jadwal (tanggal, jam, ruang/lab, atau kelas) sesi mengalami perubahan.
 */
export function apakahJadwalSesiBerubah(
  sesiLama: SesiPraktikum,
  inputBaru: SesiInput
): boolean {
  const labLama = sesiLama.labId ?? null;
  const labBaru = inputBaru.labId ?? null;
  const labBerubah =
    labLama !== null && labLama !== labBaru;
  return (
    sesiLama.tanggal.trim() !== inputBaru.tanggal.trim() ||
    sesiLama.jamMulai.trim() !== inputBaru.jamMulai.trim() ||
    sesiLama.jamSelesai.trim() !== inputBaru.jamSelesai.trim() ||
    sesiLama.ruang.trim() !== inputBaru.ruang.trim() ||
    labBerubah ||
    sesiLama.kelasId !== inputBaru.kelasId
  );
}

/**
 * Mengirim notifikasi `JADWAL_DIUBAH` kepada praktikan kelas terkait bila waktu/ruang sesi berubah.
 */
export async function kirimNotifJadwalDiubah(
  sesiLama: SesiPraktikum,
  inputBaru: SesiInput,
  praktikanList: User[]
): Promise<void> {
  if (!apakahJadwalSesiBerubah(sesiLama, inputBaru)) return;

  const targetKelasIds = new Set([sesiLama.kelasId, inputBaru.kelasId]);
  const penerima = praktikanList.filter(
    (p) => p.kelasId && targetKelasIds.has(p.kelasId)
  );
  if (penerima.length === 0) return;

  const tanggalTampil = formatDateIndo(inputBaru.tanggal.trim());
  const pesan = `${inputBaru.mataKuliah} (Pertemuan ${inputBaru.pertemuan}) diperbarui: ${tanggalTampil}, ${inputBaru.jamMulai.trim()}–${inputBaru.jamSelesai.trim()} WIB di ${inputBaru.ruang.trim()}.`;

  const hasil = await Promise.allSettled(
    penerima.map((praktikan) =>
      tulisNotifikasi({
        tipe: 'JADWAL_DIUBAH',
        judul: 'Jadwal Praktikum Diperbarui',
        pesan,
        sesiId: sesiLama.id,
        kelasId: inputBaru.kelasId,
        targetUid: praktikan.id,
      })
    )
  );

  const jumlahGagal = hasil.filter((r) => r.status === 'rejected').length;
  if (jumlahGagal > 0) {
    console.warn(`Gagal mengirim ${jumlahGagal} notifikasi JADWAL_DIUBAH.`);
  }
}

/**
 * Mengirim notifikasi `IZIN_DIPUTUSKAN` kepada praktikan pengaju izin.
 */
export async function kirimNotifIzinDiputuskan(
  izin: Izin,
  keputusan: 'diterima' | 'ditolak',
  catatan?: string
): Promise<void> {
  const statusTeks = keputusan === 'diterima' ? 'Diterima' : 'Ditolak';
  const catatanTrim = catatan?.trim();
  const tambahanCatatan = catatanTrim ? ` Catatan: ${catatanTrim}` : '';

  try {
    await tulisNotifikasi({
      tipe: 'IZIN_DIPUTUSKAN',
      judul: `Pengajuan Izin ${statusTeks}`,
      pesan: `Pengajuan izin Anda untuk ${izin.sesiLabel} telah ${statusTeks.toLowerCase()}.${tambahanCatatan}`,
      sesiId: izin.sesiId,
      targetUid: izin.praktikanId,
    });
  } catch (err) {
    console.warn('Gagal mengirim notifikasi IZIN_DIPUTUSKAN:', err);
  }
}
