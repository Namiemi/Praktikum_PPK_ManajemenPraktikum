import { router } from 'expo-router';
import { useMemo } from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/empty-state';
import { ErrorState } from '@/components/error-state';
import { LoadingState } from '@/components/loading-state';
import { SesiCard } from '@/components/sesi-card';
import { usePraktikum } from '@/context/praktikum-context';
import { SesiPraktikum } from '@/types';
import { bandingkanSesiJadwal } from '@/utils';
import { getStatusKehadiran } from '@/utils/kehadiran';

export default function JadwalPraktikanScreen() {
  const { currentUser, sesiList, presensiList, izinList, loading, error, retry } =
    usePraktikum();

  // Sesi sudah dibatasi ke kelas praktikan oleh listener di PraktikumProvider.
  const sesiTerurut = useMemo(
    () => [...sesiList].sort(bandingkanSesiJadwal),
    [sesiList]
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
      <SesiCard
        sesi={item}
        onPress={() => router.push(`/sesi/${item.id}`)}
        tanda={status === 'hadir' || status === 'izin' ? status : undefined}
      />
    );
  };

  const belumTerdaftar = !currentUser?.kelasId;

  return (
    <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
      <FlatList
        data={sesiTerurut}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          belumTerdaftar ? (
            <EmptyState
              judul="Belum Terdaftar di Kelas"
              deskripsi="Akun Anda belum dimasukkan ke kelas praktikum. Hubungi asisten pengampu."
            />
          ) : (
            <EmptyState
              judul="Belum Ada Jadwal Praktikum"
              deskripsi="Belum ada sesi praktikum yang dijadwalkan untuk kelas Anda."
            />
          )
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  listContent: {
    flexGrow: 1,
    padding: 16,
    gap: 12,
  },
});
