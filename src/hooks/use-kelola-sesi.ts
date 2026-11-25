import { useState } from 'react';

import { usePraktikum } from '@/context/praktikum-context';
import { hapusSesi, tambahSesi, ubahSesi } from '@/services';
import { SesiInput, SesiPraktikum } from '@/types';
import { bandingkanSesiJadwal } from '@/utils';
import { getErrorMessage } from '@/utils/errors';
import {
  extractJadwalFilterOptions,
  filterJadwalSesi,
  hasActiveJadwalFilter,
  INITIAL_JADWAL_FILTER,
  JadwalFilterState,
} from '@/utils/jadwal-filter';
import { kirimNotifJadwalDiubah } from '@/utils/notifikasi-asisten';

/**
 * Custom hook untuk logika CRUD dan filter jadwal sesi asisten (FR-21, FR-35, FR-36, FR-40).
 */
export function useKelolaSesi() {
  const {
    currentUser,
    sesiList,
    kelasList,
    laboratoriumList,
    praktikanList,
    loading,
    error,
    retry,
  } = usePraktikum();

  const [filterState, setFilterState] = useState<JadwalFilterState>(
    INITIAL_JADWAL_FILTER
  );
  const [formOpen, setFormOpen] = useState(false);
  const [editingSesi, setEditingSesi] = useState<SesiPraktikum | null>(null);
  const [deletingSesi, setDeletingSesi] = useState<SesiPraktikum | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // ponytail: derived state langsung tanpa sinkronisasi useEffect
  const sesiMilikAsisten = sesiList
    .filter((s) => s.asistenId === currentUser?.id)
    .sort(bandingkanSesiJadwal);

  const filterOptions = extractJadwalFilterOptions(sesiMilikAsisten);
  const hasActiveFilter = hasActiveJadwalFilter(filterState);
  const filteredSesi = filterJadwalSesi(sesiMilikAsisten, filterState);

  const handleChangeFilter = <K extends keyof JadwalFilterState>(
    key: K,
    value: JadwalFilterState[K]
  ) => {
    setFilterState((prev) => ({ ...prev, [key]: value }));
  };

  const handleApplyFilter = (nextFilter: JadwalFilterState) => {
    setFilterState(nextFilter);
  };

  const handleResetFilter = () => {
    setFilterState(INITIAL_JADWAL_FILTER);
  };

  const handleOpenTambah = () => {
    setActionError(null);
    setEditingSesi(null);
    setFormOpen(true);
  };

  const handleOpenUbah = (sesi: SesiPraktikum) => {
    setActionError(null);
    setEditingSesi(sesi);
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setEditingSesi(null);
    setActionError(null);
  };

  const handleSimpanSesi = async (input: SesiInput): Promise<boolean> => {
    if (!currentUser) return false;
    setSubmitting(true);
    setActionError(null);
    try {
      if (editingSesi) {
        await ubahSesi(editingSesi.id, input);
        void kirimNotifJadwalDiubah(editingSesi, input, praktikanList);
      } else {
        await tambahSesi(input, currentUser);
      }
      setFormOpen(false);
      setEditingSesi(null);
      return true;
    } catch (err) {
      setActionError(getErrorMessage(err, 'Gagal menyimpan sesi praktikum.'));
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const handleRequestHapus = (sesi: SesiPraktikum) => {
    setActionError(null);
    setDeletingSesi(sesi);
  };

  const handleCancelHapus = () => {
    setDeletingSesi(null);
  };

  const handleConfirmHapus = async (onSuccess?: () => void) => {
    if (!deletingSesi) return;
    setSubmitting(true);
    setActionError(null);
    try {
      await hapusSesi(deletingSesi.id);
      setDeletingSesi(null);
      onSuccess?.();
    } catch (err) {
      setActionError(getErrorMessage(err, 'Gagal menghapus sesi praktikum.'));
    } finally {
      setSubmitting(false);
    }
  };

  return {
    currentUser,
    kelasList,
    laboratoriumList,
    loading,
    error,
    retry,
    filterState,
    filterOptions,
    hasActiveFilter,
    handleChangeFilter,
    handleApplyFilter,
    handleResetFilter,
    sesiMilikAsisten,
    filteredSesi,
    formOpen,
    editingSesi,
    deletingSesi,
    submitting,
    actionError,
    handleOpenTambah,
    handleOpenUbah,
    handleCloseForm,
    handleSimpanSesi,
    handleRequestHapus,
    handleCancelHapus,
    handleConfirmHapus,
  };
}
