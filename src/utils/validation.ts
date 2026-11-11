/**
 * @file validation.ts
 * @description Utilitas validasi input form (FR-19, SRS-30).
 * Setiap validator mengembalikan pesan error Bahasa Indonesia, atau `null` bila valid.
 */

export type ValidationResult = string | null;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NIM_REGEX = /^\d{8,15}$/;
const KODE_PRESENSI_REGEX = /^\d{4}$/;
const TANGGAL_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const JAM_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

export const ALASAN_IZIN_MIN = 10;
export const ALASAN_IZIN_MAX = 300;
export const PASSWORD_MIN = 6;

/** Wajib diisi (tidak kosong setelah di-trim). */
export function validateRequired(value: string, label: string): ValidationResult {
  return value.trim() ? null : `${label} wajib diisi.`;
}

export function validateNama(value: string): ValidationResult {
  const nama = value.trim();
  if (!nama) return 'Nama wajib diisi.';
  if (nama.length < 3) return 'Nama minimal 3 karakter.';
  return null;
}

export function validateEmail(value: string): ValidationResult {
  const email = value.trim();
  if (!email) return 'Email wajib diisi.';
  return EMAIL_REGEX.test(email) ? null : 'Format email tidak valid.';
}

export function validatePassword(value: string): ValidationResult {
  if (!value) return 'Password wajib diisi.';
  return value.length >= PASSWORD_MIN
    ? null
    : `Password minimal ${PASSWORD_MIN} karakter.`;
}

export function validateKonfirmasiPassword(
  password: string,
  konfirmasi: string
): ValidationResult {
  if (!konfirmasi) return 'Konfirmasi password wajib diisi.';
  return password === konfirmasi ? null : 'Konfirmasi password tidak sama.';
}

export function validateNim(value: string): ValidationResult {
  const nim = value.trim();
  if (!nim) return 'NIM wajib diisi.';
  return NIM_REGEX.test(nim) ? null : 'NIM harus 8–15 digit angka.';
}

export function validateKodePresensi(value: string): ValidationResult {
  const kode = value.trim();
  if (!kode) return 'Kode presensi tidak boleh kosong.';
  return KODE_PRESENSI_REGEX.test(kode)
    ? null
    : 'Kode presensi harus 4 digit angka.';
}

export function validateAlasanIzin(value: string): ValidationResult {
  const panjang = value.trim().length;
  if (panjang === 0) return 'Alasan izin wajib diisi.';
  if (panjang < ALASAN_IZIN_MIN) return `Alasan minimal ${ALASAN_IZIN_MIN} karakter.`;
  if (panjang > ALASAN_IZIN_MAX) return `Alasan maksimal ${ALASAN_IZIN_MAX} karakter.`;
  return null;
}

/** Tanggal format YYYY-MM-DD yang benar-benar ada di kalender. */
export function validateTanggal(value: string): ValidationResult {
  const tanggal = value.trim();
  if (!tanggal) return 'Tanggal wajib diisi.';
  if (!TANGGAL_REGEX.test(tanggal)) return 'Format tanggal harus YYYY-MM-DD.';
  const [y, m, d] = tanggal.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const valid =
    date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d;
  return valid ? null : 'Tanggal tidak valid.';
}

/** Jam format HH:MM (24 jam). */
export function validateJam(value: string, label = 'Jam'): ValidationResult {
  const jam = value.trim();
  if (!jam) return `${label} wajib diisi.`;
  return JAM_REGEX.test(jam) ? null : `${label} harus berformat HH:MM.`;
}

/** Jam selesai harus setelah jam mulai (keduanya HH:MM valid). */
export function validateRentangJam(
  jamMulai: string,
  jamSelesai: string
): ValidationResult {
  return jamSelesai.trim() > jamMulai.trim()
    ? null
    : 'Jam selesai harus setelah jam mulai.';
}

/** Bilangan bulat positif (misal nomor pertemuan). */
export function validateBilanganPositif(value: string, label: string): ValidationResult {
  const teks = value.trim();
  if (!teks) return `${label} wajib diisi.`;
  return /^\d+$/.test(teks) && Number(teks) > 0
    ? null
    : `${label} harus berupa angka lebih dari 0.`;
}
