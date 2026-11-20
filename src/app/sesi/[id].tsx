import { useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AsistenPanel } from '@/components/asisten-panel';
import { BottomSheet } from '@/components/bottom-sheet';
import { EmptyState } from '@/components/empty-state';
import { ErrorState } from '@/components/error-state';
import {
  CalendarIcon,
  CardCornerLeafOrnament,
  ClockIcon,
  MapPinIcon,
} from '@/components/icons/praktikum-theme-icons';
import { LoadingState } from '@/components/loading-state';
import { PraktikanPanel } from '@/components/praktikan-panel';
import { StatusBadge } from '@/components/status-badge';
import { Botanical } from '@/constants/theme';
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
      <View style={styles.emptyWrap}>
        <EmptyState
          judul="Sesi Tidak Ditemukan"
          deskripsi="Sesi ini sudah dihapus atau bukan bagian dari kelas Anda."
          variant="schedule"
        />
      </View>
    );
  }

  const isAsisten = currentUser?.peran === 'asisten';

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: 24 + insets.bottom },
      ]}
    >
      {/* Header Detail Sesi (FR-06) */}
      <View style={styles.headerCard}>
        <View style={styles.headerTop}>
          <Text style={styles.mataKuliah}>{sesi.mataKuliah}</Text>
          <StatusBadge status={sesi.status} />
        </View>

        <Text style={styles.topikTitle}>
          Pertemuan {sesi.pertemuan}: {sesi.topik}
        </Text>

        <View style={styles.divider} />

        <View style={styles.infoList}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Kelas</Text>
            <View style={styles.kelasPill}>
              <Text style={styles.kelasPillText}>Kelas {sesi.kelas}</Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <View style={styles.labelWithIcon}>
              <CalendarIcon size={13} color={Botanical.textMuted} />
              <Text style={styles.infoLabel}>Tanggal</Text>
            </View>
            <Text style={styles.infoValue}>{formatDateIndo(sesi.tanggal)}</Text>
          </View>
          <View style={styles.infoRow}>
            <View style={styles.labelWithIcon}>
              <ClockIcon size={13} color={Botanical.textMuted} />
              <Text style={styles.infoLabel}>Waktu</Text>
            </View>
            <Text style={styles.infoValue}>
              {sesi.jamMulai} - {sesi.jamSelesai} WIB
            </Text>
          </View>
          <View style={styles.infoRow}>
            <View style={styles.labelWithIcon}>
              <MapPinIcon size={13} color={Botanical.textMuted} />
              <Text style={styles.infoLabel}>Ruang</Text>
            </View>
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

        <View style={styles.cornerOrnament} pointerEvents="none">
          <CardCornerLeafOrnament width={68} height={68} />
        </View>
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
    backgroundColor: Botanical.canvas,
  },
  emptyWrap: {
    flex: 1,
    backgroundColor: Botanical.canvas,
  },
  content: {
    padding: 18,
  },
  headerCard: {
    backgroundColor: Botanical.surface,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: Botanical.border,
    marginBottom: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  mataKuliah: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    color: Botanical.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  topikTitle: {
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 24,
    color: Botanical.textPrimary,
    marginTop: 8,
  },
  divider: {
    height: 1,
    backgroundColor: Botanical.borderDivider,
    marginVertical: 14,
  },
  infoList: {
    gap: 10,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  labelWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoLabel: {
    fontSize: 13,
    color: Botanical.textMuted,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '600',
    color: Botanical.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  kelasPill: {
    backgroundColor: Botanical.sagePill,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
  },
  kelasPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: Botanical.primaryDark,
  },
  kodeContainer: {
    backgroundColor: Botanical.surfaceBeige,
    borderWidth: 1,
    borderColor: Botanical.border,
    padding: 12,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  kodeTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: Botanical.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  kodeNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: Botanical.textPrimary,
    letterSpacing: 3,
    fontVariant: ['tabular-nums'],
    marginTop: 2,
  },
  infoButton: {
    marginTop: 14,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: Botanical.surfaceWarm,
    borderWidth: 1,
    borderColor: Botanical.borderChip,
  },
  buttonPressed: {
    opacity: 0.82,
  },
  infoButtonText: {
    fontSize: 13,
    color: Botanical.chipActive,
    fontWeight: '600',
  },
  cornerOrnament: {
    position: 'absolute',
    right: 0,
    bottom: 0,
  },
  panelContainer: {
    marginTop: 2,
  },
  modalBody: {
    fontSize: 14,
    color: Botanical.textSecondary,
    lineHeight: 21,
    marginBottom: 8,
  },
});
