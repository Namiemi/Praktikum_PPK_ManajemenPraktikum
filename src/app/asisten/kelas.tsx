import React from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ConfirmModal } from '@/components/confirm-modal';
import { ErrorState } from '@/components/error-state';
import { AsistenAvatar } from '@/components/icons/asisten-avatar';
import {
  CardCornerLeafOrnament,
  EmptyScheduleIllustration,
  HeaderBotanicalBlob,
  PencilIcon,
  PlusIcon,
  TrashIcon,
  UsersIcon,
} from '@/components/icons/praktikum-theme-icons';
import { KelasFormModal, PesertaKelasModal } from '@/components/kelas-form';
import { LoadingState } from '@/components/loading-state';
import { useKelolaKelas } from '@/hooks/use-kelola-kelas';

/**
 * Halaman Kelola Kelas & Peserta Praktikum untuk Asisten (FR-21).
 */
export default function KelolaKelasScreen() {
  const {
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
  } = useKelolaKelas();

  if (loading) {
    return <LoadingState pesan="Memuat daftar kelas..." />;
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
        data={kelasList}
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
              <Text style={styles.pageTitle}>Kelola Kelas</Text>
              <Pressable
                style={({ pressed }) => [
                  styles.addButton,
                  pressed && styles.pressed,
                ]}
                onPress={handleOpenTambah}
                accessibilityRole="button"
                accessibilityLabel="Tambah Kelas"
              >
                <PlusIcon size={14} color="#FFFFFF" />
                <Text style={styles.addButtonText}>Kelas</Text>
              </Pressable>
            </View>

            {actionError && !formOpen && !pesertaKelas && !deletingKelas ? (
              <View style={styles.errorBanner}>
                <Text style={styles.errorBannerText}>{actionError}</Text>
              </View>
            ) : null}
          </View>
        }
        renderItem={({ item }) => {
          const jumlahPeserta = getJumlahPeserta(item.id);
          return (
            <View style={styles.card}>
              <View style={styles.cardHeaderRow}>
                <Text style={styles.cardTitle} numberOfLines={2}>
                  {item.mataKuliah} - Kelas {item.nama}
                </Text>
                <View style={styles.kelasCircle}>
                  <Text style={styles.kelasCircleText}>{item.nama}</Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <UsersIcon size={13} color="#5A6B5A" />
                <Text style={styles.subInfoText}>
                  {jumlahPeserta} Praktikan Terdaftar
                </Text>
              </View>

              <View style={styles.actionRow}>
                <Pressable
                  style={({ pressed }) => [
                    styles.actionPill,
                    styles.pesertaPill,
                    pressed && styles.pressed,
                  ]}
                  onPress={() => handleOpenPeserta(item)}
                  accessibilityRole="button"
                  accessibilityLabel={`Atur peserta kelas ${item.nama}`}
                >
                  <UsersIcon size={13} color="#2D3E2D" />
                  <Text style={styles.pesertaPillText}>Peserta</Text>
                </Pressable>

                <Pressable
                  style={({ pressed }) => [
                    styles.actionPill,
                    styles.editPill,
                    pressed && styles.pressed,
                  ]}
                  onPress={() => handleOpenUbah(item)}
                  accessibilityRole="button"
                  accessibilityLabel={`Ubah kelas ${item.nama}`}
                >
                  <PencilIcon size={13} color="#3E543E" />
                  <Text style={styles.editPillText}>Ubah</Text>
                </Pressable>

                <Pressable
                  style={({ pressed }) => [
                    styles.actionPill,
                    styles.deletePill,
                    pressed && styles.pressed,
                  ]}
                  onPress={() => handleRequestHapus(item)}
                  accessibilityRole="button"
                  accessibilityLabel={`Hapus kelas ${item.nama}`}
                >
                  <TrashIcon size={13} color="#9E3B2B" />
                  <Text style={styles.deletePillText}>Hapus</Text>
                </Pressable>
              </View>

              <View style={styles.cornerOrnament} pointerEvents="none">
                <CardCornerLeafOrnament width={72} height={72} />
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <EmptyScheduleIllustration width={205} height={186} />
            <Text style={styles.emptyTitle}>Belum Ada Kelas</Text>
          </View>
        }
      />

      <KelasFormModal
        visible={formOpen}
        editingKelas={editingKelas}
        submitting={submitting}
        errorMessage={actionError}
        onSubmit={handleSimpanKelas}
        onClose={handleCloseForm}
      />

      <PesertaKelasModal
        kelas={pesertaKelas}
        praktikanList={filteredPraktikan}
        searchQuery={searchQuery}
        onChangeSearch={setSearchQuery}
        togglingUid={togglingUid}
        errorMessage={actionError}
        onTogglePeserta={handleTogglePeserta}
        onClose={handleClosePeserta}
      />

      <ConfirmModal
        visible={deletingKelas !== null}
        title="Hapus Kelas?"
        message={
          deletingKelas
            ? `Hapus '${deletingKelas.mataKuliah} - Kelas ${deletingKelas.nama}'? Peserta terdaftar akan dilepas dari kelas ini.`
            : ''
        }
        confirmText="Ya, Hapus"
        cancelText="Batal"
        variant="danger"
        isDestructive
        onConfirm={handleConfirmHapus}
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
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E6E4DD',
    padding: 16,
    marginBottom: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },
  cardTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
    color: '#1C281C',
  },
  kelasCircle: {
    minWidth: 22,
    height: 22,
    paddingHorizontal: 6,
    borderRadius: 11,
    backgroundColor: '#344E38',
    alignItems: 'center',
    justifyContent: 'center',
  },
  kelasCircleText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 6,
  },
  subInfoText: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
    color: '#5A6B5A',
    fontVariant: ['tabular-nums'],
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    paddingRight: 44,
  },
  actionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 999,
  },
  pesertaPill: {
    backgroundColor: '#E5EAD7',
  },
  pesertaPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2D3E2D',
  },
  editPill: {
    backgroundColor: '#F5F2EB',
    borderWidth: 1,
    borderColor: '#D5E0D5',
  },
  editPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#3E543E',
  },
  deletePill: {
    backgroundColor: '#F4DFDA',
  },
  deletePillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9E3B2B',
  },
  pressed: {
    opacity: 0.82,
  },
  cornerOrnament: {
    position: 'absolute',
    right: 0,
    bottom: 0,
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
