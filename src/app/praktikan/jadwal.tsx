import { router } from 'expo-router';
import React, { useMemo } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/empty-state';
import { ErrorState } from '@/components/error-state';
import { HeaderBotanicalBlob } from '@/components/icons/praktikum-theme-icons';
import { LoadingState } from '@/components/loading-state';
import { SesiCard } from '@/components/sesi-card';
import { TabHeader } from '@/components/tab-header';
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
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.headerOrnament} pointerEvents="none">
        <HeaderBotanicalBlob width={160} height={115} />
      </View>

      <FlatList
        data={sesiTerurut}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <TabHeader
            userId={currentUser?.id}
            nama={currentUser?.nama ?? 'Praktikan'}
            title="Jadwal Praktikum"
            rightSlot={
              currentUser?.kelas ? (
                <View style={styles.kelasPill}>
                  <Text style={styles.kelasPillText}>
                    Kelas {currentUser.kelas}
                  </Text>
                </View>
              ) : undefined
            }
          />
        }
        ListEmptyComponent={
          belumTerdaftar ? (
            <EmptyState
              variant="schedule"
              judul="Belum Terdaftar di Kelas"
              deskripsi="Akun Anda belum dimasukkan ke kelas praktikum. Hubungi asisten pengampu."
            />
          ) : (
            <EmptyState
              variant="schedule"
              judul="Belum Ada Jadwal Praktikum"
              deskripsi="Belum ada sesi praktikum yang dijadwalkan untuk kelas Anda."
            />
          )
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
  kelasPill: {
    backgroundColor: '#E5EAD7',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
  },
  kelasPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2D3E2D',
  },
  cardWrapper: {
    marginBottom: 12,
  },
});
