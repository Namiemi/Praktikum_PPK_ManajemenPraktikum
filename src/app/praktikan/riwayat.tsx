import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/empty-state';
import { ErrorState } from '@/components/error-state';
import {
  CalendarIcon,
  CardCornerLeafOrnament,
  ClockIcon,
  HeaderBotanicalBlob,
} from '@/components/icons/praktikum-theme-icons';
import { LoadingState } from '@/components/loading-state';
import { TabHeader } from '@/components/tab-header';
import { usePraktikum } from '@/context/praktikum-context';
import { SesiPraktikum } from '@/types';
import { formatDateIndo } from '@/utils';
import { getStatusKehadiran, StatusKehadiran } from '@/utils/kehadiran';

interface ItemRiwayat {
  sesi: SesiPraktikum;
  status: StatusKehadiran;
  keterangan: string;
}

const STATUS_BADGE_MAP: Record<
  StatusKehadiran,
  { label: string; bg: string; text: string }
> = {
  hadir: { label: 'HADIR', bg: '#C8D7B8', text: '#1C281C' },
  izin: { label: 'IZIN', bg: '#EFE6CD', text: '#5A4922' },
  tidak_hadir: { label: 'TIDAK HADIR', bg: '#F4DFDA', text: '#9E3B2B' },
  menunggu: { label: 'MENUNGGU', bg: '#EAE8E1', text: '#5A6B5A' },
};

export default function RiwayatPraktikanScreen() {
  const { currentUser, sesiList, presensiList, izinList, loading, error, retry } =
    usePraktikum();

  if (loading) {
    return <LoadingState pesan="Memuat riwayat kehadiran..." />;
  }

  if (error) {
    return <ErrorState pesan={error} onRetry={retry} />;
  }

  // Sesi dan presensi sudah dibatasi ke kelas dan akun praktikan oleh PraktikumProvider.
  const daftar: ItemRiwayat[] = sesiList
    .map((sesi) => {
      const pres = presensiList.find((p) => p.sesiId === sesi.id);
      const status = getStatusKehadiran(
        sesi,
        pres,
        izinList.find((i) => i.sesiId === sesi.id)
      );
      const keterangan =
        status === 'hadir'
          ? `Tercatat pukul ${pres?.waktuPresensi} WIB`
          : status === 'izin'
            ? 'Izin diterima'
            : status === 'menunggu'
              ? sesi.status === 'DIBUKA'
                ? 'Sesi sedang dibuka'
                : 'Belum dimulai'
              : '';
      return { sesi, status, keterangan };
    })
    .sort((a, b) =>
      `${b.sesi.tanggal}-${b.sesi.jamMulai}`.localeCompare(
        `${a.sesi.tanggal}-${a.sesi.jamMulai}`
      )
    );

  const hadirCount = daftar.filter((item) => item.status === 'hadir').length;
  const izinCount = daftar.filter((item) => item.status === 'izin').length;
  const totalSesi = daftar.filter((item) => item.status !== 'menunggu').length;
  const persentase =
    totalSesi > 0 ? Math.min(100, Math.round((hadirCount / totalSesi) * 100)) : 0;

  const renderItem = ({ item }: { item: ItemRiwayat }) => {
    const badge = STATUS_BADGE_MAP[item.status];

    return (
      <View style={styles.itemCard}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.itemMataKuliah} numberOfLines={2}>
            {item.sesi.mataKuliah} · Pertemuan {item.sesi.pertemuan}
          </Text>
          <View style={[styles.chip, { backgroundColor: badge.bg }]}>
            <Text style={[styles.chipText, { color: badge.text }]}>
              {badge.label}
            </Text>
          </View>
        </View>

        <View style={styles.metaList}>
          <View style={styles.metaRow}>
            <CalendarIcon size={13} color="#5A6B5A" />
            <Text style={styles.metaText}>
              {formatDateIndo(item.sesi.tanggal)} ({item.sesi.jamMulai} -{' '}
              {item.sesi.jamSelesai} WIB)
            </Text>
          </View>

          {item.keterangan ? (
            <View style={styles.metaRow}>
              <ClockIcon size={13} color="#5A6B5A" />
              <Text style={styles.metaText}>{item.keterangan}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.cornerOrnament} pointerEvents="none">
          <CardCornerLeafOrnament width={64} height={64} />
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.headerOrnament} pointerEvents="none">
        <HeaderBotanicalBlob width={160} height={115} />
      </View>

      <FlatList
        data={daftar}
        keyExtractor={(item) => item.sesi.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <TabHeader
            userId={currentUser?.id}
            nama={currentUser?.nama ?? 'Praktikan'}
            title="Riwayat Kehadiran"
          >
            <View style={styles.summaryCard}>
              <View style={styles.counterRow}>
                <Text style={styles.counterPrimary}>{hadirCount}</Text>
                <Text style={styles.counterSecondary}>
                  {' '}
                  / {totalSesi} Sesi Hadir
                  {izinCount > 0 ? ` • ${izinCount} Izin` : ''}
                </Text>
              </View>

              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${persentase}%` }]} />
              </View>
            </View>
          </TabHeader>
        }
        ListEmptyComponent={
          <EmptyState
            variant="attendance"
            judul="Belum Ada Riwayat Praktikum"
            deskripsi="Belum ada sesi praktikum untuk kelas Anda."
          />
        }
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
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E6E4DD',
    padding: 18,
    marginTop: 14,
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  counterPrimary: {
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 26,
    color: '#1C281C',
    fontVariant: ['tabular-nums'],
  },
  counterSecondary: {
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
    color: '#5A6B5A',
  },
  progressTrack: {
    height: 8,
    backgroundColor: '#E2E8DF',
    borderRadius: 999,
    overflow: 'hidden',
    marginTop: 10,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4A6B4A',
    borderRadius: 999,
  },
  itemCard: {
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
  itemMataKuliah: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
    color: '#1C281C',
  },
  chip: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  chipText: {
    fontSize: 10,
    fontWeight: '700',
    lineHeight: 14,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  metaList: {
    marginTop: 8,
    gap: 5,
    paddingRight: 44,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
    color: '#5A6B5A',
    fontVariant: ['tabular-nums'],
  },
  cornerOrnament: {
    position: 'absolute',
    right: 0,
    bottom: 0,
  },
});
