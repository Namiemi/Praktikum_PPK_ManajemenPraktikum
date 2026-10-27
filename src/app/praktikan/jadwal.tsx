import { router } from 'expo-router';
import { useMemo } from 'react';
import { FlatList, SafeAreaView, StyleSheet } from 'react-native';

import { EmptyState } from '@/components/empty-state';
import { Sesi, SesiCard } from '@/components/sesi-card';

import { usePraktikum } from '@/context/praktikum-context';
import { bandingkanSesiJadwal } from '@/utils';

export default function JadwalPraktikanScreen() {
  const { currentUser, sesiList, hasPraktikanPresensi } = usePraktikum();

  const sesiPraktikan = useMemo(() => {
    const kelas = currentUser?.kelas;
    if (!kelas) {
      return [];
    }
    return sesiList
      .filter((sesi) => sesi.kelas === kelas)
      .sort(bandingkanSesiJadwal);
  }, [sesiList, currentUser?.kelas]);

  const dataSesi: Sesi[] = useMemo(
    () =>
      sesiPraktikan.map((sesi) => ({
        id: sesi.id,
        praktikum: sesi.mataKuliah,
        pertemuan: sesi.pertemuan,
        kelas: sesi.kelas,
        tanggal: sesi.tanggal,
        jamMulai: sesi.jamMulai,
        jamSelesai: sesi.jamSelesai,
        ruang: sesi.ruang,
        status:
          sesi.status === 'BELUM_DIBUKA'
            ? 'belum_dibuka'
            : sesi.status === 'DIBUKA'
              ? 'dibuka'
              : 'ditutup',
      })),
    [sesiPraktikan]
  );

  const renderItem = ({ item }: { item: Sesi }) => (
    <SesiCard
      sesi={item}
      onPress={() => router.push(`/sesi/${item.id}`)}
      hadir={
        currentUser ? hasPraktikanPresensi(item.id, currentUser.id) : false
      }
    />
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={dataSesi}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <EmptyState
            judul="Belum Ada Jadwal Praktikum"
            deskripsi="Belum ada sesi praktikum yang dijadwalkan untuk kelas Anda."
          />
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
  },
});
