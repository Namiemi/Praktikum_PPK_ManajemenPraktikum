import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';

import {
  BotanicalPageHeader,
  BotanicalScreenShell,
  FilterChipOption,
} from '@/components/botanical-header';
import { EmptyState } from '@/components/empty-state';
import { ErrorState } from '@/components/error-state';
import { LoadingState } from '@/components/loading-state';
import { SesiCard } from '@/components/sesi-card';
import { usePraktikum } from '@/context/praktikum-context';
import { FilterStatus } from '@/hooks/use-kelola-sesi';
import { SesiPraktikum } from '@/types';
import { bandingkanSesiJadwal } from '@/utils';
import { getStatusKehadiran } from '@/utils/kehadiran';

const FILTER_OPTIONS: FilterChipOption<FilterStatus>[] = [
  { value: 'SEMUA', label: 'Semua' },
  { value: 'DIBUKA', label: 'Dibuka' },
  { value: 'BELUM_DIBUKA', label: 'Belum Dibuka' },
  { value: 'DITUTUP', label: 'Ditutup' },
];

export default function JadwalPraktikanScreen() {
  const { currentUser, sesiList, presensiList, izinList, loading, error, retry } =
    usePraktikum();
  const [selectedFilter, setSelectedFilter] = useState<FilterStatus>('SEMUA');

  // Sesi sudah dibatasi ke kelas praktikan oleh listener di PraktikumProvider.
  const sesiTerurut = useMemo(
    () => [...sesiList].sort(bandingkanSesiJadwal),
    [sesiList]
  );

  const filteredSesi = useMemo(
    () =>
      selectedFilter === 'SEMUA'
        ? sesiTerurut
        : sesiTerurut.filter((s) => s.status === selectedFilter),
    [sesiTerurut, selectedFilter]
  );

  if (loading) {
    return <LoadingState pesan="Memuat jadwal praktikum..." />;
  }

  if (error) {
    return <ErrorState pesan={error} onRetry={retry} />;
  }

  const renderItem = ({ item }: { item: SesiPraktikum }) => {
    const status = getStatusKehadiran(
      item,
      presensiList.find((p) => p.sesiId === item.id),
      izinList.find((i) => i.sesiId === item.id)
    );
    return (
      <View style={styles.cardWrapper}>
        <SesiCard
          sesi={item}
          onPress={() => router.push(`/sesi/${item.id}`)}
          tanda={status === 'hadir' || status === 'izin' ? status : undefined}
        />
      </View>
    );
  };

  const belumTerdaftar = !currentUser?.kelasId;

  return (
    <BotanicalScreenShell>
      <FlatList
        data={filteredSesi}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <BotanicalPageHeader
            userId={currentUser?.id}
            userName={currentUser?.nama}
            peran="praktikan"
            title="Jadwal Praktikum"
            filterOptions={sesiTerurut.length > 0 ? FILTER_OPTIONS : undefined}
            selectedFilter={selectedFilter}
            onSelectFilter={setSelectedFilter}
          />
        }
        ListEmptyComponent={
          belumTerdaftar ? (
            <EmptyState
              judul="Belum Terdaftar di Kelas"
              deskripsi="Akun Anda belum dimasukkan ke kelas praktikum. Hubungi asisten pengampu."
              variant="schedule"
            />
          ) : (
            <EmptyState
              judul="Belum Ada Jadwal Sesi"
              deskripsi={
                sesiTerurut.length === 0
                  ? 'Belum ada sesi praktikum yang dijadwalkan untuk kelas Anda.'
                  : 'Tidak ada sesi praktikum dengan status filter yang dipilih.'
              }
              variant="schedule"
            />
          )
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
  cardWrapper: {
    marginBottom: 12,
  },
});
