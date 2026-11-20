import { router } from 'expo-router';
import React from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { AsistenSesiCard } from '@/components/asisten-sesi-card';
import {
  BotanicalPageHeader,
  BotanicalScreenShell,
} from '@/components/botanical-header';
import { ConfirmModal } from '@/components/confirm-modal';
import { ErrorState } from '@/components/error-state';
import {
  EmptyScheduleIllustration,
  PlusIcon,
} from '@/components/icons/praktikum-theme-icons';
import { LoadingState } from '@/components/loading-state';
import { SesiFormModal } from '@/components/sesi-form';
import { Botanical } from '@/constants/theme';
import { FilterStatus, useKelolaSesi } from '@/hooks/use-kelola-sesi';

const FILTER_OPTIONS: { value: FilterStatus; label: string }[] = [
  { value: 'SEMUA', label: 'Semua' },
  { value: 'DIBUKA', label: 'Dibuka' },
  { value: 'BELUM_DIBUKA', label: 'Belum Dibuka' },
  { value: 'DITUTUP', label: 'Ditutup' },
];

export default function JadwalAsistenScreen() {
  const {
    currentUser,
    kelasList,
    loading,
    error,
    retry,
    selectedFilter,
    setSelectedFilter,
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
  } = useKelolaSesi();

  if (loading) {
    return <LoadingState pesan="Memuat jadwal praktikum..." />;
  }

  if (error) {
    return <ErrorState pesan={error} onRetry={retry} />;
  }

  return (
    <BotanicalScreenShell>
      <FlatList
        data={filteredSesi}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <BotanicalPageHeader
            userId={currentUser?.id}
            userName={currentUser?.nama}
            peran="asisten"
            title="Jadwal Praktikum"
            rightSlot={
              <Pressable
                style={({ pressed }) => [
                  styles.addButton,
                  pressed && styles.pressed,
                ]}
                onPress={handleOpenTambah}
                accessibilityRole="button"
                accessibilityLabel="Tambah Sesi"
              >
                <PlusIcon size={14} color="#FFFFFF" />
                <Text style={styles.addButtonText}>Sesi</Text>
              </Pressable>
            }
            errorBanner={
              actionError && !formOpen && !deletingSesi ? actionError : null
            }
            filterOptions={
              sesiMilikAsisten.length > 0 ? FILTER_OPTIONS : undefined
            }
            selectedFilter={selectedFilter}
            onSelectFilter={setSelectedFilter}
          />
        }
        renderItem={({ item }) => (
          <View style={styles.cardWrapper}>
            <AsistenSesiCard
              sesi={item}
              onPress={() => router.push(`/sesi/${item.id}`)}
              onEdit={() => handleOpenUbah(item)}
              onDelete={() => handleRequestHapus(item)}
            />
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <EmptyScheduleIllustration width={205} height={186} />
            <Text style={styles.emptyTitle}>Belum Ada Jadwal Sesi</Text>
            <Text style={styles.emptyDescription}>
              {sesiMilikAsisten.length === 0
                ? 'Anda tidak memiliki jadwal\npraktikum yang aktif saat ini.'
                : 'Tidak ada sesi praktikum dengan\nstatus filter yang dipilih.'}
            </Text>
          </View>
        }
      />

      <SesiFormModal
        visible={formOpen}
        editingSesi={editingSesi}
        kelasList={kelasList}
        submitting={submitting}
        errorMessage={actionError}
        onSubmit={handleSimpanSesi}
        onClose={handleCloseForm}
      />

      <ConfirmModal
        visible={deletingSesi !== null}
        title="Hapus Sesi Praktikum?"
        message={
          deletingSesi
            ? `Hapus '${deletingSesi.mataKuliah} - Kelas ${deletingSesi.kelas}' (Pertemuan ${deletingSesi.pertemuan})? Seluruh data presensi sesi ini akan ikut terhapus.`
            : ''
        }
        confirmText="Ya, Hapus"
        cancelText="Batal"
        variant="danger"
        isDestructive
        onConfirm={() => handleConfirmHapus()}
        onCancel={handleCancelHapus}
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
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Botanical.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  addButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  pressed: {
    opacity: 0.82,
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
  emptyDescription: {
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 19,
    color: Botanical.textMuted,
    textAlign: 'center',
    paddingHorizontal: 16,
    marginTop: 6,
  },
});
