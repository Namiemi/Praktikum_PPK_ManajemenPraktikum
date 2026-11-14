import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ErrorState } from '@/components/error-state';
import { AsistenAvatar } from '@/components/icons/asisten-avatar';
import {
  EmptyAttendanceIllustration,
  HeaderBotanicalBlob,
} from '@/components/icons/praktikum-theme-icons';
import {
  IzinKeputusanModal,
  IzinReviewCard,
} from '@/components/izin-review-card';
import { LoadingState } from '@/components/loading-state';
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
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.headerOrnament} pointerEvents="none">
        <HeaderBotanicalBlob width={160} height={115} />
      </View>

      <FlatList
        data={filteredIzin}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
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
              <Text style={styles.pageTitle}>Pengajuan Izin</Text>
              {menungguCount > 0 && (
                <View style={styles.pendingPill}>
                  <Text style={styles.pendingPillText}>
                    {menungguCount} Menunggu
                  </Text>
                </View>
              )}
            </View>

            {izinMilikAsisten.length > 0 && (
              <View style={styles.chipRow}>
                {FILTER_OPTIONS.map((chip) => {
                  const isActive = selectedFilter === chip.value;
                  return (
                    <Pressable
                      key={chip.value}
                      style={[
                        styles.chip,
                        isActive ? styles.chipActive : styles.chipInactive,
                      ]}
                      onPress={() => setSelectedFilter(chip.value)}
                      accessibilityRole="button"
                      accessibilityState={{ selected: isActive }}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          isActive
                            ? styles.chipTextActive
                            : styles.chipTextInactive,
                        ]}
                      >
                        {chip.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            )}
          </View>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDFBF7',
    position: 'relative',
  },
  headerOrnament: {
    position: 'absolute',
    top: 0,
    right: 0,
    zIndex: 0,
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
  pendingPill: {
    backgroundColor: '#E5EAD7',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
  },
  pendingPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2D3E2D',
    fontVariant: ['tabular-nums'],
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 14,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
  },
  chipActive: {
    backgroundColor: '#3E543E',
  },
  chipInactive: {
    backgroundColor: '#F5F2EB',
    borderWidth: 1,
    borderColor: '#D5E0D5',
  },
  chipText: {
    fontSize: 12,
    lineHeight: 16,
  },
  chipTextActive: {
    fontWeight: '600',
    color: '#FFFFFF',
  },
  chipTextInactive: {
    fontWeight: '500',
    color: '#3E543E',
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
});
