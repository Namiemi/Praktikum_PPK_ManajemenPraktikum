import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

import {
  BotanicalPageHeader,
  BotanicalScreenShell,
} from '@/components/botanical-header';
import { EmptyState } from '@/components/empty-state';
import { ErrorState } from '@/components/error-state';
import {
  CalendarIcon,
  CardCornerLeafOrnament,
  ClockIcon,
} from '@/components/icons/praktikum-theme-icons';
import { LoadingState } from '@/components/loading-state';
import { StatusBadge } from '@/components/status-badge';
import { Botanical } from '@/constants/theme';
import { usePraktikum } from '@/context/praktikum-context';
import { SesiPraktikum } from '@/types';
import { formatDateIndo } from '@/utils';
import { getStatusKehadiran, StatusKehadiran } from '@/utils/kehadiran';

interface ItemRiwayat {
  sesi: SesiPraktikum;
  status: StatusKehadiran;
  keterangan: string;
}

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
          ? `Pukul ${pres?.waktuPresensi} WIB`
          : status === 'izin'
            ? 'Izin diterima'
            : status === 'menunggu'
              ? sesi.status === 'DIBUKA'
                ? 'Sesi sedang dibuka'
                : 'Belum dimulai'
              : 'Tidak hadir';
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
    return (
      <View style={styles.itemCard}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.itemMataKuliah} numberOfLines={2}>
            {item.sesi.mataKuliah} - Kelas {item.sesi.kelas}
          </Text>
          <View style={styles.kelasCircle}>
            <Text style={styles.kelasCircleText}>{item.sesi.kelas}</Text>
          </View>
        </View>

        <Text style={styles.topikText} numberOfLines={1}>
          Pertemuan {item.sesi.pertemuan}: {item.sesi.topik}
        </Text>

        <View style={styles.metaRow}>
          <CalendarIcon size={13} color={Botanical.textMuted} />
          <Text style={styles.itemMeta}>
            {formatDateIndo(item.sesi.tanggal)} ({item.sesi.jamMulai} -{' '}
            {item.sesi.jamSelesai} WIB)
          </Text>
        </View>

        <View style={styles.footerRow}>
          <StatusBadge status={item.status} />
          <View style={styles.keteranganRow}>
            <ClockIcon size={12} color={Botanical.textMuted} />
            <Text style={styles.itemKeterangan}>{item.keterangan}</Text>
          </View>
        </View>

        <View style={styles.cornerOrnament} pointerEvents="none">
          <CardCornerLeafOrnament width={68} height={68} />
        </View>
      </View>
    );
  };

  return (
    <BotanicalScreenShell>
      <FlatList
        data={daftar}
        keyExtractor={(item) => item.sesi.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View>
            <BotanicalPageHeader
              userId={currentUser?.id}
              userName={currentUser?.nama}
              peran="praktikan"
              title="Riwayat Kehadiran"
            />

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
                <View
                  style={[styles.progressFill, { width: `${persentase}%` }]}
                />
              </View>

              <View style={styles.cornerOrnament} pointerEvents="none">
                <CardCornerLeafOrnament width={64} height={64} />
              </View>
            </View>
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            judul="Belum Ada Riwayat Praktikum"
            deskripsi="Belum ada sesi praktikum untuk kelas Anda."
            variant="attendance"
          />
        }
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
  summaryCard: {
    backgroundColor: Botanical.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Botanical.border,
    padding: 18,
    marginBottom: 14,
    overflow: 'hidden',
    position: 'relative',
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  counterPrimary: {
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 28,
    color: Botanical.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  counterSecondary: {
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
    color: Botanical.textMuted,
  },
  progressTrack: {
    height: 8,
    backgroundColor: Botanical.progressTrack,
    borderRadius: 999,
    overflow: 'hidden',
    marginTop: 10,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Botanical.progressFill,
    borderRadius: 999,
  },
  itemCard: {
    backgroundColor: Botanical.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Botanical.border,
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
    color: Botanical.textPrimary,
  },
  kelasCircle: {
    minWidth: 22,
    height: 22,
    paddingHorizontal: 6,
    borderRadius: 11,
    backgroundColor: Botanical.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kelasCircleText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  topikText: {
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
    color: Botanical.textSecondary,
    marginTop: 3,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 6,
    paddingRight: 44,
  },
  itemMeta: {
    fontSize: 12,
    color: Botanical.textMuted,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 10,
    paddingRight: 48,
    flexWrap: 'wrap',
  },
  keteranganRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  itemKeterangan: {
    fontSize: 12,
    fontWeight: '500',
    color: Botanical.textMuted,
    fontVariant: ['tabular-nums'],
  },
  cornerOrnament: {
    position: 'absolute',
    right: 0,
    bottom: 0,
  },
});
