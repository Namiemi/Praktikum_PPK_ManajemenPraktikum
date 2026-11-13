/**
 * @file ai.ts
 * @description Klasifikasi sentimen alasan izin dengan model EDOM lokal dari asisten praktikum (FR-29).
 * Model berjalan di perangkat tanpa jaringan. Hasilnya hanya informasi, tidak pernah mengubah status izin.
 */

import model from '../../ai/model-edom.json';
import { createSentimentClassifier } from '../../ai/sentiment';

import { HasilAI } from '@/types';

// Dibuat sekali agar model tidak dimuat ulang setiap pemanggilan.
const classify = createSentimentClassifier(model);

/**
 * Mengklasifikasikan alasan izin menjadi 'positif', 'netral', atau 'negatif'.
 * Jika teks tidak dikenali model atau terjadi kesalahan, mengembalikan `statusAI: 'gagal'`.
 */
export function klasifikasiAlasan(alasan: string): HasilAI {
  try {
    const prediksi = classify(alasan);
    if (prediksi.label === null || !prediksi.scores) {
      return { kategoriAI: null, skorAI: null, statusAI: 'gagal' };
    }
    return {
      kategoriAI: prediksi.label,
      skorAI: Math.round(Math.max(...prediksi.scores) * 1000) / 1000,
      statusAI: 'berhasil',
    };
  } catch {
    return { kategoriAI: null, skorAI: null, statusAI: 'gagal' };
  }
}
