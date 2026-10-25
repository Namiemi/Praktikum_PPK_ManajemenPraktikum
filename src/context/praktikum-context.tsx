import React, { createContext, useContext, useState } from 'react';

import { INITIAL_PRESENSI, INITIAL_SESI, INITIAL_USERS } from '@/data/dummy';
import {
  ActionResult,
  PraktikumContextType,
  Presensi,
  SesiPraktikum,
  User,
} from '@/types';
import { generateKodePresensi, getFormattedTime } from '@/utils';

const PraktikumContext = createContext<PraktikumContextType | undefined>(
  undefined
);

export const PraktikumProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users] = useState<User[]>(INITIAL_USERS);
  const [sesiList, setSesiList] = useState<SesiPraktikum[]>(INITIAL_SESI);
  const [presensiList, setPresensiList] =
    useState<Presensi[]>(INITIAL_PRESENSI);

  const login = (user: User) => {
    setCurrentUser(user);
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const bukaSesi = (sesiId: string): ActionResult<SesiPraktikum> => {
    const sesi = sesiList.find((s) => s.id === sesiId);
    if (!sesi) {
      return { success: false, message: 'Sesi tidak ditemukan.' };
    }

    if (sesi.status !== 'BELUM_DIBUKA') {
      return {
        success: false,
        message: 'Hanya sesi yang belum dibuka yang dapat dibuka.',
      };
    }

    const kodeBaru = generateKodePresensi();
    const jamBuka = getFormattedTime();

    const updatedSesi: SesiPraktikum = {
      ...sesi,
      status: 'DIBUKA',
      kodePresensi: kodeBaru,
      jamBuka,
    };

    setSesiList((prev) =>
      prev.map((item) => (item.id === sesiId ? updatedSesi : item))
    );

    return {
      success: true,
      message: `Sesi berhasil dibuka dengan kode ${kodeBaru}`,
      data: updatedSesi,
    };
  };

  const tutupSesi = (sesiId: string): ActionResult<SesiPraktikum> => {
    const sesi = sesiList.find((s) => s.id === sesiId);
    if (!sesi) {
      return { success: false, message: 'Sesi tidak ditemukan.' };
    }

    if (sesi.status !== 'DIBUKA') {
      return {
        success: false,
        message: 'Hanya sesi yang dibuka yang dapat ditutup.',
      };
    }

    const jamTutup = getFormattedTime();

    const updatedSesi: SesiPraktikum = {
      ...sesi,
      status: 'DITUTUP',
      jamTutup,
    };

    setSesiList((prev) =>
      prev.map((item) => (item.id === sesiId ? updatedSesi : item))
    );

    return {
      success: true,
      message: 'Sesi praktikum berhasil ditutup.',
      data: updatedSesi,
    };
  };

  // FR-12: Logika Anti Presensi Ganda
  const presensi = (
    sesiId: string,
    kodeInput: string
  ): ActionResult<Presensi> => {
    if (!currentUser || currentUser.peran !== 'praktikan') {
      return {
        success: false,
        message: 'Hanya praktikan yang dapat melakukan presensi.',
      };
    }

    const sesi = sesiList.find((s) => s.id === sesiId);
    if (!sesi) {
      return { success: false, message: 'Sesi praktikum tidak ditemukan.' };
    }

    // 1. Validasi sesi dibuka
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

    // 2. Validasi kode presensi
    const inputClean = kodeInput ? kodeInput.trim() : '';
    if (!inputClean || inputClean !== sesi.kodePresensi) {
      return {
        success: false,
        message: 'Kode presensi salah atau tidak sesuai.',
      };
    }

    // 3. Validasi anti presensi ganda
    const sudahPresensi = presensiList.some(
      (p) => p.sesiId === sesiId && p.praktikanId === currentUser.id
    );
    if (sudahPresensi) {
      return {
        success: false,
        message: 'Anda sudah melakukan presensi pada sesi ini.',
      };
    }

    // 4. Catat presensi
    const waktuPresensi = getFormattedTime();
    const newPresensi: Presensi = {
      id: `pres-${Date.now()}`,
      sesiId,
      praktikanId: currentUser.id,
      praktikanNama: currentUser.nama,
      praktikanNim: currentUser.nim,
      waktuPresensi,
    };

    setPresensiList((prev) => [...prev, newPresensi]);

    return {
      success: true,
      message: `Presensi berhasil dicatat pukul ${waktuPresensi}`,
      data: newPresensi,
    };
  };

  const getSesiById = (sesiId: string) => {
    return sesiList.find((s) => s.id === sesiId);
  };

  const getPresensiBySesi = (sesiId: string) => {
    return presensiList.filter((p) => p.sesiId === sesiId);
  };

  const getPresensiByPraktikan = (praktikanId: string) => {
    return presensiList.filter((p) => p.praktikanId === praktikanId);
  };

  const hasPraktikanPresensi = (sesiId: string, praktikanId: string) => {
    return presensiList.some(
      (p) => p.sesiId === sesiId && p.praktikanId === praktikanId
    );
  };

  return (
    <PraktikumContext.Provider
      value={{
        currentUser,
        users,
        sesiList,
        presensiList,
        login,
        logout,
        bukaSesi,
        tutupSesi,
        presensi,
        getSesiById,
        getPresensiBySesi,
        getPresensiByPraktikan,
        hasPraktikanPresensi,
      }}>
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
