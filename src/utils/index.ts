/**
 * Modul fungsi bantuan (utils) untuk format waktu dan pembuatan kode presensi.
 */

/**
 * Menghasilkan kode presensi 4 digit acak.
 */
export function generateKodePresensi(): string {
  return String(Math.floor(1000 + Math.random() * 9000));
}

/**
 * Mengambil waktu saat ini dalam format HH:MM:SS.
 */
export function getFormattedTime(date: Date = new Date()): string {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}

/**
 * Format tanggal YYYY-MM-DD ke teks bahasa Indonesia sederhana.
 */
export function formatDateIndo(dateStr: string): string {
  try {
    const [year, month, day] = dateStr.split('-');
    const bulan = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    const monthIndex = parseInt(month, 10) - 1;
    return `${parseInt(day, 10)} ${bulan[monthIndex]} ${year}`;
  } catch {
    return dateStr;
  }
}
