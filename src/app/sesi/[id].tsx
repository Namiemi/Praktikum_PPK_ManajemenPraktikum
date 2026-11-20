import { useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AsistenPanel } from '@/components/asisten-panel';
import { BottomSheet } from '@/components/bottom-sheet';
import { EmptyState } from '@/components/empty-state';
import { ErrorState } from '@/components/error-state';
import { LoadingState } from '@/components/loading-state';
import { PraktikanPanel } from '@/components/praktikan-panel';
import { StatusBadge, StatusBadgeProps } from '@/components/status-badge';
import { usePraktikum } from '@/context/praktikum-context';
import { StatusSesi } from '@/types';
import { formatDateIndo } from '@/utils';

const BADGE_STATUS: Record<StatusSesi, StatusBadgeProps['status']> = {
  BELUM_DIBUKA: 'belum_dibuka',
  DIBUKA: 'dibuka',
  DITUTUP: 'ditutup',
};

export default function DetailSesiScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getSesiById, currentUser, loading, error, retry } = usePraktikum();

  const [modalCatatanOpen, setModalCatatanOpen] = useState(false);
  const insets = useSafeAreaInsets();

  const sesi = getSesiById(id);

  if (loading) {
    return <LoadingState pesan="Memuat detail sesi..." />;
  }

  if (error) {
    return <ErrorState pesan={error} onRetry={retry} />;
  }

  if (!sesi) {
    return (
      <EmptyState
        judul="Sesi Tidak Ditemukan"
        deskripsi="Sesi ini sudah dihapus atau bukan bagian dari kelas Anda."
      />
    );
  }

  const isAsisten = currentUser?.peran === 'asisten';

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: styles.content.padding + insets.bottom },
      ]}
    >
      {/* Header Detail Sesi (FR-06) */}
      <View style={styles.headerCard}>
        <View style={styles.headerTop}>
          <Text style={styles.mataKuliah} numberOfLines={2}>
            {sesi.mataKuliah}
          </Text>
          <StatusBadge status={BADGE_STATUS[sesi.status]} />
        </View>

        <Text style={styles.topikTitle}>
          Pertemuan {sesi.pertemuan}: {sesi.topik}
        </Text>

        <View style={styles.divider} />

        <View style={styles.infoList}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Kelas</Text>
            <Text style={styles.infoValue}>Kelas {sesi.kelas}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Tanggal</Text>
            <Text style={styles.infoValue}>{formatDateIndo(sesi.tanggal)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Waktu</Text>
            <Text style={styles.infoValue}>
              {sesi.jamMulai} - {sesi.jamSelesai} WIB
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Ruang</Text>
            <Text style={styles.infoValue}>{sesi.ruang}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Asisten</Text>
            <Text style={styles.infoValue}>{sesi.asistenNama}</Text>
          </View>

          {sesi.jamBuka && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Jam Buka</Text>
              <Text style={styles.infoValue}>{sesi.jamBuka} WIB</Text>
            </View>
          )}

          {sesi.jamTutup && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Jam Tutup</Text>
              <Text style={styles.infoValue}>{sesi.jamTutup} WIB</Text>
            </View>
          )}

          {isAsisten && sesi.status === 'DIBUKA' && sesi.kodePresensi && (
            <View style={styles.kodeContainer}>
              <Text style={styles.kodeTitle}>Kode Presensi Aktif</Text>
              <Text style={styles.kodeNumber}>{sesi.kodePresensi}</Text>
            </View>
          )}
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.infoButton,
            pressed && styles.buttonPressed,
          ]}
          onPress={() => setModalCatatanOpen(true)}
          accessibilityRole="button"
          accessibilityLabel="Lihat Catatan Sesi"
        >
          <Text style={styles.infoButtonText}>Lihat Catatan Sesi</Text>
        </Pressable>
      </View>

      {/* Panel Bawah Sesuai Peran Aktif */}
      <View style={styles.panelContainer}>
        {isAsisten ? <AsistenPanel sesi={sesi} /> : <PraktikanPanel sesi={sesi} />}
      </View>

      {/* Bottom Sheet Info Catatan Sesi */}
      <BottomSheet
        visible={modalCatatanOpen}
        title="Catatan Sesi Praktikum"
        closeText="Tutup"
        onClose={() => setModalCatatanOpen(false)}
      >
        <Text style={styles.modalBody}>
          {sesi.catatan || 'Tidak ada catatan tambahan untuk sesi ini.'}
        </Text>
      </BottomSheet>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDFBF7',
  },
  content: {
    padding: 18,
  },
  headerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E6E4DD',
    marginBottom: 16,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 10,
  },
  mataKuliah: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    color: '#4A5D4A',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  topikTitle: {
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 24,
    color: '#1C281C',
    marginTop: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#F0EFE9',
    marginVertical: 14,
  },
  infoList: {
    gap: 10,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  infoLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#5A6B5A',
  },
  infoValue: {
    flex: 1,
    textAlign: 'right',
    fontSize: 13,
    fontWeight: '600',
    color: '#1C281C',
    fontVariant: ['tabular-nums'],
  },
  kodeContainer: {
    backgroundColor: '#F4F1EA',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E6E4DD',
    alignItems: 'center',
    marginVertical: 4,
  },
  kodeTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4A5D4A',
  },
  kodeNumber: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1C281C',
    letterSpacing: 2,
    fontVariant: ['tabular-nums'],
    marginTop: 2,
  },
  infoButton: {
    marginTop: 14,
    paddingVertical: 11,
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: '#F5F2EB',
    borderWidth: 1,
    borderColor: '#D5E0D5',
  },
  buttonPressed: {
    opacity: 0.82,
  },
  infoButtonText: {
    fontSize: 13,
    color: '#3E543E',
    fontWeight: '600',
  },
  panelContainer: {
    marginTop: 2,
  },
  modalBody: {
    fontSize: 14,
    color: '#4A5D4A',
    lineHeight: 21,
    marginBottom: 8,
  },
});
