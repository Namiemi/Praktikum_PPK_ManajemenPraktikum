import { router, Stack, useLocalSearchParams } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomSheet } from '@/components/bottom-sheet';
import { EmptyState } from '@/components/empty-state';
import { ErrorState } from '@/components/error-state';
import { IzinForm } from '@/components/izin-form';
import { LoadingState } from '@/components/loading-state';
import { usePraktikum } from '@/context/praktikum-context';
import { Izin } from '@/types';
import { bandingkanSesiJadwal } from '@/utils';
import { bisaAjukanIzin } from '@/utils/kehadiran';

export default function AjukanIzinScreen() {
  const { sesiId } = useLocalSearchParams<{ sesiId?: string }>();
  const { currentUser, sesiList, presensiList, izinList, loading, error, retry } =
    usePraktikum();
  const insets = useSafeAreaInsets();
  const [izinBaru, setIzinBaru] = useState<Izin | null>(null);

  const sesiPilihan = useMemo(
    () =>
      sesiList
        .filter((s) => bisaAjukanIzin(s, presensiList, izinList))
        .sort(bandingkanSesiJadwal),
    [sesiList, presensiList, izinList]
  );

  const tutupSukses = () => {
    setIzinBaru(null);
    router.back();
  };

  let konten: React.ReactNode;
  if (currentUser?.peran !== 'praktikan') {
    konten = (
      <EmptyState
        judul="Khusus Praktikan"
        deskripsi="Pengajuan izin hanya dapat dilakukan oleh praktikan."
      />
    );
  } else if (loading) {
    konten = <LoadingState pesan="Memuat sesi praktikum..." />;
  } else if (error) {
    konten = <ErrorState pesan={error} onRetry={retry} />;
  } else if (sesiPilihan.length === 0 && !izinBaru) {
    konten = (
      <EmptyState
        judul="Tidak Ada Sesi"
        deskripsi="Semua sesi sudah ditutup, sudah Anda hadiri, atau sudah diajukan izin."
      />
    );
  } else {
    konten = (
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: 16 + insets.bottom }]}
          keyboardShouldPersistTaps="handled"
        >
          <IzinForm
            sesiPilihan={sesiPilihan}
            sesiIdAwal={sesiId}
            onSuccess={setIzinBaru}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  return (
    <View style={styles.flex}>
      <Stack.Screen options={{ title: 'Ajukan Izin', headerBackTitle: 'Kembali' }} />
      {konten}

      <BottomSheet
        visible={izinBaru !== null}
        onClose={tutupSukses}
        title="Izin Terkirim"
        closeText="Selesai"
      >
        <View style={styles.sheetBody}>
          <Text style={styles.sheetJudul}>{izinBaru?.sesiLabel}</Text>
          <Text style={styles.sheetInfo}>
            Status pengajuan: Menunggu keputusan asisten.
          </Text>
          <Text style={styles.sheetAI}>
            {izinBaru?.statusAI === 'berhasil'
              ? `Sentimen AI: ${izinBaru.kategoriAI}`
              : 'Klasifikasi AI tidak tersedia untuk alasan ini.'}
          </Text>
        </View>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    padding: 16,
  },
  sheetBody: {
    alignItems: 'center',
    paddingVertical: 8,
    gap: 4,
  },
  sheetJudul: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1C281C',
    textAlign: 'center',
  },
  sheetInfo: {
    fontSize: 13,
    color: '#5A6B5A',
    textAlign: 'center',
  },
  sheetAI: {
    fontSize: 13,
    fontWeight: '600',
    color: '#3A4D3A',
    marginTop: 4,
  },
});
