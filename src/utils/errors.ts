/**
 * @file errors.ts
 * @description Pemetaan kode error Firebase ke pesan Bahasa Indonesia (FR-19, SRS-31).
 */

const PESAN_ERROR: Record<string, string> = {
  // Firebase Authentication
  'auth/invalid-credential': 'Email atau password salah.',
  'auth/wrong-password': 'Email atau password salah.',
  'auth/user-not-found': 'Akun dengan email tersebut tidak ditemukan.',
  'auth/invalid-email': 'Format email tidak valid.',
  'auth/email-already-in-use': 'Email sudah terdaftar. Silakan login.',
  'auth/weak-password': 'Password terlalu lemah (minimal 6 karakter).',
  'auth/too-many-requests':
    'Terlalu banyak percobaan. Tunggu beberapa saat lalu coba lagi.',
  'auth/network-request-failed':
    'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.',
  'auth/user-disabled': 'Akun ini telah dinonaktifkan.',
  'auth/requires-recent-login': 'Silakan login ulang untuk melanjutkan.',

  // Cloud Firestore
  'firestore/permission-denied': 'Anda tidak memiliki akses untuk tindakan ini.',
  'firestore/unavailable':
    'Server sedang tidak dapat dijangkau. Periksa koneksi internet Anda.',
  'firestore/not-found': 'Data tidak ditemukan.',
  'firestore/already-exists': 'Data sudah ada.',
  'firestore/deadline-exceeded': 'Permintaan terlalu lama. Coba lagi.',
  'firestore/unauthenticated': 'Sesi login berakhir. Silakan login kembali.',
  'firestore/resource-exhausted': 'Kuota server habis. Coba lagi nanti.',
  'firestore/failed-precondition': 'Data belum siap diproses. Coba lagi.',
  'firestore/aborted': 'Operasi dibatalkan karena bentrok. Coba lagi.',
};

export const PESAN_DEFAULT = 'Terjadi kesalahan. Coba lagi.';

/** Mengambil `code` dari objek error Firebase, bila ada. */
export function getErrorCode(err: unknown): string | undefined {
  if (typeof err === 'object' && err !== null && 'code' in err) {
    const code = (err as { code?: unknown }).code;
    return typeof code === 'string' ? code : undefined;
  }
  return undefined;
}

/**
 * Mengubah error apa pun menjadi pesan ramah Bahasa Indonesia.
 * @param err Error yang ditangkap di blok `catch`
 * @param fallback Pesan bila kode tidak dikenal
 */
export function getErrorMessage(err: unknown, fallback = PESAN_DEFAULT): string {
  const code = getErrorCode(err);
  if (code && PESAN_ERROR[code]) {
    return PESAN_ERROR[code];
  }
  return fallback;
}

/** true bila error adalah penolakan Security Rules. */
export function isPermissionDenied(err: unknown): boolean {
  return getErrorCode(err) === 'firestore/permission-denied';
}
