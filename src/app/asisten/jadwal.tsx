import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AsistenSesiCard } from '@/components/asisten-sesi-card';
import { AsistenAvatar } from '@/components/icons/asisten-avatar';
import {
  EmptyScheduleIllustration,
  HeaderBotanicalBlob,
} from '@/components/icons/praktikum-theme-icons';
import { usePraktikum } from '@/context/praktikum-context';
import { StatusSesi } from '@/types';

type FilterStatus = 'SEMUA' | StatusSesi;

const FILTER_OPTIONS: { value: FilterStatus; label: string }[] = [
  { value: 'SEMUA', label: 'Semua' },
  { value: 'DIBUKA', label: 'Dibuka' },
  { value: 'BELUM_DIBUKA', label: 'Belum Dibuka' },
  { value: 'DITUTUP', label: 'Ditutup' },
];

export default function JadwalAsistenScreen() {
  const { currentUser, sesiList } = usePraktikum();
  const [selectedFilter, setSelectedFilter] = useState<FilterStatus>('SEMUA');

  // ponytail: derived state langsung tanpa sinkronisasi useEffect
  const sesiMilikAsisten = sesiList
    .filter((s) => s.asistenId === currentUser?.id)
    .sort((a, b) =>
      `${a.tanggal}-${a.jamMulai}`.localeCompare(`${b.tanggal}-${b.jamMulai}`)
    );

  const filteredSesi =
    selectedFilter === 'SEMUA'
      ? sesiMilikAsisten
      : sesiMilikAsisten.filter((s) => s.status === selectedFilter);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.headerOrnament} pointerEvents="none">
        <HeaderBotanicalBlob width={160} height={115} />
      </View>

      <FlatList
        data={filteredSesi}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.headerSection}>
            <View style={styles.profileRow}>
              <AsistenAvatar
                userId={currentUser?.id}
                nama={currentUser?.nama}
                size={38}
              />
              <Text style={styles.profileName}>
                {currentUser?.nama ?? 'Asisten Praktikum'}
              </Text>
            </View>

            <Text style={styles.pageTitle}>Jadwal Praktikum</Text>

            {sesiMilikAsisten.length > 0 && (
              <View style={styles.chipRow}>
                {FILTER_OPTIONS.map((chip) => {
                  const isActive = selectedFilter === chip.value;
                  return (
                    <Pressable
                      key={chip.value}
                      style={[
                        styles.chip,
                        isActive ? styles.chipActive : styles.chipInactive,
                      ]}
                      onPress={() => setSelectedFilter(chip.value)}
                      accessibilityRole="button"
                      accessibilityState={{ selected: isActive }}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          isActive
                            ? styles.chipTextActive
                            : styles.chipTextInactive,
                        ]}
                      >
                        {chip.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            )}
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.cardWrapper}>
            <AsistenSesiCard
              sesi={item}
              onPress={() => router.push(`/sesi/${item.id}`)}
            />
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <EmptyScheduleIllustration width={205} height={186} />
            <Text style={styles.emptyTitle}>Belum Ada Jadwal Sesi</Text>
            <Text style={styles.emptyDescription}>
              {sesiMilikAsisten.length === 0
                ? 'Anda tidak memiliki jadwal\npraktikum yang aktif saat ini.'
                : 'Tidak ada sesi praktikum dengan\nstatus filter yang dipilih.'}
            </Text>
          </View>
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
  headerSection: {
    marginBottom: 16,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  profileName: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
    color: '#2E3E2E',
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 28,
    color: '#1C281C',
    letterSpacing: -0.5,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 14,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
  },
  chipActive: {
    backgroundColor: '#3E543E',
  },
  chipInactive: {
    backgroundColor: '#F5F2EB',
    borderWidth: 1,
    borderColor: '#D5E0D5',
  },
  chipText: {
    fontSize: 12,
    lineHeight: 16,
  },
  chipTextActive: {
    fontWeight: '600',
    color: '#FFFFFF',
  },
  chipTextInactive: {
    fontWeight: '500',
    color: '#3E543E',
  },
  cardWrapper: {
    marginBottom: 12,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 36,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
    color: '#1C281C',
    textAlign: 'center',
    marginTop: 12,
  },
  emptyDescription: {
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 19,
    color: '#5A6B5A',
    textAlign: 'center',
    paddingHorizontal: 16,
    marginTop: 6,
  },
});
