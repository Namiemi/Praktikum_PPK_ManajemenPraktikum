import { useState } from 'react';

import { usePraktikum } from '@/context/praktikum-context';
import { Izin, StatusIzin } from '@/types';

export type FilterStatusIzin = 'SEMUA' | StatusIzin;

export interface IzinDecisionTarget {
  izin: Izin;
  keputusan: 'diterima' | 'ditolak';
}

function compareIzinOrder(a: Izin, b: Izin): number {
  const rank = (s: StatusIzin) => (s === 'menunggu' ? 0 : 1);
  const diff = rank(a.status) - rank(b.status);
  if (diff !== 0) return diff;
  const timeA = a.diajukanPada ? a.diajukanPada.getTime() : 0;
  const timeB = b.diajukanPada ? b.diajukanPada.getTime() : 0;
  return timeB - timeA;
}

/**
 * Custom hook SoC untuk pengelolaan daftar dan verifikasi izin asisten (FR-24).
 */
export function useKelolaIzin() {
  const { currentUser, izinList, loading, error, retry, putuskanIzin } =
    usePraktikum();

  const [selectedFilter, setSelectedFilter] =
    useState<FilterStatusIzin>('SEMUA');
  const [decisionTarget, setDecisionTarget] =
    useState<IzinDecisionTarget | null>(null);
  const [catatanAsisten, setCatatanAsisten] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // ponytail: derived state langsung dari context tanpa sinkronisasi useEffect
  const izinMilikAsisten = izinList
    .filter((item) => item.asistenId === currentUser?.id)
    .sort(compareIzinOrder);

  const filteredIzin =
    selectedFilter === 'SEMUA'
      ? izinMilikAsisten
      : izinMilikAsisten.filter((item) => item.status === selectedFilter);

  const menungguCount = izinMilikAsisten.filter(
    (item) => item.status === 'menunggu'
  ).length;

  const handleOpenKeputusan = (
    izin: Izin,
    keputusan: 'diterima' | 'ditolak'
  ) => {
    setActionError(null);
    setCatatanAsisten('');
    setDecisionTarget({ izin, keputusan });
  };

  const handleCloseKeputusan = () => {
    if (submitting) return;
    setDecisionTarget(null);
    setCatatanAsisten('');
    setActionError(null);
  };

  const handleConfirmKeputusan = async () => {
    if (!decisionTarget) return;
    setSubmitting(true);
    setActionError(null);

    const catatan = catatanAsisten.trim() || undefined;
    const result = await putuskanIzin(
      decisionTarget.izin.id,
      decisionTarget.keputusan,
      catatan
    );

    setSubmitting(false);
    if (!result.success) {
      setActionError(result.message);
      return;
    }

    setDecisionTarget(null);
    setCatatanAsisten('');
  };

  return {
    currentUser,
    loading,
    error,
    retry,
    selectedFilter,
    setSelectedFilter,
    izinMilikAsisten,
    filteredIzin,
    menungguCount,
    decisionTarget,
    catatanAsisten,
    setCatatanAsisten,
    submitting,
    actionError,
    handleOpenKeputusan,
    handleCloseKeputusan,
    handleConfirmKeputusan,
  };
}
