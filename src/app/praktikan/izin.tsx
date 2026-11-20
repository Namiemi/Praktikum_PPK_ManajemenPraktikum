import { router } from 'expo-router';
import React, { useMemo } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/empty-state';
import { ErrorState } from '@/components/error-state';
import {
  HeaderBotanicalBlob,
  PlusIcon,
} from '@/components/icons/praktikum-theme-icons';
import { IzinCard } from '@/components/izin-card';
import { LoadingState } from '@/components/loading-state';
import { TabHeader } from '@/components/tab-header';
import { usePraktikum } from '@/context/praktikum-context';
import { bisaAjukanIzin } from '@/utils/kehadiran';

export default function IzinPraktikanScreen() {
  const { currentUser, sesiList, presensiList, izinList, loading, error, retry } =
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
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.headerOrnament} pointerEvents="none">
        <HeaderBotanicalBlob width={160} height={115} />
      </View>

      <FlatList
        data={izinTerurut}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.cardWrapper}>
            <IzinCard izin={item} />
          </View>
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <TabHeader
            userId={currentUser?.id}
            nama={currentUser?.nama ?? 'Praktikan'}
            title="Pengajuan Izin"
            rightSlot={
              <Pressable
                style={({ pressed }) => [
                  styles.addButton,
                  !adaSesiTersedia && styles.addButtonDisabled,
                  pressed && adaSesiTersedia && styles.pressed,
                ]}
                onPress={() => router.push('/izin/ajukan')}
                disabled={!adaSesiTersedia}
                accessibilityRole="button"
                accessibilityLabel="Ajukan izin baru"
                accessibilityState={{ disabled: !adaSesiTersedia }}
              >
                <PlusIcon size={14} color="#FFFFFF" />
                <Text style={styles.addButtonText}>Ajukan</Text>
              </Pressable>
            }
          >
            {!adaSesiTersedia ? (
              <View style={styles.infoNote}>
                <Text style={styles.infoNoteText}>
                  Tidak ada sesi yang bisa diajukan izin saat ini.
                </Text>
              </View>
            ) : null}
          </TabHeader>
        }
        ListEmptyComponent={
          <EmptyState
            variant="attendance"
            judul="Belum Ada Pengajuan Izin"
            deskripsi="Pengajuan izin yang Anda kirim akan tampil di sini beserta statusnya."
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
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#344E38',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  addButtonDisabled: {
    backgroundColor: '#C9CEC4',
  },
  addButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  pressed: {
    opacity: 0.82,
  },
  infoNote: {
    backgroundColor: '#F5F2EB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E6E4DD',
    paddingHorizontal: 12,
    paddingVertical: 9,
    marginTop: 12,
  },
  infoNoteText: {
    fontSize: 12,
    color: '#5A6B5A',
    textAlign: 'center',
  },
  cardWrapper: {
    marginBottom: 12,
  },
});
