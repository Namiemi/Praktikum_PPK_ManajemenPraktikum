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
import { usePraktikum } from '@/context/praktikum-context';
import { formatDateIndo } from '@/utils';

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

  const getStatusColor = () => {
    switch (sesi.status) {
      case 'DIBUKA':
        return { bg: '#e8f5e9', text: '#2e7d32', label: 'Dibuka' };
      case 'DITUTUP':
        return { bg: '#ffebee', text: '#c62828', label: 'Ditutup' };
      default:
        return { bg: '#f5f5f5', text: '#616161', label: 'Belum Dibuka' };
    }
  };

  const status = getStatusColor();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: styles.content.padding + insets.bottom },
      ]}>
      {/* Header Detail Sesi (FR-06) */}
      <View style={styles.headerCard}>
        <View style={styles.headerTop}>
          <Text style={styles.mataKuliah}>{sesi.mataKuliah}</Text>
          <View style={[styles.badge, { backgroundColor: status.bg }]}>
            <Text style={[styles.badgeText, { color: status.text }]}>
              {status.label}
            </Text>
          </View>
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
              <Text style={styles.kodeTitle}>Kode Presensi Aktif:</Text>
              <Text style={styles.kodeNumber}>{sesi.kodePresensi}</Text>
            </View>
          )}
        </View>

        <Pressable
          style={styles.infoButton}
          onPress={() => setModalCatatanOpen(true)}>
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
        onClose={() => setModalCatatanOpen(false)}>
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
    backgroundColor: '#f7f7f7',
  },
  content: {
    padding: 16,
  },
  headerCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e8e8e8',
    marginBottom: 16,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mataKuliah: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666666',
    textTransform: 'uppercase',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  topikTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111111',
    marginTop: 6,
  },
  divider: {
    height: 1,
    backgroundColor: '#eeeeee',
    marginVertical: 12,
  },
  infoList: {
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoLabel: {
    fontSize: 14,
    color: '#666666',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111111',
  },
  kodeContainer: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
    marginVertical: 4,
  },
  kodeTitle: {
    fontSize: 12,
    color: '#666666',
  },
  kodeNumber: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111111',
    letterSpacing: 2,
    marginTop: 2,
  },
  infoButton: {
    marginTop: 12,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#dddddd',
  },
  infoButtonText: {
    fontSize: 13,
    color: '#444444',
    fontWeight: '500',
  },
  panelContainer: {
    marginTop: 4,
  },
  modalBody: {
    fontSize: 14,
    color: '#444444',
    lineHeight: 20,
    marginBottom: 16,
  },
});
