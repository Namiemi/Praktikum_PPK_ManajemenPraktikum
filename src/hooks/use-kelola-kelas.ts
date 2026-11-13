import { useState } from 'react';

import { usePraktikum } from '@/context/praktikum-context';
import {
  hapusKelas,
  setKelasPraktikan,
  tambahKelas,
  ubahKelas,
} from '@/services';
import { Kelas, KelasInput, User } from '@/types';
import { getErrorMessage } from '@/utils/errors';

/**
 * Custom hook untuk logika CRUD kelas dan pengaturan peserta kelas (FR-21).
 */
export function useKelolaKelas() {
  const { currentUser, kelasList, praktikanList, loading, error, retry } =
    usePraktikum();

  const [formOpen, setFormOpen] = useState(false);
  const [editingKelas, setEditingKelas] = useState<Kelas | null>(null);
  const [pesertaKelasId, setPesertaKelasId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [togglingUid, setTogglingUid] = useState<string | null>(null);
  const [deletingKelas, setDeletingKelas] = useState<Kelas | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // ponytail: derived state langsung dari context tanpa sinkronisasi useEffect
  const pesertaKelas = kelasList.find((k) => k.id === pesertaKelasId) ?? null;

  const queryNormalized = searchQuery.trim().toLowerCase();
  const filteredPraktikan = queryNormalized
    ? praktikanList.filter(
        (p) =>
          p.nama.toLowerCase().includes(queryNormalized) ||
          p.nim.toLowerCase().includes(queryNormalized)
      )
    : praktikanList;

  const getJumlahPeserta = (kelasId: string) =>
    praktikanList.filter((p) => p.kelasId === kelasId).length;

  const handleOpenTambah = () => {
    setActionError(null);
    setEditingKelas(null);
    setFormOpen(true);
  };

  const handleOpenUbah = (kelas: Kelas) => {
    setActionError(null);
    setEditingKelas(kelas);
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setEditingKelas(null);
    setActionError(null);
  };

  const handleSimpanKelas = async (input: KelasInput): Promise<boolean> => {
    if (!currentUser) return false;
    setSubmitting(true);
    setActionError(null);
    try {
      if (editingKelas) {
        await ubahKelas(editingKelas.id, input);
      } else {
        await tambahKelas(input, currentUser);
      }
      setFormOpen(false);
      setEditingKelas(null);
      return true;
    } catch (err) {
      setActionError(getErrorMessage(err, 'Gagal menyimpan data kelas.'));
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const handleRequestHapus = (kelas: Kelas) => {
    setActionError(null);
    setDeletingKelas(kelas);
  };

  const handleCancelHapus = () => {
    setDeletingKelas(null);
  };

  const handleConfirmHapus = async () => {
    if (!deletingKelas) return;
    setSubmitting(true);
    setActionError(null);
    try {
      await hapusKelas(deletingKelas.id);
      setDeletingKelas(null);
    } catch (err) {
      setActionError(getErrorMessage(err, 'Gagal menghapus kelas.'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenPeserta = (kelas: Kelas) => {
    setActionError(null);
    setSearchQuery('');
    setPesertaKelasId(kelas.id);
  };

  const handleClosePeserta = () => {
    setPesertaKelasId(null);
    setSearchQuery('');
    setActionError(null);
  };

  const handleTogglePeserta = async (praktikan: User) => {
    if (!pesertaKelas) return;
    setTogglingUid(praktikan.id);
    setActionError(null);
    const nextKelasId =
      praktikan.kelasId === pesertaKelas.id ? null : pesertaKelas.id;
    try {
      await setKelasPraktikan(praktikan.id, nextKelasId);
    } catch (err) {
      setActionError(getErrorMessage(err, 'Gagal memperbarui peserta kelas.'));
    } finally {
      setTogglingUid(null);
    }
  };

  return {
    currentUser,
    kelasList,
    loading,
    error,
    retry,
    formOpen,
    editingKelas,
    pesertaKelas,
    searchQuery,
    setSearchQuery,
    filteredPraktikan,
    togglingUid,
    deletingKelas,
    submitting,
    actionError,
    getJumlahPeserta,
    handleOpenTambah,
    handleOpenUbah,
    handleCloseForm,
    handleSimpanKelas,
    handleRequestHapus,
    handleCancelHapus,
    handleConfirmHapus,
    handleOpenPeserta,
    handleClosePeserta,
    handleTogglePeserta,
  };
}
