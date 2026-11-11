/**
 * @file praktikum-context.tsx
 * @description Context state management real-time untuk data praktikum, sesi, presensi, dan izin (FR-17).
 * Berlangganan Cloud Firestore secara real-time berdasarkan peran pengguna aktif.
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

import { useAuth } from '@/context/auth-context';
import {
  ajukanIzin as serviceAjukanIzin,
  bukaSesi as serviceBukaSesi,
  catatPresensi as serviceCatatPresensi,
  putuskanIzin as servicePutuskanIzin,
  subscribeIzinAsisten,
  subscribeIzinPraktikan,
  subscribeKelasAsisten,
  subscribeKelasById,
  subscribeKode,
  subscribePraktikan,
  subscribePresensiSaya,
  subscribePresensiSesi,
  subscribeSesiAsisten,
  subscribeSesiKelas,
  tutupSesi as serviceTutupSesi,
} from '@/services';
import {
  ActionResult,
  HasilAI,
  Izin,
  Kelas,
  PraktikumContextType,
  Presensi,
  SesiPraktikum,
  User,
} from '@/types';
import { getErrorMessage, isPermissionDenied } from '@/utils/errors';
import { validateAlasanIzin, validateKodePresensi } from '@/utils/validation';

const PraktikumContext = createContext<PraktikumContextType | undefined>(
  undefined
);

export const PraktikumProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { currentUser, logout: authLogout } = useAuth();

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [retryTrigger, setRetryTrigger] = useState<number>(0);

  const [rawSesiList, setRawSesiList] = useState<SesiPraktikum[]>([]);
  const [kelasList, setKelasList] = useState<Kelas[]>([]);
  const [izinList, setIzinList] = useState<Izin[]>([]);
  const [praktikanList, setPraktikanList] = useState<User[]>([]);

  // Map kode presensi per sesi (khusus asisten): sesiId -> kode
  const [kodeMap, setKodeMap] = useState<Record<string, string>>({});

  // Map riwayat presensi: sesiId -> Presensi[]
  const [presensiMap, setPresensiMap] = useState<Record<string, Presensi[]>>({});

  const retry = useCallback(() => {
    setError(null);
    setLoading(true);
    setRetryTrigger((prev) => prev + 1);
  }, []);

  // Cleanup sub-listeners sesi saat unmount atau refresh
  const sesiListenersRef = useRef<Record<string, () => void>>({});

  useEffect(() => {
    const activeSubscribers = sesiListenersRef.current;
    return () => {
      Object.values(activeSubscribers).forEach((unsub) => unsub());
      sesiListenersRef.current = {};
    };
  }, [currentUser?.id, retryTrigger]);

  // Efek utama berlangganan data Firestore berdasarkan peran
  useEffect(() => {
    if (!currentUser) {
      setRawSesiList([]);
      setKelasList([]);
      setIzinList([]);
      setPraktikanList([]);
      setKodeMap({});
      setPresensiMap({});
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    const unsubs: Array<() => void> = [];

    const handleError = (err: unknown) => {
      setError(getErrorMessage(err));
      setLoading(false);
    };

    if (currentUser.peran === 'asisten') {
      // 1. Langganan sesi asisten
      const unsubSesi = subscribeSesiAsisten(
        currentUser.id,
        (list) => {
          setRawSesiList(list);
          setLoading(false);

          // Pasang listener kode dan presensi per sesi jika sesi dibuka / aktif
          list.forEach((sesi) => {
            const listenerKey = `sesi_${sesi.id}`;
            if (!sesiListenersRef.current[listenerKey]) {
              const unsubKode = subscribeKode(sesi.id, (kode) => {
                if (kode) {
                  setKodeMap((prev) => ({ ...prev, [sesi.id]: kode }));
                }
              });

              const unsubPresensi = subscribePresensiSesi(
                sesi.id,
                (presensiItems) => {
                  setPresensiMap((prev) => ({
                    ...prev,
                    [sesi.id]: presensiItems,
                  }));
                }
              );

              sesiListenersRef.current[listenerKey] = () => {
                unsubKode();
                unsubPresensi();
              };
            }
          });
        },
        handleError
      );
      unsubs.push(unsubSesi);

      // 2. Langganan kelas asisten
      const unsubKelas = subscribeKelasAsisten(
        currentUser.id,
        (list) => setKelasList(list),
        handleError
      );
      unsubs.push(unsubKelas);

      // 3. Langganan daftar praktikan untuk pemilihan peserta kelas
      const unsubPraktikan = subscribePraktikan(
        (list) => setPraktikanList(list),
        handleError
      );
      unsubs.push(unsubPraktikan);

      // 4. Langganan permohonan izin
      const unsubIzin = subscribeIzinAsisten(
        currentUser.id,
        (list) => setIzinList(list),
        handleError
      );
      unsubs.push(unsubIzin);
    } else {
      // --- Praktikan ---
      const kelasId = currentUser.kelasId;

      if (kelasId) {
        // 1. Langganan sesi kelas praktikan
        const unsubSesi = subscribeSesiKelas(
          kelasId,
          (list) => {
            setRawSesiList(list);
            setLoading(false);

            // Langganan status presensi praktikan pada masing-masing sesi
            list.forEach((sesi) => {
              const listenerKey = `presensi_prak_${sesi.id}`;
              if (!sesiListenersRef.current[listenerKey]) {
                const unsubPresensi = subscribePresensiSaya(
                  sesi.id,
                  currentUser.id,
                  (p) => {
                    setPresensiMap((prev) => ({
                      ...prev,
                      [sesi.id]: p ? [p] : [],
                    }));
                  }
                );
                sesiListenersRef.current[listenerKey] = unsubPresensi;
              }
            });
          },
          handleError
        );
        unsubs.push(unsubSesi);

        // 2. Langganan detail kelas praktikan
        const unsubKelas = subscribeKelasById(
          kelasId,
          (k) => setKelasList(k ? [k] : []),
          handleError
        );
        unsubs.push(unsubKelas);
      } else {
        // Belum terdaftar di kelas manapun
        setRawSesiList([]);
        setKelasList([]);
        setLoading(false);
      }

      // 3. Langganan izin praktikan
      const unsubIzin = subscribeIzinPraktikan(
        currentUser.id,
        (list) => setIzinList(list),
        handleError
      );
      unsubs.push(unsubIzin);
    }

    return () => {
      unsubs.forEach((u) => u());
    };
  }, [currentUser?.id, currentUser?.peran, currentUser?.kelasId, retryTrigger]);

  // Enrich sesiList dengan totalPraktikan dan kodePresensi
  const sesiList: SesiPraktikum[] = rawSesiList.map((sesi) => {
    const totalPraktikan =
      currentUser?.peran === 'asisten'
        ? praktikanList.filter((p) => p.kelasId === sesi.kelasId).length
        : 0;

    return {
      ...sesi,
      kodePresensi: kodeMap[sesi.id],
      totalPraktikan,
    };
  });

  // Flat presensi list
  const presensiList: Presensi[] = Object.values(presensiMap).flat();

  // FR-08 / FR-22: Buka Sesi Praktikum
  const bukaSesi = async (
    sesiId: string
  ): Promise<ActionResult<SesiPraktikum>> => {
    if (!currentUser || currentUser.peran !== 'asisten') {
      return {
        success: false,
        message: 'Hanya asisten yang dapat membuka sesi praktikum.',
      };
    }

    const sesi = rawSesiList.find((s) => s.id === sesiId);
    if (!sesi) {
      return { success: false, message: 'Sesi praktikum tidak ditemukan.' };
    }

    if (sesi.status !== 'BELUM_DIBUKA') {
      return {
        success: false,
        message: 'Hanya sesi yang belum dibuka yang dapat dibuka.',
      };
    }

    try {
      const kode = await serviceBukaSesi(sesiId);
      const updatedSesi: SesiPraktikum = {
        ...sesi,
        status: 'DIBUKA',
        kodePresensi: kode,
      };
      return {
        success: true,
        message: 'Sesi praktikum berhasil dibuka.',
        data: updatedSesi,
      };
    } catch (err) {
      return {
        success: false,
        message: getErrorMessage(err, 'Gagal membuka sesi praktikum.'),
      };
    }
  };

  // FR-08 / FR-22: Tutup Sesi Praktikum
  const tutupSesi = async (
    sesiId: string
  ): Promise<ActionResult<SesiPraktikum>> => {
    if (!currentUser || currentUser.peran !== 'asisten') {
      return {
        success: false,
        message: 'Hanya asisten yang dapat menutup sesi praktikum.',
      };
    }

    const sesi = rawSesiList.find((s) => s.id === sesiId);
    if (!sesi) {
      return { success: false, message: 'Sesi tidak ditemukan.' };
    }

    if (sesi.status !== 'DIBUKA') {
      return {
        success: false,
        message: 'Hanya sesi yang dibuka yang dapat ditutup.',
      };
    }

    try {
      await serviceTutupSesi(sesiId);
      const updatedSesi: SesiPraktikum = {
        ...sesi,
        status: 'DITUTUP',
      };
      return {
        success: true,
        message: 'Sesi praktikum berhasil ditutup.',
        data: updatedSesi,
      };
    } catch (err) {
      return {
        success: false,
        message: getErrorMessage(err, 'Gagal menutup sesi praktikum.'),
      };
    }
  };

  // FR-12 / FR-26: Presensi Praktikan
  const presensi = async (
    sesiId: string,
    kodeInput: string
  ): Promise<ActionResult<Presensi>> => {
    if (!currentUser || currentUser.peran !== 'praktikan') {
      return {
        success: false,
        message: 'Hanya praktikan yang dapat melakukan presensi.',
      };
    }

    const sesi = rawSesiList.find((s) => s.id === sesiId);
    if (!sesi) {
      return { success: false, message: 'Sesi praktikum tidak ditemukan.' };
    }

    if (sesi.status === 'BELUM_DIBUKA') {
      return {
        success: false,
        message: 'Sesi praktikum belum dibuka oleh asisten.',
      };
    }
    if (sesi.status === 'DITUTUP') {
      return {
        success: false,
        message: 'Sesi praktikum sudah ditutup.',
      };
    }

    const errKode = validateKodePresensi(kodeInput);
    if (errKode) {
      return { success: false, message: errKode };
    }

    if (hasPraktikanPresensi(sesiId, currentUser.id)) {
      return {
        success: false,
        message: 'Anda sudah melakukan presensi pada sesi ini.',
      };
    }

    try {
      const dataPresensi = await serviceCatatPresensi(
        sesiId,
        currentUser,
        kodeInput
      );
      return {
        success: true,
        message: `Presensi berhasil dicatat pukul ${dataPresensi.waktuPresensi}`,
        data: dataPresensi,
      };
    } catch (err) {
      if (isPermissionDenied(err)) {
        return {
          success: false,
          message: 'Kode presensi salah atau sesi belum dibuka.',
        };
      }
      return {
        success: false,
        message: getErrorMessage(err, 'Gagal mencatat presensi.'),
      };
    }
  };

  // FR-28: Pengajuan Izin Praktikan
  const ajukanIzin = async (
    sesiId: string,
    alasan: string,
    hasilAI?: HasilAI
  ): Promise<ActionResult<Izin>> => {
    if (!currentUser || currentUser.peran !== 'praktikan') {
      return {
        success: false,
        message: 'Hanya praktikan yang dapat mengajukan izin.',
      };
    }

    const errAlasan = validateAlasanIzin(alasan);
    if (errAlasan) {
      return { success: false, message: errAlasan };
    }

    const sesi = rawSesiList.find((s) => s.id === sesiId);
    if (!sesi) {
      return { success: false, message: 'Sesi praktikum tidak ditemukan.' };
    }

    if (sesi.status === 'DITUTUP') {
      return {
        success: false,
        message: 'Tidak dapat mengajukan izin pada sesi yang telah ditutup.',
      };
    }

    if (hasPraktikanPresensi(sesiId, currentUser.id)) {
      return {
        success: false,
        message: 'Anda sudah tercatat hadir pada sesi ini.',
      };
    }

    const izinId = `${sesiId}_${currentUser.id}`;
    if (izinList.some((i) => i.id === izinId)) {
      return {
        success: false,
        message: 'Anda sudah mengajukan izin untuk sesi ini.',
      };
    }

    try {
      const dataIzin = await serviceAjukanIzin(
        sesi,
        currentUser,
        alasan,
        hasilAI
      );
      return {
        success: true,
        message: 'Pengajuan izin berhasil dikirim.',
        data: dataIzin,
      };
    } catch (err) {
      return {
        success: false,
        message: getErrorMessage(err, 'Gagal mengajukan izin.'),
      };
    }
  };

  // FR-24: Putuskan Izin oleh Asisten
  const putuskanIzin = async (
    izinId: string,
    keputusan: 'diterima' | 'ditolak',
    catatan?: string
  ): Promise<ActionResult<Izin>> => {
    if (!currentUser || currentUser.peran !== 'asisten') {
      return {
        success: false,
        message: 'Hanya asisten yang dapat memutuskan pengajuan izin.',
      };
    }

    const targetIzin = izinList.find((i) => i.id === izinId);
    if (!targetIzin) {
      return { success: false, message: 'Data permohonan izin tidak ditemukan.' };
    }

    try {
      await servicePutuskanIzin(izinId, keputusan, currentUser.id, catatan);
      const updatedIzin: Izin = {
        ...targetIzin,
        status: keputusan,
        catatanAsisten: catatan,
        diputuskanOleh: currentUser.id,
        diputuskanPada: new Date(),
      };
      return {
        success: true,
        message: `Izin berhasil ${keputusan === 'diterima' ? 'disetujui' : 'ditolak'}.`,
        data: updatedIzin,
      };
    } catch (err) {
      return {
        success: false,
        message: getErrorMessage(err, 'Gagal memproses keputusan izin.'),
      };
    }
  };

  const getSesiById = (sesiId: string) => {
    return sesiList.find((s) => s.id === sesiId);
  };

  const getPresensiBySesi = (sesiId: string) => {
    return presensiMap[sesiId] ?? [];
  };

  const getPresensiByPraktikan = (praktikanId: string) => {
    return presensiList.filter((p) => p.praktikanId === praktikanId);
  };

  const hasPraktikanPresensi = (sesiId: string, praktikanId: string) => {
    const list = presensiMap[sesiId] ?? [];
    return list.some((p) => p.praktikanId === praktikanId);
  };

  const getIzinBySesi = (sesiId: string) => {
    return izinList.filter((i) => i.sesiId === sesiId);
  };

  const logout = async () => {
    await authLogout();
  };

  return (
    <PraktikumContext.Provider
      value={{
        currentUser,
        loading,
        error,
        retry,
        sesiList,
        presensiList,
        kelasList,
        izinList,
        praktikanList,
        logout,
        bukaSesi,
        tutupSesi,
        presensi,
        ajukanIzin,
        putuskanIzin,
        getSesiById,
        getPresensiBySesi,
        getPresensiByPraktikan,
        hasPraktikanPresensi,
        getIzinBySesi,
      }}
    >
      {children}
    </PraktikumContext.Provider>
  );
};

export function usePraktikum(): PraktikumContextType {
  const context = useContext(PraktikumContext);
  if (!context) {
    throw new Error('usePraktikum harus digunakan dalam PraktikumProvider.');
  }
  return context;
}
