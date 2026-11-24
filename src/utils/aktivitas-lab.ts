/**
 * @file aktivitas-lab.ts
 * @description Menentukan praktikum yang sedang berlangsung dan berikutnya di sebuah
 * laboratorium berdasarkan data sesi (FR-39, SRS-43).
 */

import { SesiPraktikum } from "@/types";

export interface AktivitasLab {
  berlangsung: SesiPraktikum[];
  berikutnya: SesiPraktikum | null;
}

function waktuSesi(tanggal: string, jam: string): number {
  const [y, m, d] = tanggal.split("-").map(Number);
  const [h, mnt] = jam.split(":").map(Number);
  return new Date(y, m - 1, d, h, mnt).getTime();
}

/**
 * Sedang berlangsung: sesi berstatus DIBUKA, atau jadwalnya mencakup waktu sekarang
 * dan belum ditutup. Berikutnya: sesi terdekat yang belum dimulai dan belum ditutup.
 */
export function getAktivitasLab(
  labId: string,
  semuaSesi: SesiPraktikum[],
  sekarang: Date = new Date(),
): AktivitasLab {
  const now = sekarang.getTime();
  const sesiLab = semuaSesi.filter(
    (s) => s.labId === labId && s.status !== "DITUTUP",
  );

  const berlangsung = sesiLab
    .filter((s) => {
      if (s.status === "DIBUKA") return true;
      const mulai = waktuSesi(s.tanggal, s.jamMulai);
      const selesai = waktuSesi(s.tanggal, s.jamSelesai);
      return mulai <= now && now < selesai;
    })
    .sort(
      (a, b) =>
        waktuSesi(a.tanggal, a.jamMulai) - waktuSesi(b.tanggal, b.jamMulai),
    );

  const idBerlangsung = new Set(berlangsung.map((s) => s.id));
  const berikutnya =
    sesiLab
      .filter(
        (s) =>
          !idBerlangsung.has(s.id) && waktuSesi(s.tanggal, s.jamMulai) > now,
      )
      .sort(
        (a, b) =>
          waktuSesi(a.tanggal, a.jamMulai) - waktuSesi(b.tanggal, b.jamMulai),
      )[0] ?? null;

  return { berlangsung, berikutnya };
}
