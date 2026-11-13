import { router } from 'expo-router';
import { useMemo } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/empty-state';
import { ErrorState } from '@/components/error-state';
import { IzinCard } from '@/components/izin-card';
import { LoadingState } from '@/components/loading-state';
import { usePraktikum } from '@/context/praktikum-context';
import { bisaAjukanIzin } from '@/utils/kehadiran';

export default function IzinPraktikanScreen() {
  const { sesiList, presensiList, izinList, loading, error, retry } =
    usePraktikum();

  const izinTerurut = useMemo(
    () =>
      [...izinList].sort(
        (a, b) =>
          (b.diajukanPada?.getTime() ?? 0) - (a.diajukanPada?.getTime() ?? 0)
      ),
    [izinList]
  );

  const adaSesiTersedia = sesiList.some((s) =>
    bisaAjukanIzin(s, presensiList, izinList)
  );

  if (loading) {
    return <LoadingState pesan="Memuat pengajuan izin..." />;
  }

  if (error) {
    return <ErrorState pesan={error} onRetry={retry} />;
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
      <FlatList
        data={izinTerurut}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <IzinCard izin={item} />}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.header}>
            <Pressable
              style={({ pressed }) => [
                styles.tombol,
                !adaSesiTersedia && styles.tombolDisabled,
                pressed && styles.tombolPressed,
              ]}
              onPress={() => router.push('/izin/ajukan')}
              disabled={!adaSesiTersedia}
              accessibilityRole="button"
              accessibilityLabel="Ajukan izin baru"
              accessibilityState={{ disabled: !adaSesiTersedia }}
            >
              <Text style={styles.tombolText}>+ Ajukan Izin</Text>
            </Pressable>
            {!adaSesiTersedia ? (
              <Text style={styles.headerInfo}>
                Tidak ada sesi yang bisa diajukan izin saat ini.
              </Text>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            judul="Belum Ada Pengajuan Izin"
            deskripsi="Pengajuan izin yang Anda kirim akan tampil di sini beserta statusnya."
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
    backgroundColor: '#FFFFFF',
  },
  listContent: {
    flexGrow: 1,
    padding: 16,
    gap: 12,
  },
  header: {
    marginBottom: 4,
  },
  tombol: {
    backgroundColor: '#2D3E2D',
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tombolDisabled: {
    backgroundColor: '#C9CEC4',
  },
  tombolPressed: {
    opacity: 0.85,
  },
  tombolText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  headerInfo: {
    fontSize: 12,
    color: '#5A6B5A',
    textAlign: 'center',
    marginTop: 6,
  },
});
