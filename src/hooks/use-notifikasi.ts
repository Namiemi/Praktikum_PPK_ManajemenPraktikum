/**
 * @file use-notifikasi.ts
 * @description Sisi penerima notifikasi kegiatan praktikum (FR-31, FR-40, SRS-44 s.d. SRS-48).
 *
 * Saat pengguna login hook ini: meminta izin notifikasi, menyiapkan channel,
 * menyimpan token FCM ke `users/{uid}`, lalu mendengarkan koleksi `notifikasi`
 * dan menampilkan notifikasi lokal untuk dokumen BARU saja. Semua kegagalan
 * ditangani agar aplikasi tidak crash (izin ditolak, koneksi putus, rules menolak).
 */

import { useEffect } from 'react';

import { useAuth } from '@/context/auth-context';
import {
    ambilTokenFCM,
    buatSaluranNotifikasi,
    langgananNotifikasi,
    langgananRefreshTokenFCM,
    requestIzinNotifikasi,
    simpanTokenFCM,
    tampilkanNotifikasiLokal,
} from '@/services';

export function useNotifikasi() {
  const { currentUser } = useAuth();
  const uid = currentUser?.id;

  useEffect(() => {
    if (!uid) return;

    let dibatalkan = false;
    let unsubNotifikasi: (() => void) | null = null;
    let unsubToken: (() => void) | null = null;

    const simpanToken = async (token: string | null) => {
      if (!token) return;
      try {
        await simpanTokenFCM(uid, token);
      } catch (err) {
        // Tidak fatal: notifikasi lokal tetap berjalan tanpa token tersimpan.
        console.warn('Gagal menyimpan token FCM:', err);
      }
    };

    const mulai = async () => {
      try {
        const izin = await requestIzinNotifikasi();
        if (dibatalkan) return;
        // Izin ditolak: tidak ada yang bisa ditampilkan. Pengguna dapat mengaktifkannya
        // lewat banner status izin perangkat (DevicePermissionBanner).
        if (!izin.granted) return;

        await buatSaluranNotifikasi();
        if (dibatalkan) return;

        await simpanToken(await ambilTokenFCM());
        if (dibatalkan) return;
        unsubToken = langgananRefreshTokenFCM((token) => {
          void simpanToken(token);
        });

        // ID yang sudah ditangani. Snapshot pertama hanya menjadi baseline sehingga
        // notifikasi lama tidak muncul ulang setiap aplikasi dibuka.
        const sudahDitangani = new Set<string>();
        let baselineSiap = false;

        unsubNotifikasi = langgananNotifikasi(
          uid,
          (daftar) => {
            if (!baselineSiap) {
              daftar.forEach((n) => sudahDitangani.add(n.id));
              baselineSiap = true;
              return;
            }

            for (const n of daftar) {
              if (sudahDitangani.has(n.id)) continue;
              // `dibuatPada` belum terisi = timestamp server belum terkonfirmasi.
              // Ditunggu snapshot berikutnya agar tidak ditampilkan dua kali.
              if (!n.dibuatPada) continue;

              sudahDitangani.add(n.id);

              const data: Record<string, string> = { tipe: n.tipe };
              if (n.sesiId) data.sesiId = n.sesiId;
              if (n.kelasId) data.kelasId = n.kelasId;

              tampilkanNotifikasiLokal(n.id, n.judul, n.pesan, data).catch(
                (err) => console.warn('Gagal menampilkan notifikasi:', err)
              );
            }
          },
          (err) => console.warn('Listener notifikasi gagal:', err)
        );
      } catch (err) {
        console.warn('Gagal menyiapkan notifikasi:', err);
      }
    };

    void mulai();

    return () => {
      dibatalkan = true;
      unsubNotifikasi?.();
      unsubToken?.();
    };
  }, [uid]);
}