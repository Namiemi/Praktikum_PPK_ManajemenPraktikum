import { useState } from 'react';

import { StatusIzinPerangkat } from '@/components/device-permission-banner';
import { usePraktikum } from '@/context/praktikum-context';
import {
  ambilPosisiSaatIni,
  cekLayananLokasiAktif,
  hapusLaboratorium,
  requestIzinLokasi,
  tambahLaboratorium,
  ubahLaboratorium,
} from '@/services';
import { Laboratorium, LaboratoriumInput } from '@/types';
import { getErrorMessage } from '@/utils/errors';

export interface KoordinatTitik {
  latitude: number;
  longitude: number;
}

/**
 * Custom hook SoC untuk pengelolaan CRUD lokasi laboratorium asisten (FR-35).
 */
export function useKelolaLab() {
  const { currentUser, laboratoriumList, loading, error, retry } =
    usePraktikum();

  const [formOpen, setFormOpen] = useState(false);
  const [editingLab, setEditingLab] = useState<Laboratorium | null>(null);
  const [deletingLab, setDeletingLab] = useState<Laboratorium | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [locationStatus, setLocationStatus] =
    useState<StatusIzinPerangkat | null>(null);
  const [locationMessage, setLocationMessage] = useState<string | null>(null);

  const handleOpenTambah = () => {
    setActionError(null);
    setLocationStatus(null);
    setLocationMessage(null);
    setEditingLab(null);
    setFormOpen(true);
  };

  const handleOpenUbah = (lab: Laboratorium) => {
    setActionError(null);
    setLocationStatus(null);
    setLocationMessage(null);
    setEditingLab(lab);
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setEditingLab(null);
    setActionError(null);
    setLocationStatus(null);
    setLocationMessage(null);
  };

  const handleClearLocationStatus = () => {
    setLocationStatus(null);
    setLocationMessage(null);
  };

  const handleAmbilLokasiSaatIni = async (): Promise<KoordinatTitik | null> => {
    setLocationMessage(null);
    const izin = await requestIzinLokasi();
    if (!izin.granted) {
      setLocationStatus('izin_lokasi_ditolak');
      return null;
    }

    const gpsAktif = await cekLayananLokasiAktif();
    if (!gpsAktif) {
      setLocationStatus('gps_mati');
      return null;
    }

    setLocationStatus('lokasi_memuat');
    const posisi = await ambilPosisiSaatIni();
    if (!posisi) {
      setLocationStatus(null);
      setLocationMessage(
        'Lokasi perangkat belum tersedia. Pastikan GPS aktif atau pilih titik langsung pada peta.'
      );
      return null;
    }

    setLocationStatus(null);
    setLocationMessage(null);
    return {
      latitude: posisi.coords.latitude,
      longitude: posisi.coords.longitude,
    };
  };

  const handleSimpanLab = async (input: LaboratoriumInput): Promise<boolean> => {
    if (!currentUser) return false;
    setSubmitting(true);
    setActionError(null);
    try {
      if (editingLab) {
        await ubahLaboratorium(editingLab.id, input);
      } else {
        await tambahLaboratorium(input, currentUser);
      }
      setFormOpen(false);
      setEditingLab(null);
      return true;
    } catch (err) {
      setActionError(
        getErrorMessage(err, 'Gagal menyimpan data laboratorium.')
      );
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const handleRequestHapus = (lab: Laboratorium) => {
    setActionError(null);
    setDeletingLab(lab);
  };

  const handleCancelHapus = () => {
    setDeletingLab(null);
  };

  const handleConfirmHapus = async () => {
    if (!deletingLab) return;
    setSubmitting(true);
    setActionError(null);
    try {
      await hapusLaboratorium(deletingLab.id);
      setDeletingLab(null);
    } catch (err) {
      setActionError(getErrorMessage(err, 'Gagal menghapus laboratorium.'));
    } finally {
      setSubmitting(false);
    }
  };

  return {
    currentUser,
    laboratoriumList,
    loading,
    error,
    retry,
    formOpen,
    editingLab,
    deletingLab,
    submitting,
    actionError,
    locationStatus,
    locationMessage,
    handleOpenTambah,
    handleOpenUbah,
    handleCloseForm,
    handleClearLocationStatus,
    handleAmbilLokasiSaatIni,
    handleSimpanLab,
    handleRequestHapus,
    handleCancelHapus,
    handleConfirmHapus,
  };
}
