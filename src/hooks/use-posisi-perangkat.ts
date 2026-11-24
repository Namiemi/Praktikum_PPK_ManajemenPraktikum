/**
 * @file use-posisi-perangkat.ts
 * @description Hook posisi perangkat real-time beserta penanganan izin lokasi dan GPS
 * (FR-33, FR-37, FR-38). Dipakai halaman presensi dan peta laboratorium.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';

import {
  cekIzinLokasi,
  cekLayananLokasiAktif,
  pantauPosisi,
  requestIzinLokasi,
} from '@/services';

export type StatusPosisi = 'memuat' | 'izin_ditolak' | 'gps_mati' | 'siap' | 'gagal';

export interface Koordinat {
  latitude: number;
  longitude: number;
  /** Akurasi dalam meter, bila tersedia */
  akurasi: number | null;
}

export interface PosisiPerangkat {
  status: StatusPosisi;
  posisi: Koordinat | null;
  /** Meminta izin dan memulai ulang pemantauan posisi */
  muatUlang: () => void;
}

export function usePosisiPerangkat(aktif = true): PosisiPerangkat {
  const [status, setStatus] = useState<StatusPosisi>('memuat');
  const [posisi, setPosisi] = useState<Koordinat | null>(null);
  const [pemicu, setPemicu] = useState({ ke: 0, mintaIzin: true });
  const statusRef = useRef<StatusPosisi>('memuat');

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  const muatUlang = useCallback(() => {
    setStatus((prev) => (prev === 'siap' ? prev : 'memuat'));
    setPemicu((p) => ({ ke: p.ke + 1, mintaIzin: true }));
  }, []);

  // Saat kembali dari pengaturan perangkat, periksa ulang tanpa memunculkan
  // dialog izin lagi (dialog yang ditolak juga memicu AppState 'active').
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      const perluCek =
        statusRef.current === 'izin_ditolak' || statusRef.current === 'gps_mati';
      if (state === 'active' && perluCek) {
        setStatus('memuat');
        setPemicu((p) => ({ ke: p.ke + 1, mintaIzin: false }));
      }
    });
    return () => sub.remove();
  }, []);

  useEffect(() => {
    if (!aktif) return;

    let berhenti: (() => void) | null = null;
    let dibatalkan = false;

    (async () => {
      try {
        const izin = pemicu.mintaIzin
          ? await requestIzinLokasi()
          : await cekIzinLokasi();
        if (dibatalkan) return;
        if (!izin.granted) {
          setStatus('izin_ditolak');
          return;
        }

        const gpsAktif = await cekLayananLokasiAktif();
        if (dibatalkan) return;
        if (!gpsAktif) {
          setStatus('gps_mati');
          return;
        }

        berhenti = pantauPosisi(
          (lokasi) => {
            setPosisi({
              latitude: lokasi.coords.latitude,
              longitude: lokasi.coords.longitude,
              akurasi: lokasi.coords.accuracy ?? null,
            });
            setStatus('siap');
          },
          () => setStatus('gagal')
        );
        if (dibatalkan) berhenti();
      } catch {
        if (!dibatalkan) setStatus('gagal');
      }
    })();

    return () => {
      dibatalkan = true;
      berhenti?.();
    };
  }, [aktif, pemicu]);

  return { status, posisi, muatUlang };
}
