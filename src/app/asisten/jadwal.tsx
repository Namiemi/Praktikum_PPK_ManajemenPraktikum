import { router } from 'expo-router';
import React from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AsistenSesiCard } from '@/components/asisten-sesi-card';
import { ConfirmModal } from '@/components/confirm-modal';
import { ErrorState } from '@/components/error-state';
import { AsistenAvatar } from '@/components/icons/asisten-avatar';
import {
  EmptyScheduleIllustration,
  PilihPeranWaveTop,
  PlusIcon,
} from '@/components/icons/praktikum-theme-icons';
import { LoadingState } from '@/components/loading-state';
import { JadwalFilterBar } from '@/components/jadwal-filter-bar';
import { SesiFormModal } from '@/components/sesi-form';
import { useKelolaSesi } from '@/hooks/use-kelola-sesi';

export default function JadwalAsistenScreen() {
  const {
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
  } = useKelolaSesi();

  if (loading) {
    return <LoadingState pesan="Memuat jadwal praktikum..." />;
  }

  if (error) {
    return <ErrorState pesan={error} onRetry={retry} />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.waveTopWrapper} pointerEvents="none">
        <PilihPeranWaveTop width="100%" height={175} />
      </View>

      <FlatList
        data={filteredSesi}
        style={styles.list}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        ListHeaderComponent={
          <View style={styles.headerSection}>
            <View style={styles.profileRow}>
              <AsistenAvatar
                userId={currentUser?.id}
                nama={currentUser?.nama}
                size={38}
              />
              <Text style={styles.profileName}>
                {currentUser?.nama ?? 'Asisten Praktikum'}
              </Text>
            </View>

            <View style={styles.titleRow}>
              <Text style={styles.pageTitle}>Jadwal Praktikum</Text>
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
            </View>

            {sesiMilikAsisten.length > 0 && (
              <JadwalFilterBar
                filter={filterState}
                options={filterOptions}
                onChangeFilter={handleChangeFilter}
                onApplyFilter={handleApplyFilter}
                onReset={handleResetFilter}
              />
            )}

            {actionError && !formOpen && !deletingSesi ? (
              <View style={styles.errorBanner}>
                <Text style={styles.errorBannerText}>{actionError}</Text>
              </View>
            ) : null}
          </View>
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
            <Text style={styles.emptyTitle}>
              {hasActiveFilter
                ? 'Jadwal Tidak Ditemukan'
                : 'Belum Ada Jadwal Sesi'}
            </Text>
            <Text style={styles.emptyDescription}>
              {sesiMilikAsisten.length === 0
                ? 'Anda tidak memiliki jadwal\npraktikum yang aktif saat ini.'
                : 'Tidak ada sesi praktikum yang cocok\ndengan pencarian atau filter Anda.'}
            </Text>
            {hasActiveFilter ? (
              <Pressable
                style={({ pressed }) => [
                  styles.resetEmptyButton,
                  pressed && styles.pressed,
                ]}
                onPress={handleResetFilter}
                accessibilityRole="button"
                accessibilityLabel="Reset Filter"
              >
                <Text style={styles.resetEmptyText}>Reset Filter</Text>
              </Pressable>
            ) : null}
          </View>
        }
      />

      <SesiFormModal
        visible={formOpen}
        editingSesi={editingSesi}
        kelasList={kelasList}
        laboratoriumList={laboratoriumList}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDFBF7',
    position: 'relative',
  },
  waveTopWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 0,
  },
  list: {
    flex: 1,
    zIndex: 1,
  },
  listContent: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 32,
    flexGrow: 1,
  },
  headerSection: {
    marginBottom: 16,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  profileName: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
    color: '#2E3E2E',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 28,
    color: '#1C281C',
    letterSpacing: -0.5,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#344E38',
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
  errorBanner: {
    backgroundColor: '#F4DFDA',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 12,
  },
  errorBannerText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9E3B2B',
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
    color: '#1C281C',
    textAlign: 'center',
    marginTop: 12,
  },
  emptyDescription: {
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 19,
    color: '#5A6B5A',
    textAlign: 'center',
    paddingHorizontal: 16,
    marginTop: 6,
  },
  resetEmptyButton: {
    marginTop: 14,
    backgroundColor: '#F5F2EB',
    borderWidth: 1,
    borderColor: '#D5E0D5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
  },
  resetEmptyText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3E543E',
  },
});
