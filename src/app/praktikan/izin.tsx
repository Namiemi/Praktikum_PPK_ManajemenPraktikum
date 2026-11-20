import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import {
  BotanicalPageHeader,
  BotanicalScreenShell,
  FilterChipOption,
} from '@/components/botanical-header';
import { EmptyState } from '@/components/empty-state';
import { ErrorState } from '@/components/error-state';
import { PlusIcon } from '@/components/icons/praktikum-theme-icons';
import { IzinCard } from '@/components/izin-card';
import { LoadingState } from '@/components/loading-state';
import { Botanical } from '@/constants/theme';
import { usePraktikum } from '@/context/praktikum-context';
import { FilterStatusIzin } from '@/hooks/use-kelola-izin';
import { bisaAjukanIzin } from '@/utils/kehadiran';

const FILTER_OPTIONS: FilterChipOption<FilterStatusIzin>[] = [
  { value: 'SEMUA', label: 'Semua' },
  { value: 'menunggu', label: 'Menunggu' },
  { value: 'diterima', label: 'Diterima' },
  { value: 'ditolak', label: 'Ditolak' },
];

export default function IzinPraktikanScreen() {
  const { currentUser, sesiList, presensiList, izinList, loading, error, retry } =
    usePraktikum();
  const [selectedFilter, setSelectedFilter] =
    useState<FilterStatusIzin>('SEMUA');

  const izinTerurut = useMemo(
    () =>
      [...izinList].sort(
        (a, b) =>
          (b.diajukanPada?.getTime() ?? 0) - (a.diajukanPada?.getTime() ?? 0)
      ),
    [izinList]
  );

  const filteredIzin = useMemo(
    () =>
      selectedFilter === 'SEMUA'
        ? izinTerurut
        : izinTerurut.filter((item) => item.status === selectedFilter),
    [izinTerurut, selectedFilter]
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
    <BotanicalScreenShell>
      <FlatList
        data={filteredIzin}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.cardWrapper}>
            <IzinCard izin={item} />
          </View>
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View>
            <BotanicalPageHeader
              userId={currentUser?.id}
              userName={currentUser?.nama}
              peran="praktikan"
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
                  <Text style={styles.addButtonText}>Izin</Text>
                </Pressable>
              }
              filterOptions={
                izinTerurut.length > 0 ? FILTER_OPTIONS : undefined
              }
              selectedFilter={selectedFilter}
              onSelectFilter={setSelectedFilter}
            />

            {!adaSesiTersedia ? (
              <View style={styles.infoNotice}>
                <Text style={styles.headerInfo}>
                  Tidak ada sesi yang bisa diajukan izin saat ini.
                </Text>
              </View>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            judul="Belum Ada Pengajuan Izin"
            deskripsi={
              izinTerurut.length === 0
                ? 'Pengajuan izin yang Anda kirim akan tampil di sini beserta statusnya.'
                : 'Tidak ada pengajuan izin dengan status filter yang dipilih.'
            }
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
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Botanical.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  addButtonDisabled: {
    backgroundColor: Botanical.disabled,
  },
  addButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  pressed: {
    opacity: 0.82,
  },
  infoNotice: {
    backgroundColor: Botanical.surfaceWarm,
    borderWidth: 1,
    borderColor: Botanical.borderChip,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 14,
  },
  headerInfo: {
    fontSize: 12,
    color: Botanical.textMuted,
    textAlign: 'center',
  },
  cardWrapper: {
    marginBottom: 12,
  },
});
