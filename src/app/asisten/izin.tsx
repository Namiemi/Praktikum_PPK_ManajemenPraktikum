import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

import {
  BotanicalPageHeader,
  BotanicalScreenShell,
} from '@/components/botanical-header';
import { ErrorState } from '@/components/error-state';
import { EmptyAttendanceIllustration } from '@/components/icons/praktikum-theme-icons';
import {
  IzinKeputusanModal,
  IzinReviewCard,
} from '@/components/izin-review-card';
import { LoadingState } from '@/components/loading-state';
import { Botanical } from '@/constants/theme';
import { FilterStatusIzin, useKelolaIzin } from '@/hooks/use-kelola-izin';

const FILTER_OPTIONS: { value: FilterStatusIzin; label: string }[] = [
  { value: 'SEMUA', label: 'Semua' },
  { value: 'menunggu', label: 'Menunggu' },
  { value: 'diterima', label: 'Diterima' },
  { value: 'ditolak', label: 'Ditolak' },
];

export default function AsistenIzinScreen() {
  const {
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
  } = useKelolaIzin();

  if (loading) {
    return <LoadingState pesan="Memuat pengajuan izin..." />;
  }

  if (error) {
    return <ErrorState pesan={error} onRetry={retry} />;
  }

  return (
    <BotanicalScreenShell>
      <FlatList
        data={filteredIzin}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <BotanicalPageHeader
            userId={currentUser?.id}
            userName={currentUser?.nama}
            peran="asisten"
            title="Pengajuan Izin"
            rightSlot={
              menungguCount > 0 ? (
                <View style={styles.pendingPill}>
                  <Text style={styles.pendingPillText}>
                    {menungguCount} Menunggu
                  </Text>
                </View>
              ) : null
            }
            filterOptions={
              izinMilikAsisten.length > 0 ? FILTER_OPTIONS : undefined
            }
            selectedFilter={selectedFilter}
            onSelectFilter={setSelectedFilter}
          />
        }
        renderItem={({ item }) => (
          <View style={styles.cardWrapper}>
            <IzinReviewCard
              izin={item}
              onTerima={() => handleOpenKeputusan(item, 'diterima')}
              onTolak={() => handleOpenKeputusan(item, 'ditolak')}
            />
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <EmptyAttendanceIllustration width={150} height={150} />
            <Text style={styles.emptyTitle}>Belum Ada Pengajuan Izin</Text>
          </View>
        }
      />

      <IzinKeputusanModal
        target={decisionTarget}
        catatan={catatanAsisten}
        onChangeCatatan={setCatatanAsisten}
        submitting={submitting}
        errorMessage={actionError}
        onConfirm={handleConfirmKeputusan}
        onClose={handleCloseKeputusan}
      />
    </BotanicalScreenShell>
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 32,
    flexGrow: 1,
  },
  pendingPill: {
    backgroundColor: Botanical.sagePill,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
  },
  pendingPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: Botanical.primaryDark,
    fontVariant: ['tabular-nums'],
  },
  cardWrapper: {
    marginBottom: 12,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 36,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
    color: Botanical.textPrimary,
    textAlign: 'center',
    marginTop: 12,
  },
});
